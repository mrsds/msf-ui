import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsMSF from "actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import { MapContainer2D as CoreMapContainer2D } from "_core/components/Map/MapContainer2D";

export class MapContainer2D extends CoreMapContainer2D {
    initializeMapListeners() {
        let map = this.props.maps.get(appStrings.MAP_LIB_2D);
        if (typeof map !== "undefined") {
            // mouse event listeners
            map.addEventListener(appStrings.EVENT_MOVE_END, () => this.handleMapMoveEnd(map));
            map.addEventListener(appStrings.EVENT_MOUSE_HOVER, pixel =>
                this.handlePixelHover(map, pixel)
            );
            map.addEventListener(appStrings.EVENT_MOUSE_CLICK, clickEvt =>
                this.handlePixelClick(map, clickEvt)
            );

            // draw handlers
            map.addDrawHandler(
                appStrings.GEOMETRY_CIRCLE,
                geometry => this.handleDrawEnd(geometry),
                appStrings.INTERACTION_DRAW
            );
            map.addDrawHandler(
                appStrings.GEOMETRY_LINE_STRING,
                geometry => this.handleDrawEnd(geometry),
                appStrings.INTERACTION_DRAW
            );
            map.addDrawHandler(
                appStrings.GEOMETRY_POLYGON,
                geometry => this.handleDrawEnd(geometry),
                appStrings.INTERACTION_DRAW
            );

            // measurement listeners
            map.addDrawHandler(
                appStrings.GEOMETRY_LINE_STRING,
                geometry => this.handleMeasureEnd(geometry, appStrings.MEASURE_DISTANCE),
                appStrings.INTERACTION_MEASURE
            );
            map.addDrawHandler(
                appStrings.GEOMETRY_POLYGON,
                geometry => this.handleMeasureEnd(geometry, appStrings.MEASURE_AREA),
                appStrings.INTERACTION_MEASURE
            );

            map.addVistaLayerHandler(appStringsMSF.VISTA_LAYER_UPDATED, _ => {
                this.props.mapActionsMSF.updateVistaFeatureList();
                this.props.mapActionsMSF.vistaLayersLoaded();
            });

            map.addVistaLayerHandler(
                appStringsMSF.UPDATING_VISTA_LAYER,
                this.props.mapActionsMSF.updatingVistaLayer
            );

            map.addAvirisLayerHandler(appStringsMSF.AVIRIS_LAYER_UPDATED, _ => {
                this.props.mapActionsMSF.updateAvirisFeatureList();
                this.props.mapActionsMSF.avirisLayerLoaded();
            });

            map.addAvirisLayerHandler(
                appStringsMSF.UPDATING_AVIRIS_LAYER,
                this.props.mapActionsMSF.updatingAvirisLayer
            );
        } else {
            console.error("Cannot initialize event listeners: 2D MAP NOT AVAILABLE");
        }
    }

    handleMapMoveEnd(map) {
        // Only fire move event if this map is active
        // and target inactive map
        if (map.isActive) {
            this.props.mapActions.setMapView(
                {
                    extent: map.getExtent(),
                    projection: map.getProjection()
                },
                false
            );
        }
        this.props.mapActionsMSF.updateFeatureList_Map();
    }

    handlePixelClick(map, clickEvt) {
        // Only fire move event if this map is active
        if (map.isActive) {
            this.props.mapActionsMSF.pixelClick(clickEvt);
        }
    }
}

MapContainer2D.propTypes = {
    maps: PropTypes.object.isRequired,
    units: PropTypes.string.isRequired,
    in3DMode: PropTypes.bool.isRequired,
    initialLoadComplete: PropTypes.bool.isRequired,
    mapActions: PropTypes.object.isRequired,
    mapActionsMSF: PropTypes.object.isRequired,
    extent: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        maps: state.map.get("maps"),
        units: state.map.getIn(["displaySettings", "selectedScaleUnits"]),
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        initialLoadComplete: state.view.get("initialLoadComplete"),
        extent: state.map.getIn(["view", "extent"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsMSF: bindActionCreators(mapActionsMSF, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer2D);
