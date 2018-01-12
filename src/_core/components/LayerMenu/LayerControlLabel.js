import React from "react";
import PropTypes from "prop-types";
import Typography from "material-ui/Typography";
import styles from "_core/components/LayerMenu/LayerControlLabel.scss";

const LayerControlLabel = props => {
    return <div className={styles.controlLabel}>{props.children}</div>;
};

LayerControlLabel.propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string])
};

export default LayerControlLabel;
