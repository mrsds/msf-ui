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
import * as mapActions from "_core/actions/mapActions";
import * as dateSliderActions from "_core/actions/dateSliderActions";
import * as analyticsActions from "_core/actions/analyticsActions";
import MiscUtil from "_core/utils/MiscUtil";
import { ModalMenu } from "_core/components/ModalMenu";

export class SettingsContainerExtended extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.settingsOpen || nextProps.settingsOpen !== this.props.settingsOpen;
    }

    render() {
        return (
            <ModalMenu
                title="Settings"
                active={this.props.settingsOpen}
                closeFunc={() => this.props.appActions.setSettingsOpen(false)}
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
    analyticsActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        settingsOpen: state.settings.get("isOpen"),
        mapSettings: state.map.get("displaySettings"),
        analyticsEnabled: state.analytics.get("isEnabled"),
        autoUpdateUrlEnabled: state.share.get("autoUpdateUrl")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        analyticsActions: bindActionCreators(analyticsActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainerExtended);
