import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import * as featureFocusActions from "actions/FeatureFocusActions";
import MiscUtil_Extended from "utils/MiscUtil_Extended";

const miscUtil = new MiscUtil_Extended();

export class FeatureFocusContainer extends Component {
    getCategory() {
        try {
            console.dir(this.props.activeFeature.get("metadata").toJS());
            return this.props.activeFeature
                .get("metadata")
                .find(val => val.get("name").toLowerCase() === "category")
                .get("value");
        } catch (e) {
            return "(no category)";
        }
    }

    getCoordinates() {
        try {
            const lat = this.props.activeFeature
                .get("metadata")
                .find(val => val.get("name").toLowerCase() === "latitude")
                .get("value");
            const long = this.props.activeFeature
                .get("metadata")
                .find(val => val.get("name").toLowerCase() === "longitude")
                .get("value");
            return [lat, long];
        } catch (e) {
            return null;
        }
    }
    getAddress() {
        try {
            return this.props.activeFeature
                .get("metadata")
                .find(val => val.get("name").toLowerCase() === "zip")
                .get("value");
        } catch (e) {
            return "(no address)";
        }
    }

    getGoogleMapsButton() {
        const uri = this.getCoordinates()
            ? `http://maps.google.com/maps?q=${this.getCoordinates().join(",")}`
            : "";
        return (
            <Button
                disabled={!this.getCoordinates()}
                href={uri}
                target="_blank"
            >
                View In Google Maps
            </Button>
        );
    }

    render() {
        if (!this.props.activeFeature) return null;
        const featureName = this.props.activeFeature.get("name");
        return (
            <div id="featureFocusContainer" hidden={!this.props.isOpen}>
                <div id="featureFocusImageHeaderRow" className="row">
                    <div className="col-sm-12 text-left">
                        <Button
                            onClick={this.props.hideFeatureFocusContainer}
                            raised
                        >
                            Back to Map
                        </Button>
                    </div>
                </div>
                <div id="featureFocusHeaderRow" className="row">
                    <div className="col-sm-12 text-left">
                        <h2>
                            {featureName}
                        </h2>
                        <h3>
                            {this.getCategory()} &bull; Los Angeles, CA
                        </h3>
                    </div>
                </div>
                <div id="featureFocusBodyContent" className="row">
                    <div className="content-section">
                        <div className="row">
                            <div className="col-sm-12">
                                <h2>Facility Overview</h2>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-2">
                                <h3>Facility Type</h3>
                            </div>
                            <div className="col-sm-2">
                                <span>
                                    {this.getCategory()}
                                </span>
                            </div>
                            <div className="col-sm-2">
                                <h3>Facility Location</h3>
                            </div>
                            <div className="col-sm-6">
                                <span>
                                    {this.getCoordinates()
                                        ? this.getCoordinates().join(", ")
                                        : "(no coordinates)"}
                                </span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">
                                <h3>Number of Flyovers</h3>
                            </div>
                            <div className="col-sm-2">
                                <span>(not found)</span>
                            </div>
                            <div className="col-sm-2">
                                <h3>Facility Address</h3>
                            </div>
                            <div className="col-sm-6">
                                <span>
                                    {this.getAddress()}
                                </span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">
                                <h3>Nearby Plumes</h3>
                            </div>
                            <div className="col-sm-2">
                                <span>(not found)</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">
                                <h3>County</h3>
                            </div>
                            <div className="col-sm-2">
                                <span>
                                    {miscUtil.getCountyFromFeature(
                                        this.props.activeFeature,
                                        "(not found)"
                                    )}
                                </span>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm">
                                {this.getGoogleMapsButton()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

FeatureFocusContainer.propTypes = {
    activeFeature: function(props, propName, componentName) {
        const propValue = props[propName];
        if (propValue === null) return;
        if (typeof propValue === "object") return;
        return new Error(`${componentName} only accepts null or object`);
    },
    isOpen: PropTypes.bool.isRequired,
    hideFeatureFocusContainer: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        activeFeature: state.featureFocus.get("activeFeature"),
        isOpen: state.featureFocus.get("isOpen")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        hideFeatureFocusContainer: bindActionCreators(
            featureFocusActions.hideFeatureFocusContainer,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    FeatureFocusContainer
);
