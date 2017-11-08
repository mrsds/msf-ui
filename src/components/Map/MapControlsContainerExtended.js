import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Button from "react-toolbox/lib/button";
import Modernizr from "modernizr";
import { ContextMenuSubMenu } from "_core/components/Reusables/ContextMenuSubMenu";
import * as actions from "_core/actions/MapActions";
import * as appActions from "_core/actions/AppActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import { EyeIcon, EyeOffIcon } from "_core/components/Reusables/CustomIcons";
import { MenuItem } from "react-toolbox/lib/menu";
import { MapControlsContainer } from "_core/components/Map/MapControlsContainer";

const miscUtil = new MiscUtil();

export class MapControlsContainerExtended extends MapControlsContainer {
    render() {
        let containerClasses = miscUtil.generateStringFromSet({
            "hidden-fade-out":
                (this.props.mapControlsHidden &&
                    this.props.distractionFreeMode) ||
                !this.props.mapControlsBoxVisible,
            "hidden-fade-in":
                (!this.props.mapControlsHidden &&
                    this.props.distractionFreeMode) ||
                this.props.mapControlsBoxVisible
        });
        let toolsMenuClasses = miscUtil.generateStringFromSet({
            active: this.props.mapControlsToolsOpen,
            "react-contextmenu": true
        });
        let drawingCircle =
            this.props.drawing.get("isDrawingEnabled") &&
            this.props.drawing.get("geometryType") ===
                appStrings.GEOMETRY_CIRCLE;
        let drawingLineString =
            this.props.drawing.get("isDrawingEnabled") &&
            this.props.drawing.get("geometryType") ===
                appStrings.GEOMETRY_LINE_STRING;
        let drawingPolygon =
            this.props.drawing.get("isDrawingEnabled") &&
            this.props.drawing.get("geometryType") ===
                appStrings.GEOMETRY_POLYGON;
        let measuringDistance =
            this.props.measuring.get("isMeasuringEnabled") &&
            this.props.measuring.get("geometryType") ===
                appStrings.GEOMETRY_LINE_STRING;
        let measuringArea =
            this.props.measuring.get("isMeasuringEnabled") &&
            this.props.measuring.get("geometryType") ===
                appStrings.GEOMETRY_POLYGON;
        return (
            <div
                className={containerClasses}
                onMouseLeave={() => {
                    this.onMapControlsMouseLeave();
                }}
                onMouseEnter={() => {
                    this.onMapControlsMouseEnter();
                }}
            >
                <div id="mapControls">
                    <Button
                        neutral
                        icon="add"
                        className="primary-map-button mini-xs"
                        onClick={this.props.actions.zoomIn}
                        data-tip="Zoom in"
                        data-place="right"
                        aria-label="Zoom in"
                    />
                    <Button
                        neutral
                        icon="remove"
                        className="primary-map-button mini-xs"
                        onClick={this.props.actions.zoomOut}
                        data-tip="Zoom out"
                        data-place="right"
                        aria-label="Zoom out"
                    />
                    <Button
                        neutral
                        icon="home"
                        className={"primary-map-button mini-xs"}
                        onClick={() => {
                            this.props.actions.setMapView(
                                { extent: appConfig.DEFAULT_BBOX_EXTENT },
                                true
                            );
                        }}
                        data-tip="Reset Map View"
                        data-place="right"
                        aria-label="Reset Map View"
                    />
                    <Button
                        neutral
                        primary={this.props.distractionFreeMode ? true : false}
                        className={"primary-map-button mini-xs"}
                        onClick={() => {
                            this.props.appActions.setDistractionFreeMode(
                                !this.props.distractionFreeMode
                            );
                        }}
                        data-tip={
                            this.props.distractionFreeMode ? (
                                "Disable distraction free mode"
                            ) : (
                                "Enable distraction free mode"
                            )
                        }
                        data-place="right"
                        aria-label={
                            this.props.distractionFreeMode ? (
                                "Disable distraction free mode"
                            ) : (
                                "Enable distraction free mode"
                            )
                        }
                    >
                        {this.props.distractionFreeMode ? (
                            <EyeIcon />
                        ) : (
                            <EyeOffIcon />
                        )}
                    </Button>
                    <Button
                        neutral
                        disabled
                        label={this.props.in3DMode ? "2D" : "3D"}
                        className="primary-map-button mini-xs"
                        onClick={() => this.setViewMode()}
                        data-tip={
                            this.props.in3DMode ? (
                                "Switch to 2D map"
                            ) : (
                                "Switch to 3D map"
                            )
                        }
                        data-place="right"
                        aria-label={
                            this.props.in3DMode ? (
                                "Switch to 2D map"
                            ) : (
                                "Switch to 3D map"
                            )
                        }
                    />
                    <Button
                        neutral
                        primary={this.props.mapControlsToolsOpen ? true : false}
                        icon="build"
                        className="primary-map-button mini-xs"
                        onClick={() => {
                            this.props.appActions.setMapControlsToolsOpen(
                                !this.props.mapControlsToolsOpen
                            );
                        }}
                        data-tip="Tools"
                        data-place="right"
                        aria-label="Tools"
                    />
                </div>
                <div id="mapToolsMenu" className={toolsMenuClasses}>
                    <ContextMenuSubMenu
                        tabIndex={this.props.mapControlsToolsOpen ? 0 : -1}
                        title="Measure"
                        icon=""
                        customIcon="ms ms-measure-distance context-menu-icon"
                    >
                        <MenuItem data={{}}>
                            <Button
                                primary={measuringDistance}
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.enableMeasuring(
                                        appStrings.GEOMETRY_LINE_STRING,
                                        appStrings.MEASURE_DISTANCE
                                    );
                                }}
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                aria-label="Measure Distance"
                                className="context-menu-item"
                            >
                                <i className="ms ms-measure-distance context-menu-icon" />
                                <span className="context-menu-label">
                                    Distance
                                </span>
                            </Button>
                        </MenuItem>
                        <MenuItem data={{}}>
                            <Button
                                primary={measuringArea}
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                aria-label="Measure Area"
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.enableMeasuring(
                                        appStrings.GEOMETRY_POLYGON,
                                        appStrings.MEASURE_AREA
                                    );
                                }}
                                className="context-menu-item"
                            >
                                <i className="ms ms-measure-area context-menu-icon" />
                                <span className="context-menu-label">Area</span>
                            </Button>
                        </MenuItem>
                        <hr className="divider medium-light" />
                        <MenuItem data={{}}>
                            <Button
                                label="Clear Measurements"
                                aria-label="Clear Measurements"
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                icon="delete"
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.removeAllMeasurements();
                                }}
                                className="context-menu-item"
                            />
                        </MenuItem>
                    </ContextMenuSubMenu>
                    <ContextMenuSubMenu
                        tabIndex={this.props.mapControlsToolsOpen ? 0 : -1}
                        title="Draw"
                        icon="mode_edit"
                        customIcon=""
                    >
                        <MenuItem data={{}}>
                            <Button
                                primary={drawingCircle}
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                label="Circle"
                                aria-label="Circle"
                                icon="radio_button_unchecked"
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.enableDrawing(
                                        appStrings.GEOMETRY_CIRCLE
                                    );
                                }}
                                className="context-menu-item"
                            />
                        </MenuItem>
                        <MenuItem data={{}}>
                            <Button
                                primary={drawingLineString}
                                aria-label="Polyline"
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.enableDrawing(
                                        appStrings.GEOMETRY_LINE_STRING
                                    );
                                }}
                                className="context-menu-item"
                            >
                                <i className="ms ms-line context-menu-icon" />
                                <span className="context-menu-label">
                                    Polyline
                                </span>
                            </Button>
                        </MenuItem>
                        <MenuItem data={{}}>
                            <Button
                                primary={drawingPolygon}
                                aria-label="Polygon"
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.enableDrawing(
                                        appStrings.GEOMETRY_POLYGON
                                    );
                                }}
                                className="context-menu-item"
                            >
                                <i className="ms ms-polygon context-menu-icon" />
                                <span className="context-menu-label">
                                    Polygon
                                </span>
                            </Button>
                        </MenuItem>
                        <hr className="divider medium-light" />
                        <MenuItem data={{}}>
                            <Button
                                label="Clear Drawings"
                                aria-label="Clear Drawings"
                                tabIndex={
                                    this.props.mapControlsToolsOpen ? 0 : -1
                                }
                                icon="delete"
                                onClick={() => {
                                    this.props.appActions.setMapControlsToolsOpen(
                                        false
                                    );
                                    this.props.actions.removeAllDrawings();
                                }}
                                className="context-menu-item"
                            />
                        </MenuItem>
                    </ContextMenuSubMenu>
                    <hr className="divider medium-light" />
                    <MenuItem className="menu-i" data={{}}>
                        <Button
                            label="Clear Map"
                            icon="delete"
                            aria-label="Clear Map"
                            tabIndex={this.props.mapControlsToolsOpen ? 0 : -1}
                            onClick={() => {
                                this.props.appActions.setMapControlsToolsOpen(
                                    false
                                );
                                this.handleClearMap();
                            }}
                            className="context-menu-item"
                        />
                    </MenuItem>
                </div>
            </div>
        );
    }
}

MapControlsContainerExtended.propTypes = {
    in3DMode: PropTypes.bool.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapControlsHidden: PropTypes.bool.isRequired,
    mapControlsToolsOpen: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    drawing: PropTypes.object.isRequired,
    measuring: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapControlsBoxVisible: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        drawing: state.map.get("drawing"),
        measuring: state.map.get("measuring"),
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsToolsOpen: state.view.get("mapControlsToolsOpen"),
        mapControlsHidden: state.view.get("mapControlsHidden"),
        mapControlsBoxVisible: state.view.get("mapControlsBoxVisible")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch),
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    MapControlsContainerExtended
);
