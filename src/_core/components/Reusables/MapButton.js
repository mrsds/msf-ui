import React from "react";
import PropTypes from "prop-types";
import Button from "material-ui/Button";
import { withStyles } from "material-ui/styles";
import styles from "_core/components/Reusables/MapButton.scss";

const MapButton = props => {
    return <Button classes={{ root: styles.mapButton }} {...props} />;
};

export default MapButton;
