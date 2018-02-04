import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import * as mapActions from "_core/actions/mapActions";
import * as dateSliderActions from "_core/actions/dateSliderActions";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import KeyHandler, { KEYUP, KEYDOWN } from "react-key-handler";
import { KeyboardControlsContainer as CoreKeyboardControlsContainer } from "_core/components/KeyboardControls/KeyboardControlsContainer";
import * as featureDetailActions from "actions/featureDetailActions";
import * as mapActionsMSF from "actions/mapActions";

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

    incrementActivePlume(increment) {
        this.props.mapActionsMSF.incrementActivePlume(increment);
    }

    dateAutoIncrement() {
        if (this.dateShouldAutoIncrement) {
            clearTimeout(this.dateAutoIncrementInterval);
            this.incrementActivePlume(this.dateIncrementForward);
            this.dateAutoIncrementInterval = setTimeout(
                () => this.dateAutoIncrement(),
                this.dateAutoIncrementSpeed
            );
        }
    }

    beginDateAutoIncrement(increment) {
        if (this.dateAutoIncrementEnabled) {
            this.dateShouldAutoIncrement = true;
            this.dateIncrementForward = increment;
            if (this.dateAutoIncrementInterval === null) {
                this.dateAutoIncrementInterval = setTimeout(
                    () => this.dateAutoIncrement(),
                    this.dateAutoIncrementSpeed
                );
                this.incrementActivePlume(increment);
            }
        }
    }

    endDateAutoIncrement() {
        clearTimeout(this.dateAutoIncrementInterval);
        this.dateShouldAutoIncrement = false;
        this.dateAutoIncrementInterval = null;
    }
}

KeyboardControlsContainer.propTypes = {
    maps: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    mapActionsMSF: PropTypes.object.isRequired,
    dateSliderActions: PropTypes.object.isRequired,
    isDrawingEnabled: PropTypes.bool.isRequired,
    isMeasuringEnabled: PropTypes.bool.isRequired,
    dateSliderTimeResolution: PropTypes.object.isRequired,
    date: PropTypes.object.isRequired,
    featureDetail: PropTypes.object,
    featureDetailActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        maps: state.map.get("maps"),
        date: state.map.get("date"),
        dateSliderTimeResolution: state.dateSlider.get("resolution"),
        isDrawingEnabled: state.map.getIn(["drawing", "isDrawingEnabled"]),
        isMeasuringEnabled: state.map.getIn(["measuring", "isMeasuringEnabled"]),
        featureDetail: state.featureDetail.get("feature")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsMSF: bindActionCreators(mapActionsMSF, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        featureDetailActions: bindActionCreators(featureDetailActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyboardControlsContainer);
