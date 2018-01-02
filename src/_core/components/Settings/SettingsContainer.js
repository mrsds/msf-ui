import Immutable from "immutable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ListSubheader from "material-ui/List/ListSubheader";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import Checkbox from "material-ui/Checkbox";
import { MenuItem } from "material-ui/Menu";
import { FormControl, FormHelperText } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import Select from "material-ui/Select";
import SettingsBackupRestoreIcon from "material-ui-icons/SettingsBackupRestore";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import * as appActions from "_core/actions/AppActions";
import * as mapActions from "_core/actions/MapActions";
import * as layerActions from "_core/actions/LayerActions";
import * as dateSliderActions from "_core/actions/DateSliderActions";
import * as analyticsActions from "_core/actions/AnalyticsActions";
import MiscUtil from "_core/utils/MiscUtil";
import { BaseMapDropdown } from "_core/components/Settings";
import { ModalMenu } from "_core/components/ModalMenu";

export class SettingsContainer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.settingsOpen || nextProps.settingsOpen !== this.props.settingsOpen;
    }
    setBasemap(layerId) {
        if (layerId && layerId !== "") {
            this.props.mapActions.setBasemap(layerId);
        } else {
            this.props.mapActions.hideBasemap();
        }
    }
    render() {
        // sort and gather the basemaps into a set of dropdown options
        let activeBasemapId = "";
        let basemapList = this.props.basemaps.sort(MiscUtil.getImmutableObjectSort("title"));
        let basemapOptions = basemapList.reduce((acc, layer) => {
            if (layer.get("isActive")) {
                activeBasemapId = layer.get("id");
            }

            acc.push({
                value: layer.get("id"),
                label: layer.get("title"),
                thumbnailImage: layer.get("thumbnailImage")
            });
            return acc;
        }, []);
        basemapOptions.push({
            value: "",
            label: "None",
            thumbnailImage: ""
        });

        // check the reference and boundary layers
        let referenceLabelsLayer = this.props.referenceLayers.get(
            appConfig.REFERENCE_LABELS_LAYER_ID
        );
        let politicalBoundariesLayer = this.props.referenceLayers.get(
            appConfig.POLITICAL_BOUNDARIES_LAYER_ID
        );

        return (
            <ModalMenu
                title="Settings"
                active={this.props.settingsOpen}
                closeFunc={() => this.props.appActions.setSettingsOpen(false)}
            >
                <List>
                    <ListSubheader disableSticky>Map Display</ListSubheader>
                    <ListItem>
                        <BaseMapDropdown
                            value={activeBasemapId}
                            items={basemapOptions}
                            onChange={event => this.setBasemap(event.target.value)}
                        />
                    </ListItem>
                    <ListItem>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="scale-units-select">Scale Units</InputLabel>
                            <Select
                                value={this.props.mapSettings.get("selectedScaleUnits")}
                                onChange={event =>
                                    this.props.mapActions.setScaleUnits(event.target.value)}
                                input={<Input name="Scale Units" id="scale-units-select" />}
                            >
                                {appConfig.SCALE_OPTIONS.map(x => (
                                    <MenuItem key={x.value} value={x.value}>
                                        {x.label}
                                        <small style={{ marginLeft: "7px" }}>{x.abbrev}</small>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ListItem>
                    <ListItem>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="terrain-exaggeration-select">
                                Terrain Exaggeration
                            </InputLabel>
                            <Select
                                value={this.props.mapSettings.get("selectedTerrainExaggeration")}
                                onChange={event =>
                                    this.props.mapActions.setTerrainExaggeration(
                                        event.target.value
                                    )}
                                input={
                                    <Input
                                        name="Terrain Exaggeration"
                                        id="terrain-exaggeration-select"
                                    />
                                }
                            >
                                {appConfig.TERRAIN_EXAGGERATION_OPTIONS.map(x => (
                                    <MenuItem key={x.value} value={x.value}>
                                        {x.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ListItem>
                    <ListItem
                        button
                        onClick={evt => {
                            this.props.layerActions.setLayerActive(
                                appConfig.POLITICAL_BOUNDARIES_LAYER_ID,
                                !politicalBoundariesLayer.get("isActive")
                            );
                        }}
                    >
                        <Checkbox
                            disableRipple
                            checked={
                                politicalBoundariesLayer && politicalBoundariesLayer.get("isActive")
                            }
                        />
                        <ListItemText
                            primary="Political Boundaries"
                            secondary="Display political boundaries on the map"
                        />
                    </ListItem>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.layerActions.setLayerActive(
                                appConfig.REFERENCE_LABELS_LAYER_ID,
                                !referenceLabelsLayer.get("isActive")
                            )}
                    >
                        <Checkbox
                            disableRipple
                            checked={referenceLabelsLayer && referenceLabelsLayer.get("isActive")}
                        />
                        <ListItemText
                            primary="Place Labels"
                            secondary="Display place labels on the map"
                        />
                    </ListItem>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.mapActions.setTerrainEnabled(
                                !this.props.mapSettings.get("enableTerrain")
                            )}
                    >
                        <Checkbox
                            disableRipple
                            checked={this.props.mapSettings.get("enableTerrain")}
                        />
                        <ListItemText
                            primary="Enable 3D Terrain"
                            secondary="Enable terrain on the 3D map"
                        />
                    </ListItem>
                    <ListSubheader disableSticky>Application Configuration</ListSubheader>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.analyticsActions.setAnalyticsEnabled(
                                !this.props.analyticsEnabled
                            )}
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
                            this.props.appActions.setAutoUpdateUrl(
                                !this.props.autoUpdateUrlEnabled
                            )}
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

SettingsContainer.propTypes = {
    settingsOpen: PropTypes.bool.isRequired,
    analyticsEnabled: PropTypes.bool.isRequired,
    autoUpdateUrlEnabled: PropTypes.bool.isRequired,
    basemaps: PropTypes.object.isRequired,
    referenceLayers: PropTypes.object.isRequired,
    mapSettings: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    layerActions: PropTypes.object.isRequired,
    dateSliderActions: PropTypes.object.isRequired,
    analyticsActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        settingsOpen: state.settings.get("isOpen"),
        mapSettings: state.map.get("displaySettings"),
        basemaps: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_BASEMAP]),
        referenceLayers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_REFERENCE]),
        analyticsEnabled: state.analytics.get("isEnabled"),
        autoUpdateUrlEnabled: state.share.get("autoUpdateUrl")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch),
        layerActions: bindActionCreators(layerActions, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        analyticsActions: bindActionCreators(analyticsActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
