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
import styles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";

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

    makeInfoFields(fieldInfo) {
        const fields = fieldInfo.map(field => {
            const unit = field.unit ? <unit>{" " + field.unit}</unit> : null;
            if (field.subtitle) {
                return (
                    <div key={field.name + field.subtitle}>
                        <label className={styles.stacked}>
                            <span className={styles.main}>{field.name}</span>
                            <span className={styles.sub}>{field.subtitle}</span>
                        </label>
                        <span>
                            {field.value}
                            {unit}
                        </span>
                    </div>
                );
            }
            return (
                <div key={field.name}>
                    <label>{field.name}</label>
                    <span>
                        {field.value}
                        {unit}
                    </span>
                </div>
            );
        });
        return <div className={styles.infoBox}>{fields}</div>;
    }

    renderFeatureDetailContainer(headerImageUrl, title, subtitle, featureBody) {
        return (
            <div className={styles.featureDetailContainer}>
                <Button
                    raised
                    className={styles.floatingBackButton}
                    onClick={this.props.hideFeatureDetailContainer}
                >
                    Back to Map
                </Button>
                <div
                    className={styles.headerImage}
                    style={{ backgroundImage: `url("${headerImageUrl}")` }}
                />
                <div className={styles.header}>
                    <h2 className={styles.headerTitle}>{title}</h2>
                    <p className={styles.headerSubtitle}>{subtitle}</p>
                </div>
                <div className={styles.featureDetailBody}>{featureBody}</div>
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
        let googleMapsUri = "";
        let googleMapsStaticImgUrl = "./styles/resources/img/fake_info_img.png";
        if (lat && long) {
            googleMapsUri = `http://maps.google.com/maps?q=${lat},${long}`;
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        } else if (address) {
            googleMapsUri = `http://maps.google.com/maps?q=${address}`;
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${address}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        }
        const areaSqMi = MetadataUtil.getAreaSqMi(this.props.feature, "(no area)");

        // Bin together the various field:value pairs
        const observationDataFields = [
            { name: "Facility Type", value: category || "(No Type)", unit: null },
            {
                name: "Facility Location",
                value: lat && long ? `${lat}, ${long}` : "(No Location)",
                unit: null
            },
            { name: "Number of Flyovers", value: "(n/a)", unit: null },
            { name: "Facility Address", value: address || "(No Address)", unit: null }
        ];

        let featureTitle = name;
        let featureSubtitle = `${category} · ${city}, ${state}`;
        let featureHeaderImage = googleMapsStaticImgUrl;
        let featureBody = (
            <div>
                <Card className={styles.cardRoot}>
                    <CardContent>
                        <Typography type="headline" component="h2">
                            Facility Overview
                        </Typography>
                        {this.makeInfoFields(observationDataFields)}
                    </CardContent>
                    <CardActions>
                        <Button
                            color="primary"
                            href={googleMapsUri}
                            target="_blank"
                            disabled={!googleMapsUri}
                            dense
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <Card className={styles.cardRoot}>
                    <CardContent>
                        <Typography type="headline" component="h2">
                            VISTA Facility Metadata
                        </Typography>
                        {this.makeInfoFields(
                            this.props.feature
                                .get("metadata")
                                .sortBy(x => x.get("name"))
                                .toJS()
                        )}
                    </CardContent>
                </Card>
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
        const googleMapsUri = lat && long ? `http://maps.google.com/maps?q=${lat},${long}` : null;
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
        // const observationDataFields = [
        //   { name: "Methane Flux", value: "(not specified in metadata)" },
        //   { name: "Observation Time", value: "" },
        //   { name: "Plume IME", value: "(not specified in metadata)" },
        //   { name: "Observation Location", value: `${lat}, ${long}` },
        //   { name: "Gas Detected", value: "(not specified in metadata)" },
        //   {
        //     name: "Observation Altitude",
        //     value: "(not specified in metadata)"
        //   }
        // ];

        let featureTitle = dateString;
        let featureSubtitle = name;
        let featureHeaderImage = googleMapsStaticImgUrl;
        let featureBody = (
            <div>
                <Card className={styles.cardRoot}>
                    <CardContent>
                        <Typography type="headline" component="h2">
                            Observation Data
                        </Typography>
                        {this.makeInfoFields(
                            this.props.feature
                                .get("metadata")
                                .sortBy(x => x.get("name"))
                                .toJS()
                        )}
                    </CardContent>
                    <CardActions>
                        <Button
                            color="primary"
                            href={googleMapsUri}
                            target="_blank"
                            disabled={!googleMapsUri}
                            dense
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <div className={styles.imageCardsContainer}>
                    <Grid container spacing={16}>
                        <Grid item xs>
                            <Card className={styles.cardRoot}>
                                <CardContent>
                                    <Typography type="headline" component="h2">
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
                                <CardContent>
                                    <Typography type="headline" component="h2">
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
    feature: PropTypes.object,
    hideFeatureDetailContainer: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        category: state.featureDetail.get("category"),
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
