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

    makeInfrastructureDetail() {
        if (!this.props.feature.size) return null;
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
                        <h2>Facility Overview</h2>
                        <div className="row">
                            <div>
                                <label>Facility Type</label>
                                <span>{category}</span>
                            </div>
                            <div>
                                <label>Facility Location</label>
                                <span>{`${lat}, ${long}`}</span>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label>Number of Flyovers</label>
                                <span>(n/a)</span>
                            </div>
                            <div>
                                <label>Facility Address</label>
                                <span>{address}</span>
                            </div>
                        </div>
                        <div className="row">
                            <label>Nearby Plumes</label>
                            <span>(n/a)</span>
                        </div>
                        <div className="row">
                            <label>County</label>
                            <span>{county}</span>
                        </div>
                        <hr />
                        <CardActions>
                            <Button
                                disabled={!googleMapsUri}
                                href={googleMapsUri}
                                target="_blank"
                                className="button"
                            >
                                View In Google Maps
                            </Button>
                        </CardActions>
                    </CardText>
                    <CardText className="section">
                        <h2>VISTA Facility Metadata</h2>
                        <div className="row">
                            <div>
                                <label>Name</label>
                                <span>{name}</span>
                            </div>
                            <div>
                                <label>Year Commissioned</label>
                                <span>(not present in metadata specs)</span>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label>Area</label>
                                <span>
                                    {areaSqMi} <unit>square miles</unit>
                                </span>
                            </div>
                            <div>
                                <label>Waste</label>
                                <span>(not present in metadata specs)</span>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label>Methane Emission Factor</label>
                                <span>(not present in metadata specs)</span>
                            </div>
                            <div>
                                <label>Control Type</label>
                                <span>(not present in metadata specs)</span>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label className="stacked">
                                    <span className="main">
                                        Methane Emission
                                    </span>
                                    <span className="sub">
                                        (Metric Tons of CO2 Equivalent)
                                    </span>
                                </label>
                                <span>(not present in metadata specs)</span>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label className="stacked">
                                    <span className="main">
                                        Methane Emission
                                    </span>
                                    <span className="sub">
                                        (Gigagrams of Methane)
                                    </span>
                                </label>
                                <span>(not present in metadata specs)</span>
                            </div>
                        </div>
                    </CardText>
                </Card>
            </div>
        );
    }

    makePlumeDetail() {
        if (!this.props.feature.size) return null;
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
                        subtitle="(No date specified in metadata)"
                        theme={{
                            title: "title",
                            subtitle: "title"
                        }}
                    />
                    <CardText className="section">
                        <h2>Observation Data</h2>
                        <div className="row">
                            <div>
                                <label>Methane Flux</label>
                                <span>(not specified in metadata)</span>
                            </div>
                            <div>
                                <label>Observation Time</label>
                                <span>(not specified in metadata)</span>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label>Plume IME</label>
                                <span>(not specified in metadata)</span>
                            </div>
                            <div>
                                <label>Observation Location</label>
                                <span>{`${lat}, ${long}`}</span>
                            </div>
                        </div>
                        <div className="row">
                            <label>Gas Detected</label>
                            <span>(not specified in metadata)</span>
                        </div>
                        <div className="row">
                            <label>Observation Altitude</label>
                            <span>(not specified in metadata)</span>
                        </div>
                        <hr />
                        <CardActions>
                            <Button disabled target="_blank" className="button">
                                Download Observation Data
                            </Button>
                        </CardActions>
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
