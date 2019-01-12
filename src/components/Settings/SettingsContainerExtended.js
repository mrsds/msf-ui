import Immutable from "immutable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import * as appActions from "_core/actions/appActions";
import * as mapActions from "actions/mapActions";
import * as dateSliderActions from "_core/actions/dateSliderActions";
import * as analyticsActions from "_core/actions/analyticsActions";
import MiscUtil from "_core/utils/MiscUtil";
import { ModalMenu } from "_core/components/ModalMenu";
import Divider from "@material-ui/core/Divider";
import HomeIcon from "@material-ui/icons/Home";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import * as MSFTypes from "constants/MSFTypes";
import styles from "components/Settings/SettingsContainerStyles.scss";
import * as appActionsExtended from "actions/appActionsExtended";

export class SettingsContainerExtended extends Component {
    shouldComponentUpdate(nextProps) {
        return (
            nextProps.settingsOpen ||
            nextProps.settingsOpen !== this.props.settingsOpen ||
            nextProps.homeSelectMenuOpen !== this.props.homeSelectMenuOpen ||
            nextProps.homeArea !== this.props.homeArea
        );
    }

    getHomeSetting() {
        switch (this.props.homeArea.toJS()) {
            case MSFTypes.EXTENTS_LOS_ANGELES:
                return 0;
            case MSFTypes.EXTENTS_SF_BAY:
                return 1;
            default:
                return 2;
        }
    }

    render() {
        const homeAreaLocation = this.props.homeArea.get("location");
        return (
            <ModalMenu
                title="Settings"
                active={this.props.settingsOpen}
                closeFunc={() => this.props.appActionsExtended.setSettingsOpen(false)}
            >
                <List>
                    <ListSubheader disableSticky>Application Configuration</ListSubheader>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.analyticsActions.setAnalyticsEnabled(
                                !this.props.analyticsEnabled
                            )
                        }
                    >
                        <Checkbox disableRipple checked={this.props.analyticsEnabled} />
                        <ListItemText
                            primary="User Feedback Program"
                            secondary="Help us improve this tool by sending anonymous usage information"
                        />
                    </ListItem>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.appActions.setAutoUpdateUrl(!this.props.autoUpdateUrlEnabled)
                        }
                    >
                        <Checkbox disableRipple checked={this.props.autoUpdateUrlEnabled} />
                        <ListItemText
                            primary="Auto-Update Url"
                            secondary="Automatically update the url in this window to be shareable"
                        />
                    </ListItem>
                    <ListItem button onClick={this.props.appActions.resetApplicationState}>
                        <ListItemIcon style={{ margin: "0 12" }}>
                            <SettingsBackupRestoreIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Reset Application"
                            secondary="Restore the application to its default state"
                        />
                    </ListItem>
                    <Divider />
                    <ListItem
                        button
                        onClick={() =>
                            this.props.mapActions.toggleHomeSelectMenuOpen(
                                !this.props.homeSelectMenuOpen
                            )
                        }
                    >
                        <ListItemIcon style={{ margin: "0 12" }}>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Set Home Area"
                            secondary="Choose the default viewport when the map 'Home' button is clicked."
                        />
                        {this.props.homeSelectMenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={this.props.homeSelectMenuOpen} timeout="auto" unmountOnExit>
                        <List>
                            <ListItem
                                button
                                onClick={() =>
                                    this.props.mapActions.setHomeArea(
                                        MSFTypes.HOME_AREA_LOS_ANGELES
                                    )
                                }
                                className={
                                    homeAreaLocation === MSFTypes.HOME_AREA_LOS_ANGELES
                                        ? styles.homeAreaSelected
                                        : styles.homeArea
                                }
                            >
                                <ListItemText
                                    inset
                                    primary="Los Angeles"
                                    selected={this.props.homeArea === MSFTypes.EXTENTS_LOS_ANGELES}
                                />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() =>
                                    this.props.mapActions.setHomeArea(MSFTypes.HOME_AREA_SF_BAY)
                                }
                                className={
                                    homeAreaLocation === MSFTypes.HOME_AREA_SF_BAY
                                        ? styles.homeAreaSelected
                                        : styles.homeArea
                                }
                            >
                                <ListItemText
                                    inset
                                    primary="San Francisco Bay Area"
                                    selected={this.props.homeArea === MSFTypes.EXTENTS_SF_BAY}
                                />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() =>
                                    this.props.mapActions.setHomeArea(MSFTypes.HOME_AREA_CUSTOM)
                                }
                                className={
                                    homeAreaLocation === MSFTypes.HOME_AREA_CUSTOM
                                        ? styles.homeAreaSelected
                                        : styles.homeArea
                                }
                            >
                                <ListItemText
                                    inset
                                    primary={`${
                                        homeAreaLocation === MSFTypes.HOME_AREA_CUSTOM
                                            ? "Custom (Click to Reset)"
                                            : "Current Map Area"
                                    }`}
                                />
                            </ListItem>
                        </List>
                    </Collapse>
                </List>
            </ModalMenu>
        );
    }
}

SettingsContainerExtended.propTypes = {
    settingsOpen: PropTypes.bool.isRequired,
    analyticsEnabled: PropTypes.bool.isRequired,
    autoUpdateUrlEnabled: PropTypes.bool.isRequired,
    mapSettings: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    dateSliderActions: PropTypes.object.isRequired,
    analyticsActions: PropTypes.object.isRequired,
    homeSelectMenuOpen: PropTypes.bool.isRequired,
    homeArea: PropTypes.object.isRequired,
    appActionsExtended: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        settingsOpen: state.settings.get("isOpen"),
        mapSettings: state.map.get("displaySettings"),
        analyticsEnabled: state.analytics.get("isEnabled"),
        autoUpdateUrlEnabled: state.share.get("autoUpdateUrl"),
        homeSelectMenuOpen: state.settings.get("homeSelectMenuOpen"),
        homeArea: state.settings.get("homeArea")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        analyticsActions: bindActionCreators(analyticsActions, dispatch),
        appActionsExtended: bindActionCreators(appActionsExtended, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainerExtended);
