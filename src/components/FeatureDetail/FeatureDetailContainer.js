import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as featureDetailActions from "actions/featureDetailActions";
import Typography from "@material-ui/core/Typography";
import FileDownloadIcon from "@material-ui/icons/FileDownload";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import MetadataUtil from "utils/MetadataUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";
import PlumeChartingContainer from "components/FeatureDetail/PlumeChartingContainer";
import InfrastructureChartingContainer from "components/FeatureDetail/InfrastructureChartingContainer";
import { IconButtonSmaller } from "components/Reusables";
import InfoIcon from "@material-ui/icons/Info";
import appConfig from "constants/appConfig";
import Tooltip from "@material-ui/core/Tooltip";
import Immutable from "immutable";

export class FeatureDetailContainer extends Component {
    truncateField(str, limit) {
        const stripped = str.replace(/(\s*$)/, "");
        return stripped.substring(0, limit - 3) + "...";
    }

    makeAPILink(field) {
        return (
            <div key={field.name}>
                <label>{field.name}</label>
                <a
                    href={`https://secure.conservation.ca.gov/WellSearch/Details?api=${
                        field.value
                    }`}
                    target="_blank"
                >
                    {field.value}
                </a>
            </div>
        );
    }

    makePopoverField(field) {
        const unit = field.unit ? `(${field.unit})` : null;
        return (
            <div key={field.name}>
                <label>
                    {field.name} {unit}
                    <Tooltip title={field.popoverText} placement="right">
                        <IconButtonSmaller
                            onClick={evt => this.openPopover(evt, field.name)}
                            className={styles.smallIcon}
                        >
                            <InfoIcon />
                        </IconButtonSmaller>
                    </Tooltip>
                </label>
                <span>{field.value}</span>
            </div>
        );
    }

    makeInfoFields(fieldInfo) {
        const fields = fieldInfo.map(field => {
            if (field.name.toLowerCase() === "api") return this.makeAPILink(field);
            if (field.popoverText) return this.makePopoverField(field);

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

    renderFeatureDetailContainer(
        headerImageUrl,
        title,
        subtitle,
        downloadLabel,
        downloadFnc,
        enableDownloads,
        featureBody
    ) {
        let featureDetailContainerClasses = MiscUtil.generateStringFromSet({
            [styles.featureDetailContainer]: true,
            [styles.fullWidth]: this.props.layerSidebarCollapsed
        });
        let featureDetailClasses = MiscUtil.generateStringFromSet({
            [styles.maxWidth]: true,
            [styles.featureDetailBody]: true
        });
        let downloadFAB = <div />;
        if (enableDownloads) {
            downloadFAB = (
                <div className={styles.fabContainer}>
                    <Button
                        className={styles.fab}
                        color="inherit"
                        onClick={() => downloadFnc(this.props.feature)}
                        target="_blank"
                        variant="fab"
                    >
                        <FileDownloadIcon />
                    </Button>
                    <span className={styles.fabLabel}>{downloadLabel}</span>
                </div>
            );
        }
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
                        {downloadFAB}
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
        const metadata = this.props.vistaMetadata || Immutable.fromJS({});
        console.log(metadata.toJS());

        // Get all the properties we'll be using later on using metadata searches
        const name = this.props.feature.get("name");
        const category = this.props.feature.get("category");
        const city = metadata.get("LCity");
        const county = metadata.get("County");
        const state = metadata.get("STATE") || metadata.get("LState");
        const lat = metadata.get("LATITUDE") || metadata.get("LLat");
        const long = metadata.get("LONGITUDE") || metadata.get("LLong");
        const address = metadata.get("ADDRESS") || metadata.get("Location");
        const sector = metadata.get("TYPE") || metadata.get("LSector") || "(no sector name)";

        let googleMapsUri = "";
        let googleMapsStaticImgUrl = "./styles/resources/img/fake_info_img.png";
        if (lat && long) {
            googleMapsUri = `http://maps.google.com/maps?t=k&q=loc:${lat},${long}`;
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        } else if (address) {
            googleMapsUri = `http://maps.google.com/maps?t=k&q=loc:${address}`;
            googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${address}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;
        }

        // Bin together the various field:value pairs
        const facilityOverviewFields = [
            { name: "Site", value: metadata.get("LSiteName") || "(no site name)" },
            {
                name: "Facility Type",
                value: sector
            },
            {
                name: "Operator",
                value: metadata.get("OPERATOR") || metadata.get("LOperator") || "(no operator name)"
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
            { name: "Number of Flyovers", value: this.props.feature.get("num_flights_matching") }
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
                            variant="outlined"
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
                            Object.keys(
                                metadata
                                    .sortBy((v, k) => k)
                                    .filter((v, k) => k.charAt(0) !== "L" && k !== "sources")
                                    .toJS()
                            ).map(key => {
                                return { name: key, value: metadata.get(key) };
                            })
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
            null,
            "Download Flyover Data",
            false,
            featureBody
        );
    }

    makePlumeDetail() {
        if (!this.props.feature.size) return null;

        const feature = this.props.feature;
        const location = feature.get("location");

        const googleMapsUri = `http://maps.google.com/maps?t=k&q=loc:${location.get(
            0
        )},${location.get(1)}`;
        const googleMapsStaticImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.get(
            0
        )},${location.get(
            1
        )}&maptype=satellite&zoom=14&scale=2&size=800x175&key=AIzaSyCATObvFelK2TV949tuLWCIwRC4eFTnne4`;

        const datetime = this.props.feature.get("datetime");
        const dateString = datetime ? moment(datetime).format("MMMM Do, YYYY, H:mm") : "(No Date)";

        // Bin together the various field:value pairs
        const plumeDataFields = [
            { name: "Candidate ID", value: feature.get("name") },
            { name: "Location", value: `${location.get(0)}°N, ${location.get(1)}°W` },
            { name: "Plume ID", value: feature.get("plumeId") },
            {
                name: "IME",
                unit: "kg",
                value: feature.get("ime"),
                popoverText: "Integrated Methane Enhancement (kilograms)"
            },
            { name: "Source ID", value: feature.get("sourceId") },
            {
                name: "Fetch",
                unit: "m",
                value: feature.get("fetch"),
                popoverText: "Fetch distance (meters)"
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
                            variant="outlined"
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <div className={styles.imageCardsContainer}>
                    <Grid container spacing={16}>
                        <Grid item xs className={styles.gridTile}>
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
                        <Grid item xs className={styles.gridTile}>
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
            "Download Plume Data",
            this.props.downloadPlumeData,
            true,
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
    hideFeatureDetailContainer: PropTypes.func.isRequired,
    downloadPlumeData: PropTypes.func.isRequired,
    vistaMetadata: PropTypes.object
};

function mapStateToProps(state) {
    return {
        category: state.featureDetail.get("category"),
        layerSidebarCollapsed: state.layerSidebar.get("layerSidebarCollapsed"),
        feature: state.featureDetail.get("feature"),
        vistaMetadata: state.featureDetail.get("vistaMetadata")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        hideFeatureDetailContainer: bindActionCreators(
            featureDetailActions.hideFeatureDetailContainer,
            dispatch
        ),
        downloadPlumeData: bindActionCreators(featureDetailActions.downloadPlumeData, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureDetailContainer);
