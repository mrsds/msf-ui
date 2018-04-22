import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "material-ui/Button";
import * as featureDetailActions from "actions/featureDetailActions";
import Typography from "material-ui/Typography";
import Grid from "material-ui/Grid";
import Card, { CardActions, CardContent, CardMedia } from "material-ui/Card";
import MetadataUtil from "utils/MetadataUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";
import PlumeChartingContainer from "components/FeatureDetail/PlumeChartingContainer";
import InfrastructureChartingContainer from "components/FeatureDetail/InfrastructureChartingContainer";

export class FeatureDetailContainer extends Component {
    // getCategory() {
    //     try {
    //         console.dir(this.props.feature.get("metadata").toJS());
    //         return this.props.feature
    //             .get("metadata")
    //             .find(val => val.get("name").toLowerCase() === "category")
    //             .get("value");
    //     } catch (e) {
    //         return "(no category)";
    //     }
    // }

    truncateField(str, limit) {
        const stripped = str.replace(/(\s*$)/, "");
        return stripped.substring(0, limit - 3) + "...";
    }

    makeInfoFields(fieldInfo) {
        const fields = fieldInfo.map(field => {
            const unit = field.unit ? `(${field.unit})` : null;
            const value = field.value;
            if (field.subtitle) {
                return (
                    <div key={field.name + field.subtitle}>
                        <label className={styles.stacked}>
                            <span className={styles.main}>{field.name}</span>
                            <span className={styles.sub}>{field.subtitle}</span>
                        </label>
                        <span>{value}</span>
                    </div>
                );
            }
            return (
                <div key={field.name}>
                    <label>
                        {field.name} {unit}
                    </label>
                    <span>{value}</span>
                </div>
            );
        });
        return <div className={styles.infoBox}>{fields}</div>;
    }

    renderFeatureDetailContainer(headerImageUrl, title, subtitle, featureBody) {
        let featureDetailContainerClasses = MiscUtil.generateStringFromSet({
            [styles.featureDetailContainer]: true,
            [styles.fullWidth]: this.props.layerSidebarCollapsed
        });
        let featureDetailClasses = MiscUtil.generateStringFromSet({
            [styles.maxWidth]: true,
            [styles.featureDetailBody]: true
        });
        return (
            <div className={featureDetailContainerClasses}>
                <Button
                    className={styles.floatingBackButton}
                    variant="raised"
                    onClick={this.props.hideFeatureDetailContainer}
                >
                    Back to Map
                </Button>
                <div
                    className={styles.headerImage}
                    style={{ backgroundImage: `url("${headerImageUrl}")` }}
                />
                <div className={styles.header}>
                    <div className={styles.maxWidth}>
                        <h2 className={styles.headerTitle}>{title}</h2>
                        <p className={styles.headerSubtitle}>{subtitle}</p>
                    </div>
                </div>
                <div className={featureDetailClasses}>{featureBody}</div>
            </div>
        );
    }

    makeInfrastructureDetail() {
        if (!this.props.feature.size) return null;

        // Get all the properties we'll be using later on using metadata searches
        const name = this.props.feature.get("name");
        const category = this.props.feature.get("category");
        const city = MetadataUtil.getCity(this.props.feature, null);
        const county = MetadataUtil.getCounty(this.props.feature, null);
        const state = MetadataUtil.getState(this.props.feature, null);
        const lat = MetadataUtil.getLat(this.props.feature, null);
        const long = MetadataUtil.getLong(this.props.feature, null);
        const address = MetadataUtil.getAddress(this.props.feature, null);
        const sector = MetadataUtil.getFacilityTypeName(this.props.feature, "(no sector name)");
        let googleMapsUri = "";
        let googleMapsStaticImgUrl = "./styles/resources/img/fake_info_img.png";
        if (lat && long) {
            googleMapsUri = `http://maps.google.com/maps?t=k&q=loc:${lat},${long}`;
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        } else if (address) {
            googleMapsUri = `http://maps.google.com/maps?t=k&q=loc:${address}`;
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${address}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        }
        const areaSqMi = MetadataUtil.getAreaSqMi(this.props.feature, "(no area)");

        // Bin together the various field:value pairs
        const facilityOverviewFields = [
            { name: "Site", value: MetadataUtil.getSiteName(this.props.feature, "(no site name)") },
            {
                name: "Facility Type",
                value: sector
            },
            {
                name: "Operator",
                value: MetadataUtil.getOperatorName(this.props.feature, "(no operator name)")
            },
            {
                name: "Location",
                value: lat && long ? `${lat}°N, ${long}°W` : "(no location)"
            },
            {
                name: "Facility Address",
                value: `${address || "(no address)"}, ${city || "(no city)"}, ${state ||
                    "(no state)"}`,
                unit: null
            },
            { name: "Number of Flyovers", value: this.props.feature.get("flyoverCount") }
        ];

        let featureTitle = name;
        let featureSubtitle = `${sector} · ${city}, ${state}`;
        let featureHeaderImage = googleMapsStaticImgUrl;
        let featureBody = (
            <div>
                <Card className={styles.cardRoot}>
                    <CardContent>
                        <Typography variant="headline" component="h2">
                            Facility Overview
                        </Typography>
                        {this.makeInfoFields(facilityOverviewFields)}
                    </CardContent>
                    <CardActions>
                        <Button
                            color="primary"
                            href={googleMapsUri}
                            target="_blank"
                            disabled={!googleMapsUri}
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <Card className={styles.cardRoot}>
                    <CardContent>
                        <Typography variant="headline" component="h2">
                            VISTA Facility Metadata
                        </Typography>
                        {this.makeInfoFields(
                            this.props.feature
                                .get("metadata")
                                .sortBy(x => x.get("name"))
                                // Omitting metadata fields that begin with "L"
                                .filter(x => x.get("name").charAt(0) !== "L")
                                .toJS()
                        )}
                    </CardContent>
                </Card>
                <InfrastructureChartingContainer />
            </div>
        );

        return this.renderFeatureDetailContainer(
            featureHeaderImage,
            featureTitle,
            featureSubtitle,
            featureBody
        );
    }

