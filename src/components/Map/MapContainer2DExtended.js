import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "_core/actions/MapActions";
import * as actions_extended from "actions/MapActions_Extended";
import * as appStrings from "_core/constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";
import { MapContainer2D as CoreMapContainer2D } from "_core/components/Map/MapContainer2D";

const miscUtil = new MiscUtil();

export class MapContainer2D extends CoreMapContainer2D {
    handleMapMoveEnd(map) {
        // Only fire move event if this map is active
        // and target inactive map
        this.props.actions_extended.updateFeatureList();
        if (map.isActive) {
            this.props.actions.setMapView(
                {
                    extent: map.getExtent(),
                    projection: map.getProjection()
                },
                false
            );
        }
    }

    handlePixelClick(map, clickEvt) {
        // Only fire move event if this map is active
        if (map.isActive) {
            this.props.actions_extended.pixelClick(clickEvt);
        }
    }
}

MapContainer2D.propTypes = {
    maps: PropTypes.object.isRequired,
    units: PropTypes.string.isRequired,
    in3DMode: PropTypes.bool.isRequired,
    initialLoadComplete: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    actions_extended: PropTypes.object.isRequired,
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
        actions: bindActionCreators(actions, dispatch),
        actions_extended: bindActionCreators(actions_extended, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer2D);
