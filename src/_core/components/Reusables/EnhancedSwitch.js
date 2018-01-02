import React from "react";
import PropTypes from "prop-types";
import Switch from "material-ui/Switch";
import styles from "_core/components/Reusables/EnhancedSwitch.scss";

const EnhancedSwitch = props => {
    return (
        <Switch
            classes={{
                root: styles.root,
                default: styles.default,
                bar: styles.bar,
                checked: styles.checked,
                icon: styles.icon
            }}
            {...props}
        />
    );
};

export default EnhancedSwitch;
