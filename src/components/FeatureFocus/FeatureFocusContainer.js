import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import * as appStrings from "_core/constants/appStrings";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import MiscUtil from "_core/utils/MiscUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import FontIcon from "react-toolbox/lib/font_icon";

const miscUtil = new MiscUtil();

export class FeatureFocusContainer extends Component {
    render() {
        const featureName = this.props.activeFeature.get("name");
        return (
            <div id="featureFocusContainer">
                <div id="featureFocusImageHeaderRow" className="row">
                    <div className="col-sm-12 text-left">
                        <img src="fake_info_img.png" />
                        <Button raised>Back to Map</Button>
                    </div>
                </div>
                <div id="featureFocusHeaderRow" className="row">
                    <div className="col-sm-12 text-left">
                        <h2>
                            {featureName}
                        </h2>
                    </div>
                </div>
            </div>
        );
    }
}

FeatureFocusContainer.propTypes = {
    activeFeature: PropTypes.object.isRequired
    //     // id: PropTypes.string.isRequired,
    //     // category: PropTypes.string.isRequired
};

function mapStateToProps(state) {
    return {
        activeFeature: state.featureFocus.get("activeFeature")
        // availableFeatures: state.layerSidebar.get("availableFeatures"),
        //         layerMenuOpen: state.view.get("layerMenuOpen"),
        //         layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA]),
        //         palettes: state.map.get("palettes"),
        //         distractionFreeMode: state.view.get("distractionFreeMode")
    };
}

// function mapDispatchToProps(dispatch) {
//     return {
//         setLayerSidebarCategory: bindActionCreators(layerSidebarActions.setLayerSidebarCategory, dispatch)
//     };
// }

export default connect(
    mapStateToProps,
    null
    // mapDispatchToProps
)(FeatureFocusContainer);
