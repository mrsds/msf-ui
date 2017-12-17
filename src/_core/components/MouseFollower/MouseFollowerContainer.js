import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DrawingTooltip from '_core/components/MouseFollower/DrawingTooltip';
import MiscUtil from '_core/utils/MiscUtil';
import MouseCoordinates from '_core/components/MouseFollower/MouseCoordinates';

const miscUtil = new MiscUtil();

export class MouseFollowerContainer extends Component {
    shouldComponentUpdate(nextProps) {
        let nextDraworMeasure = nextProps.drawing.get("isDrawingEnabled") || nextProps.measuring.get("isMeasuringEnabled");
        let currDrawOrMeasure = this.props.drawing.get("isDrawingEnabled") || this.props.measuring.get("isMeasuringEnabled");
        return nextDraworMeasure || (nextDraworMeasure !== currDrawOrMeasure);
    }
    
    render() {
        let maxLeft = window.innerWidth - 300;
        let maxTop = window.innerHeight;

        let top = parseInt(this.props.pixelCoordinate.get("y"));
        let left = parseInt(this.props.pixelCoordinate.get("x"));

        let style = { top, left };

        let drawOrMeasure = this.props.drawing.get("isDrawingEnabled") || this.props.measuring.get("isMeasuringEnabled");

        let containerClasses = miscUtil.generateStringFromSet({
            "mouse-follower-container dark": true,
            "active": drawOrMeasure,
            "right": left > maxLeft
        });

        // TODO - make a data display component
        return (
            <div className={containerClasses} style={style}>
                <div className="content-container">
                    <DrawingTooltip
                        drawing={this.props.drawing}
                        measuring={this.props.measuring}
                    />
                </div>
                <MouseCoordinates />
            </div>
        );
    }
}

MouseFollowerContainer.propTypes = {
    pixelCoordinate: PropTypes.object.isRequired,
    drawing: PropTypes.object.isRequired,
    measuring: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        pixelCoordinate: state.map.getIn(["view", "pixelHoverCoordinate"]),
        drawing: state.map.get("drawing"),
        measuring: state.map.get("measuring")
    };
}

export default connect(
    mapStateToProps,
    null
)(MouseFollowerContainer);
