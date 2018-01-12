import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { AppTitleContainer, AppButtons } from "_core/components/AppBar";
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import { appColorPalette } from "styles/appColorPalette";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/AppBar/AppBarContainerStyles.scss";

const AppBarContainer = props => {
    let containerClasses = MiscUtil.generateStringFromSet({
        [styles.root]: true
    });
    return (
        <div className={containerClasses}>
            <AppBar position="static" style={{ background: appColorPalette[400] }}>
                <Toolbar classes={{ root: styles.toolbarRoot }}>
                    <AppTitleContainer className={styles.title} />
                    <AppButtons />
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default AppBarContainer;
