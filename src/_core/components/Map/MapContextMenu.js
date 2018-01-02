import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ContextMenu } from "react-contextmenu";
import { hideMenu } from "react-contextmenu/modules/actions";
import { MapToolsMenu } from "_core/components/Reusables";
import * as actions from "_core/actions/MapActions";
import * as appStrings from "_core/constants/appStrings";

export class MapContextMenu extends Component {
    render() {
        return (
            <ContextMenu id={appStrings.MAP_CONTEXT_MENU_ID}>
                <MapToolsMenu handleRequestClose={() => hideMenu()} />
            </ContextMenu>
        );
    }
}

MapContextMenu.propTypes = {
    drawing: PropTypes.object.isRequired,
    measuring: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        drawing: state.map.get("drawing"),
        measuring: state.map.get("measuring")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapContextMenu);
