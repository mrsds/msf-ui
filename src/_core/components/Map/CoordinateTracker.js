import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Paper from "material-ui/Paper";
import MiscUtil from "_core/utils/MiscUtil";
import { MouseCoordinates } from "_core/components/MouseFollower";
import styles from "_core/components/Map/CoordinateTracker.scss";
import displayStyles from "_core/styles/display.scss";

export class CoordinateTracker extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.coordinateTracker]: true,
            [displayStyles.hiddenFadeOut]:
                this.props.mapControlsHidden && this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]:
                !this.props.mapControlsHidden && this.props.distractionFreeMode,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <Paper elevation={2} className={containerClasses}>
                <MouseCoordinates />
            </Paper>
        );
    }
}

CoordinateTracker.propTypes = {
    distractionFreeMode: PropTypes.bool.isRequired,
    mapControlsHidden: PropTypes.bool.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsHidden: state.view.get("mapControlsHidden")
    };
}

export default connect(mapStateToProps, null)(CoordinateTracker);
