import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsMSF from "actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import { MapContainer2D as CoreMapContainer2D } from "_core/components/Map/MapContainer2D";

export class MapContainer2D extends CoreMapContainer2D {
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
