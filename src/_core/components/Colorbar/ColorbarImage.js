import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MiscUtil from "_core/utils/MiscUtil";

export class ColorbarImage extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return <img className={containerClasses} src={this.props.url} />;
    }
}

ColorbarImage.propTypes = {
    url: PropTypes.string,
    className: PropTypes.string
};

export default connect()(ColorbarImage);
