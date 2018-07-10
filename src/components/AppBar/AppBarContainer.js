import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { AppButtons } from "_core/components/AppBar";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import AppLogo from "components/AppBar/AppLogo";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
// // import { appColorPalette } from "styles/appColorPalette";
import MiscUtil from "_core/utils/MiscUtil";
import Divider from "@material-ui/core/Divider";
import styles from "components/AppBar/AppBarContainerStyles.scss";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import * as viewActions from "actions/viewActions";

const AppBarContainer = props => {
    return (
        <React.Fragment>
            <div className={styles.root}>
                <AppBar elevation={0} position="static">
                    <Toolbar classes={{ root: styles.toolbarRoot }}>
                        <div className={styles.toolbarLeft}>
                            {/* <span className={styles.appLogo}>
                                <AppLogo />
                            </span> */}
                            <Typography variant="title" color="inherit" className={styles.title}>
                                Methane Source Finder
                            </Typography>
                        </div>
                        <Tabs
                            value={props.appMode}
                            className={styles.tabsRoot}
                            indicatorColor="secondary"
                            TabIndicatorProps={{
                                className: styles.tabsIndicator
                            }}
                            onChange={(event, index) => props.setAppMode(index)}
                        >
                            <Tab
                                label="Map"
                                classes={{
                                    labelContainer: styles.tabLabelContainer
                                }}
                            />
                            <Tab
                                label="Analytics"
                                classes={{
                                    labelContainer: styles.tabLabelContainer
                                }}
                            />
                        </Tabs>
                        <AppButtons />
                    </Toolbar>
                </AppBar>
                <Divider style={{ background: "#4043C2" }} />
            </div>
            <Paper elevation={1} className={styles.shadow} />
        </React.Fragment>
    );
};

AppBarContainer.propTypes = {
    appMode: PropTypes.number.isRequired,
    setAppMode: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        appMode: state.view.get("appMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setAppMode: bindActionCreators(viewActions.setAppMode, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarContainer);
