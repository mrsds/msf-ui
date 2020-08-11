import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import FileDownloadIcon from "@material-ui/icons/FileDownload";
import Grid from "@material-ui/core/Grid";
import Immutable from "immutable";
import InfoIcon from "@material-ui/icons/Info";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import moment from "moment";

import { IconButtonSmaller } from "components/Reusables";
import InfrastructureChartingContainer from "components/FeatureDetail/InfrastructureChartingContainer";
import MiscUtil from "_core/utils/MiscUtil";
import MiscUtilExtended from "utils/MiscUtilExtended";
import PlumeChartingContainer from "components/FeatureDetail/PlumeChartingContainer";
import * as featureDetailActions from "actions/featureDetailActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";

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

    makeSwisNoLink(field) {
        return (
            <div key={field.name}>
                <label>{field.name}</label>
                <a
                    href={`https://www2.calrecycle.ca.gov/swfacilities/Directory/${field.value}`}
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
            if (field.name.toLowerCase() === "swisno") return this.makeSwisNoLink(field);
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
        const vistaId = this.props.feature.get("id") || "(no Vista ID)";

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
            { name: "Number of Flyovers", value: this.props.feature.get("num_flights_matching") },
            { name: "Vista ID", value: vistaId }
        ];

        let featureTitle = name;
        let featureSubtitle = this.props.vistaMetadataLoading
            ? ""
            : `${sector} · ${city}, ${state}`;
        let featureHeaderImage = this.props.vistaMetadataLoading ? "" : googleMapsStaticImgUrl;
        let featureBody = this.props.vistaMetadataLoading ? (
            <Card className={styles.cardRoot}>
                <CardContent>
                    <div className={styles.loadingModal}>
                        <CircularProgress />
                    </div>
                </CardContent>
            </Card>
        ) : (
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
                            Vista Facility Metadata
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

        const fluxLabel = (feature => {
            const flux = feature.get("flux");
            if (flux === null) return "not available";
            if (flux === -9999.0) return "TBD";

            const fluxUncertainty = feature.get("flux_uncertainty")
                ? " ± " + MiscUtilExtended.roundTo(feature.get("flux_uncertainty"), 2)
                : "";

            return `${MiscUtilExtended.roundTo(flux, 2)}${fluxUncertainty} kg/hr`;
        })(feature);

        const ime = feature.get("ime") ? MiscUtilExtended.roundTo(feature.get("ime"), 2) : "none";
        const fetch = feature.get("fetch")
            ? MiscUtilExtended.roundTo(feature.get("fetch"), 2)
            : "none";

        // Bin together the various field:value pairs
        const plumeDataFields = [
            { name: "Candidate ID", value: feature.get("name") },
            {
                name: "Emissions",
                value: fluxLabel,
                unit: "kg/hr"
            },
            { name: "Source ID", value: feature.get("sourceId") },
            { name: "Location", value: `${location.get(0)}°N, ${location.get(1)}°W` }
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
    vistaMetadata: PropTypes.object,
    vistaMetadataLoading: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        category: state.featureDetail.get("category"),
        layerSidebarCollapsed: state.layerSidebar.get("layerSidebarCollapsed"),
        feature: state.featureDetail.get("feature"),
        vistaMetadata: state.featureDetail.get("vistaMetadata"),
        vistaMetadataLoading: state.featureDetail.get("vistaMetadataLoading")
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
