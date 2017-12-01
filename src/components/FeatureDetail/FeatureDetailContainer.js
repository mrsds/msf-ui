import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import * as featureDetailActions from "actions/FeatureDetailActions";
import MiscUtil_Extended from "utils/MiscUtil_Extended";
import {
    Card,
    CardMedia,
    CardTitle,
    CardText,
    CardActions
} from "react-toolbox/lib/card";
import MetadataUtil from "utils/MetadataUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

const miscUtil = new MiscUtil_Extended();
const metadataUtil = new MetadataUtil();

export class FeatureDetailContainer extends Component {
    getCategory() {
        try {
            console.dir(this.props.feature.get("metadata").toJS());
            return this.props.feature
                .get("metadata")
                .find(val => val.get("name").toLowerCase() === "category")
                .get("value");
        } catch (e) {
            return "(no category)";
        }
    }

    makeInfoFields(fieldInfo) {
        const fields = fieldInfo.map(field => {
            const unit = field.unit ? <unit>{" " + field.unit}</unit> : null;
            if (field.subtitle) {
                return (
                    <div key={field.name + field.subtitle}>
                        <label className="stacked">
                            <span className="main">{field.name}</span>
                            <span className="sub">{field.subtitle}</span>
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
        return <div className="info-box">{fields}</div>;
    }

    makeInfrastructureDetail() {
        if (!this.props.feature.size) return null;

        // Get all the properties we'll be using later on using metadata searches
        const name = this.props.feature.get("name");
        const category = this.props.feature.get("category");
        const city = metadataUtil.getCity(this.props.feature, "(no city)");
        const county = metadataUtil.getCounty(
            this.props.feature,
            "(no county)"
        );
        const state = metadataUtil.getState(this.props.feature, "(no state)");
        const lat = metadataUtil.getLat(this.props.feature, "(no latitude)");
        const long = metadataUtil.getLong(this.props.feature, "(no longitude)");
        const address = metadataUtil.getAddress(
            this.props.feature,
            "(no address)"
        );
        const googleMapsUri =
            lat && long ? `http://maps.google.com/maps?q=${lat},${long}` : null;
        const areaSqMi = metadataUtil.getAreaSqMi(
            this.props.feature,
            "(no area)"
        );

        // Bin together the various field:value pairs
        const observationDataFields = [
            { name: "Facility Type", value: category, unit: null },
            { name: "Facility Location", value: `${lat}, ${long}`, unit: null },
            { name: "Number of Flyovers", value: "(n/a)", unit: null },
            { name: "Facility Address", value: address, unit: null }
        ];

        const vistaFacilityFields = [
            { name: "Name", value: category },
            {
                name: "Year Commissioned",
                value: "(not present in metadata specs)"
            },
            { name: "Area", value: areaSqMi, unit: "square miles" },
            {
                name: "Waste",
                value: "(not present in metadata specs)"
            },
            {
                name: "Methane Emission Factor",
                value: "(not present in metadata specs)"
            },
            {
                name: "Control Type",
                value: "(not present in metadata specs)"
            },
            {
                name: "Methane Emission",
                subtitle: "(Metric Tons of CO2 Equivalent)",
                value: "(not present in metadata specs)"
            },
            {
                name: "Methane Emission",
                subtitle: "(Gigagrams of Methane)",
                value: "(not present in metadata specs)"
            }
        ];

        return (
            <div className="feature-detail-card-container">
                <Card className="feature-detail-card">
                    <CardActions className="exit-button">
                        <Button onClick={this.props.hideFeatureDetailContainer}>
                            Back to Map
                        </Button>
                    </CardActions>
                    <CardMedia
                        className="header-image"
                        image="./styles/resources/img/fake_info_img.png"
                    />
                    <CardTitle
                        className="header"
                        title={name}
                        subtitle={`${category} · ${city}, ${state}`}
                        theme={{
                            title: "title",
                            subtitle: "title"
                        }}
                    />
                    <CardText className="section">
                        <div className="section-body">
                            <h2>Facility Overview</h2>
                            {this.makeInfoFields(observationDataFields)}
                            <hr />
                            <CardActions className="button-box">
                                <Button
                                    disabled={!googleMapsUri}
                                    href={googleMapsUri}
                                    target="_blank"
                                    className="button"
                                >
                                    View In Google Maps
                                </Button>
                            </CardActions>
                        </div>
                    </CardText>
                    <CardText className="section">
                        <div className="section-body">
                            <h2>VISTA Facility Metadata</h2>
                            {this.makeInfoFields(vistaFacilityFields)}
                        </div>
                    </CardText>
                </Card>
            </div>
        );
    }

    makePlumeDetail() {
        if (!this.props.feature.size) return null;

        // Get all the properties we'll be using later on using metadata searches
        const name = this.props.feature.get("name");
        const category = this.props.feature.get("category");
        const city = metadataUtil.getCity(this.props.feature, "(no city)");
        const county = metadataUtil.getCounty(
            this.props.feature,
            "(no county)"
        );
        const state = metadataUtil.getState(this.props.feature, "(no state)");
        const lat = metadataUtil.getLat(this.props.feature, "(no latitude)");
        const long = metadataUtil.getLong(this.props.feature, "(no longitude)");
        const address = metadataUtil.getAddress(
            this.props.feature,
            "(no address)"
        );
        const googleMapsUri =
            lat && long ? `http://maps.google.com/maps?q=${lat},${long}` : null;
        const areaSqMi = metadataUtil.getAreaSqMi(
            this.props.feature,
            "(no area)"
        );
        const datetime = this.props.feature.get("datetime");
        const dateString = datetime
            ? moment(datetime).format("dddd, MMMM Do, YYYY")
            : "(no date)";
        const timeString = datetime
            ? moment(datetime).format("MMM D, ha [UTC], YYYY")
            : "(no time)";

        // Bin together the various field:value pairs
        const observationDataFields = [
            { name: "Methane Flux", value: "(not specified in metadata)" },
            { name: "Observation Time", value: timeString },
            { name: "Plume IME", value: "(not specified in metadata)" },
            { name: "Observation Location", value: `${lat}, ${long}` },
            { name: "Gas Detected", value: "(not specified in metadata)" },
            {
                name: "Observation Altitude",
                value: "(not specified in metadata)"
            }
        ];
        const observationImageryUrl = this.props.feature.get("png_url");

        return (
            <div className="feature-detail-card-container">
                <Card className="feature-detail-card">
                    <CardActions className="exit-button">
                        <Button onClick={this.props.hideFeatureDetailContainer}>
                            Back to Map
                        </Button>
                    </CardActions>
                    <CardMedia
                        className="header-image"
                        image="./styles/resources/img/fake_info_img.png"
                    />
                    <CardTitle
                        className="header"
                        title={name}
                        subtitle={dateString}
                        theme={{
                            title: "title",
                            subtitle: "subtitle"
                        }}
                    />
                    <CardText className="section">
                        <div className="section-body">
                            <h2>Observation Data</h2>
                            {this.makeInfoFields(observationDataFields)}
                            <hr />
                            <CardActions className="button-box">
                                <Button
                                    disabled
                                    target="_blank"
                                    className="button"
                                >
                                    Download Observation Data
                                </Button>
                            </CardActions>
                        </div>
                    </CardText>
                    <CardText className="section">
                        <div className="section-body">
                            <h2>Observation Imagery</h2>
                            <div className="observation-image">
                                <img src={observationImageryUrl} />
                            </div>
                        </div>
                    </CardText>
                </Card>
            </div>
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
    feature: function(props, propName, componentName) {
        const propValue = props[propName];
        if (propValue === null) return;
        if (typeof propValue === "object") return;
        return new Error(`${componentName} only accepts null or object`);
    },
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

export default connect(mapStateToProps, mapDispatchToProps)(
    FeatureDetailContainer
);
