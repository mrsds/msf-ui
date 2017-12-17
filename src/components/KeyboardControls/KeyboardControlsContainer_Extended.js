import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import * as mapActions from "_core/actions/MapActions";
import * as dateSliderActions from "_core/actions/DateSliderActions";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import KeyHandler, { KEYUP, KEYDOWN } from "react-key-handler";
import { KeyboardControlsContainer as CoreKeyboardControlsContainer } from "_core/components/KeyboardControls/KeyboardControlsContainer";
import * as featureDetailActions from "actions/FeatureDetailActions";

export class KeyboardControlsContainer extends CoreKeyboardControlsContainer {
    handleKeyUp_Escape() {
        if (this.props.featureDetail.size) {
            this.props.featureDetailActions.hideFeatureDetailContainer();
        }
        if (this.props.isDrawingEnabled) {
            this.props.mapActions.disableDrawing();
        }
        if (this.props.isMeasuringEnabled) {
            this.props.mapActions.disableMeasuring();
        }
    }
}

KeyboardControlsContainer.propTypes = {
    maps: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    dateSliderActions: PropTypes.object.isRequired,
    isDrawingEnabled: PropTypes.bool.isRequired,
    isMeasuringEnabled: PropTypes.bool.isRequired,
    dateSliderTimeResolution: PropTypes.object.isRequired,
    date: PropTypes.object.isRequired,
    featureDetail: function(props, propName, componentName) {
        const propValue = props[propName];
        if (propValue === null) return;
        if (typeof propValue === "object") return;
        return new Error(`${componentName} only accepts null or object`);
    },
    featureDetailActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        maps: state.map.get("maps"),
        date: state.map.get("date"),
        dateSliderTimeResolution: state.dateSlider.get("resolution"),
        isDrawingEnabled: state.map.getIn(["drawing", "isDrawingEnabled"]),
        isMeasuringEnabled: state.map.getIn([
            "measuring",
            "isMeasuringEnabled"
        ]),
        featureDetail: state.featureDetail.get("feature")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        featureDetailActions: bindActionCreators(featureDetailActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    KeyboardControlsContainer
);
