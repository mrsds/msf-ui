import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ContextMenuTrigger } from "react-contextmenu";
import { bindActionCreators } from "redux";
import * as appStrings from "_core/constants/appStrings";
import * as actions from "_core/actions/mapActions";
import { MapContainer } from "_core/components/Map";
import MapContainer2DExtended from "components/Map/MapContainer2DExtended";
import styles from "_core/components/Map/MapContainer.scss";

export class MapContainerExtended extends MapContainer {
    render() {
        return (
            <div ref="container" className={styles.mapContainer}>
                <ContextMenuTrigger id={appStrings.MAP_CONTEXT_MENU_ID} holdToDisplay={-1}>
                    <MapContainer2DExtended />
                </ContextMenuTrigger>
            </div>
        );
    }
}

MapContainerExtended.propTypes = {
    actions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(MapContainerExtended);
