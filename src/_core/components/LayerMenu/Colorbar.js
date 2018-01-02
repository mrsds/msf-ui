import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MiscUtil from "_core/utils/MiscUtil";
import * as actions from "_core/actions/LayerActions";
import * as appStrings from "_core/constants/appStrings";
import styles from "_core/components/LayerMenu/Colorbar.scss";

const CANVAS_WIDTH = 255;
const CANVAS_HEIGHT = 12;

export class Colorbar extends Component {
    componentDidMount() {
        if (
            this.props.handleAs === appStrings.COLORBAR_JSON_FIXED ||
            this.props.handleAs === appStrings.COLORBAR_JSON_RELATIVE
        ) {
            this.draw();
        }
    }

    componentDidUpdate(nextProps, nextState) {
        if (
            this.props.handleAs === appStrings.COLORBAR_JSON_FIXED ||
            this.props.handleAs === appStrings.COLORBAR_JSON_RELATIVE
        ) {
            this.draw();
        }
    }

    draw() {
        if (this.props.palette) {
            let canvas = this.refs.canvas;
            let ctx = canvas.getContext("2d");
            let paletteValues = this.props.palette.get("values");
            let numValues = paletteValues.size;

            let binWidth = CANVAS_WIDTH / numValues;
            let drawWidth = Math.ceil(binWidth);
            for (let i = 0; i < CANVAS_WIDTH; ++i) {
                let valueIndex = Math.min(i, numValues - 1);
                let valueEntry = paletteValues.get(valueIndex);
                let color = valueEntry.get("color");
                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(binWidth * i), 0, drawWidth, CANVAS_HEIGHT);
            }
        }
    }

    renderColorbar() {
        if (!this.props.handleAs) {
            return (
                <div className={styles.typeNone}>
                    <span className={styles.warning}>No Colorbar Available</span>
                </div>
            );
        } else if (
            this.props.handleAs === appStrings.COLORBAR_JSON_FIXED ||
            this.props.handleAs === appStrings.COLORBAR_JSON_RELATIVE
        ) {
            return <canvas ref="canvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
        } else if (this.props.handleAs !== appStrings.COLORBAR_IMAGE) {
            return <img src={this.props.url} />;
        } else {
            return (
                <div className={styles.typeNone}>
                    <span className={styles.warning}>Unrecognized Colorbar Type</span>
                </div>
            );
        }
    }

    renderRange() {
        if (this.props.handleAs) {
            return (
                <div className={styles.labelContainer}>
                    <span className={styles.min}>{this.props.displayMin || this.props.min}</span>
                    <span className={styles.units}>{this.props.units}</span>
                    <span className={styles.max}>{this.props.displayMax || this.props.max}</span>
                </div>
            );
        } else {
            return <div />;
        }
    }

    render() {
        return (
            <div className={`${styles.colorbar} ${this.props.className}`}>
                {this.renderColorbar()}
                {this.renderRange()}
            </div>
        );
    }
}

Colorbar.propTypes = {
    actions: PropTypes.object.isRequired,
    palette: PropTypes.object,
    min: PropTypes.number,
    max: PropTypes.number,
    units: PropTypes.string,
    displayMin: PropTypes.number,
    displayMax: PropTypes.number,
    handleAs: PropTypes.string,
    url: PropTypes.string,
    className: PropTypes.string
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(Colorbar);
