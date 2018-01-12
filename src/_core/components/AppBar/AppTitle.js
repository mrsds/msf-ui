import React from "react";
import PropTypes from "prop-types";
import Typography from "material-ui/Typography";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/AppBar/AppTitle.scss";

const renderTitle = title => {
    if (title) {
        return (
            <Typography type="title" color="inherit" className={styles.title}>
                {title}
            </Typography>
        );
    }
};

const renderVersion = version => {
    if (version) {
        return (
            <Typography type="caption" color="inherit" className={styles.version}>
                {version}
            </Typography>
        );
    }
};

const AppTitle = props => {
    let { title, version, className, ...other } = props;

    let rootClasses = MiscUtil.generateStringFromSet({
        [className]: typeof className !== "undefined"
    });

    return (
        <div className={rootClasses} {...other}>
            {renderTitle(title)}
            {renderVersion(version)}
        </div>
    );
};

AppTitle.propTypes = {
    title: PropTypes.string.isRequired,
    version: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string
};

export default AppTitle;
