import React from "react";
import PropTypes from "prop-types";
import Button from "material-ui/Button";
import KeyboardArrowUpIcon from "material-ui-icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "material-ui-icons/KeyboardArrowDown";
import styles from "_core/components/DatePicker/IncrementIcon.scss";

const IncrementIcon = props => {
    let { decrement, ...other } = props;
    if (props.decrement) {
        return <KeyboardArrowDownIcon classes={{ root: styles.root }} {...other} />;
    }
    return <KeyboardArrowUpIcon classes={{ root: styles.root }} {...other} />;
};

IncrementIcon.propTypes = {
    decrement: PropTypes.bool
};

export default IncrementIcon;
