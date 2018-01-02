import React from "react";
import PropTypes from "prop-types";
import IconButton from "material-ui/IconButton";
import styles from "_core/components/Reusables/IconButtonSmall.scss";

const IconButtonSmall = props => {
    return <IconButton classes={{ root: styles.root }} {...props} />;
};

// IconButtonSmall.propTypes = {};

export default IconButtonSmall;
