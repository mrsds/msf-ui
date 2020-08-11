import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Modernizr from "modernizr";
import Earth from "mdi-material-ui/Earth";
import Eye from "mdi-material-ui/Eye";
import EyeOff from "mdi-material-ui/EyeOff";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import PlusIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import HomeIcon from "@material-ui/icons/Home";
import Paper from "@material-ui/core/Paper";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsExtended from "actions/mapActions";
import * as appActions from "_core/actions/appActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import { MapButton, MapButtonGroup } from "_core/components/Reusables";
import { MapToolsButton, BasemapPicker, MapLabelsButton } from "_core/components/Map";
import styles from "_core/components/Map/MapControlsContainer.scss";
import displayStyles from "_core/styles/display.scss";
import LocationSearchingIcon from "@material-ui/icons/LocationSearching";

export class MapControlsContainer extends Component {
    render() {
        return (
            <div className={styles.mapControlsContainer}>
                <Paper elevation={2} className={styles.buttonGroup}>
                    <MapToolsButton
                        isOpen={this.props.mapControlsToolsOpen}
                        className={styles.lineButton}
                        setOpen={isOpen => this.props.appActions.setMapControlsToolsOpen(isOpen)}
                    />
                    <MapLabelsButton />
                </Paper>
                <Paper elevation={2} className={styles.buttonGroup}>
                    <Tooltip title="Home" placement="right">
                        <MapButton
                            onClick={this.props.mapActionsExtended.goToHome}
                            aria-label="Home"
                            className={`${styles.firstButton} ${styles.lineButton}`}
                        >
                            <HomeIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip title="Zoom In" placement="right">
                        <MapButton
                            onClick={this.props.mapActions.zoomIn}
                            aria-label="Zoom in"
                            className={styles.lineButton}
                        >
                            <PlusIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out" placement="right">
                        <MapButton
                            onClick={this.props.mapActions.zoomOut}
                            aria-label="Zoom out"
                            className={styles.lastButton}
                        >
                            <RemoveIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip title="Input Location" placement="right">
                        <MapButton
                            onClick={_ =>
                                this.props.mapActionsExtended.toggleLocationInputModal(
                                    !this.props.locationModalVisible
                                )
                            }
                            aria-label="Input Location"
                            className={styles.lineButton}
                        >
                            <LocationSearchingIcon />
                        </MapButton>
                    </Tooltip>
                </Paper>
                <BasemapPicker />
            </div>
        );
    }
}

MapControlsContainer.propTypes = {
    mapControlsToolsOpen: PropTypes.bool.isRequired,
    mapActions: PropTypes.object.isRequired,
    mapActionsExtended: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    locationModalVisible: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsToolsOpen: state.view.get("mapControlsToolsOpen"),
        locationModalVisible: state.map.get("locationInputModalVisible")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch),
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapControlsContainer);