    makePlumeDetail() {
        if (!this.props.feature.size) return null;

        // Get all the properties we'll be using later on using metadata searches
        const name = this.props.feature.get("name");
        const category = this.props.feature.get("category");
        const city = MetadataUtil.getCity(this.props.feature, null);
        const county = MetadataUtil.getCounty(this.props.feature, null);
        const state = MetadataUtil.getState(this.props.feature, null);
        const lat = MetadataUtil.getLat(this.props.feature, null);
        const long = MetadataUtil.getLong(this.props.feature, null);

        const googleMapsUri =
            lat && long ? `http://maps.google.com/maps?t=k&q=loc:${lat},${long}` : null;
        let googleMapsStaticImgUrl = "./styles/resources/img/fake_info_img.png";
        if (lat && long) {
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        }

        const areaSqMi = MetadataUtil.getAreaSqMi(this.props.feature, null);
        const datetime = this.props.feature.get("datetime");
        const dateString = datetime
            ? moment(datetime).format("MMMM Do, YYYY, H:mm [UTC]")
            : "(No Date)";

        // Bin together the various field:value pairs
        const plumeDataFields = [
            { name: "Candidate ID", value: MetadataUtil.getCandidateID(this.props.feature, null) },
            { name: "Location", value: lat && long ? `${lat}°N, ${long}°W` : "(No Location)" },
            { name: "Plume ID", value: MetadataUtil.getPlumeID(this.props.feature, null) },
            { name: "IME", unit: "kg", value: MetadataUtil.getIME(this.props.feature, "20", null) },
            { name: "Source ID", value: MetadataUtil.getSourceID(this.props.feature, null) },
            {
                name: "Fetch",
                unit: "m",
                value: MetadataUtil.getFetch(this.props.feature, "20", null)
            }
        ];

        let featureTitle = dateString;
        let featureSubtitle = name;
        let featureHeaderImage = googleMapsStaticImgUrl;
        let featureBody = (
            <div>
                <Card className={styles.cardRoot}>
                    <CardContent>
                        <Typography variant="headline" component="h2">
                            Observation Data
                        </Typography>
                        {this.makeInfoFields(plumeDataFields)}
                    </CardContent>
                    <CardActions>
                        <Button
                            color="primary"
                            href={googleMapsUri}
                            target="_blank"
                            disabled={!googleMapsUri}
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <div className={styles.imageCardsContainer}>
                    <Grid container spacing={16}>
                        <Grid item xs>
                            <Card className={styles.cardRoot}>
                                <CardContent className={styles.noPadding}>
                                    <Typography variant="headline" component="h2">
                                        Observation Methane Plume Imagery
                                    </Typography>
                                    <div className={styles.observationImage}>
                                        <img src={this.props.feature.get("rgbqlctr_url")} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs>
                            <Card className={styles.cardRoot}>
                                <CardContent className={styles.noPadding}>
                                    <Typography variant="headline" component="h2">
                                        Observation RGB Imagery
                                    </Typography>
                                    <div className={styles.observationImage}>
                                        <img src={this.props.feature.get("png_url")} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </div>
                <PlumeChartingContainer />
            </div>
        );

        return this.renderFeatureDetailContainer(
            featureHeaderImage,
            featureTitle,
            featureSubtitle,
            featureBody
        );
    }

    render() {
        switch (this.props.category) {
            case layerSidebarTypes.CATEGORY_INFRASTRUCTURE: {
                return this.makeInfrastructureDetail();
            }
            case layerSidebarTypes.CATEGORY_PLUMES:
                return this.makePlumeDetail();
            default:
                return null;
        }
    }
}

FeatureDetailContainer.propTypes = {
    category: PropTypes.string,
    layerSidebarCollapsed: PropTypes.bool.isRequired,
    feature: PropTypes.object,
    hideFeatureDetailContainer: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        category: state.featureDetail.get("category"),
        layerSidebarCollapsed: state.layerSidebar.get("layerSidebarCollapsed"),
        feature: state.featureDetail.get("feature")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        hideFeatureDetailContainer: bindActionCreators(
            featureDetailActions.hideFeatureDetailContainer,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureDetailContainer);
