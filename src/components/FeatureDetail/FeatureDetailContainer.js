import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import * as featureDetailActions from "actions/FeatureDetailActions";
import { Card, CardMedia, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import MetadataUtil from "utils/MetadataUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

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

    renderFeatureDetailContainer(headerImageUrl, title, subtitle, featureBody) {
        return (
            <div className="feature-detail-container">
                <Button
                    raised
                    className="floating-back-button"
                    label="Back to Map"
                    onClick={this.props.hideFeatureDetailContainer}
                />
                <div
                    className="header-image"
                    style={{ backgroundImage: `url("${headerImageUrl}")` }}
                />
                <div className="header">
                    <h2 className="header-title">{title}</h2>
                    <p className="header-subtitle">{subtitle}</p>
                </div>
                <div className="feature-detail-body">{featureBody}</div>
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
                <Card theme={{ card: "card" }}>
                    <CardTitle title={"Facility Overview"} theme={{ title: "card-title" }} />
                    <CardText>{this.makeInfoFields(observationDataFields)}</CardText>
                    <CardActions>
                        <Button
                            disabled={!googleMapsUri}
                            primary
                            flat
                            href={googleMapsUri}
                            target="_blank"
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <Card theme={{ card: "card" }}>
                    <CardTitle title={"VISTA Facility Metadata"} theme={{ title: "card-title" }} />
                    <CardText>
                        {this.makeInfoFields(
                            this.props.feature
                                .get("metadata")
                                .sortBy(x => x.get("name"))
                                .toJS()
                        )}
                    </CardText>
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
                <Card theme={{ card: "card" }}>
                    <CardTitle title={"Observation Data"} theme={{ title: "card-title" }} />
                    <CardText>
                        {this.makeInfoFields(
                            this.props.feature
                                .get("metadata")
                                .sortBy(x => x.get("name"))
                                .toJS()
                        )}
                    </CardText>
                    <CardActions>
                        <Button
                            disabled={!googleMapsUri}
                            primary
                            flat
                            href={googleMapsUri}
                            target="_blank"
                        >
                            View In Google Maps
                        </Button>
                    </CardActions>
                </Card>
                <div className="image-cards-container">
                    <Card theme={{ card: "card" }}>
                        <CardTitle
                            title={"Observation Plume Imagery"}
                            theme={{ title: "card-title" }}
                        />
                        <div className="observation-image">
                            <img src={this.props.feature.get("rgbqlctr_url")} />
                        </div>
                    </Card>
                    <Card theme={{ card: "card" }}>
                        <CardTitle
                            title={"Observation RGB Imagery"}
                            theme={{ title: "card-title" }}
                        />
                        <div className="observation-image">
                            <img src={this.props.feature.get("png_url")} />
                        </div>
                    </Card>
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
