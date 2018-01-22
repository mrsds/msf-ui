import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { AppButtons } from "_core/components/AppBar";
import Paper from "material-ui/Paper";
import AppBar from "material-ui/AppBar";
import AppLogo from "components/AppBar/AppLogo";
import Typography from "material-ui/Typography";
import Toolbar from "material-ui/Toolbar";
// // import { appColorPalette } from "styles/appColorPalette";
import MiscUtil from "_core/utils/MiscUtil";
import Divider from "material-ui/Divider";
import styles from "components/AppBar/AppBarContainerStyles.scss";

const AppBarContainer = props => {
    return (
        <React.Fragment>
            <div className={styles.root}>
                <AppBar elevation={0} position="static">
                    <Toolbar classes={{ root: styles.toolbarRoot }}>
                        <span className={styles.appLogo}>
                            <AppLogo />
                        </span>
                        <Typography type="title" color="inherit" className={styles.title}>
                            Methane Source Finder
                        </Typography>
                        <AppButtons />
                    </Toolbar>
                </AppBar>
                <Divider style={{ background: "#4043C2" }} />
            </div>
            <Paper elevation={1} className={styles.shadow} />
        </React.Fragment>
    );
};

export default AppBarContainer;
