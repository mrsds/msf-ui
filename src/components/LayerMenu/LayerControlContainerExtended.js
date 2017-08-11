import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, IconButton } from "react-toolbox/lib/button";
import Switch from "react-toolbox/lib/switch";
import Slider from "react-toolbox/lib/slider";
import * as layerActions from "_core/actions/LayerActions";
import * as layerActionsExtended from "actions/LayerActions_Extended";
import Colorbar from "_core/components/LayerMenu/Colorbar";
import MiscUtil from "_core/utils/MiscUtil";
import { LayerControlContainer as CoreLayerControlContainer } from "_core/components/LayerMenu/LayerControlContainer";
import {
    OpacityIcon0,
    OpacityIcon25,
    OpacityIcon50,
    OpacityIcon75,
    OpacityIcon100,
    LayerIconTop,
    LayerIconMiddle,
    LayerIconBottom
} from "_core/components/Reusables/CustomIcons";

const miscUtil = new MiscUtil();

export class LayerControlContainer extends CoreLayerControlContainer {
    setLayerActive(active) {
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.props.actions.setLayerActive(this.props.layer.get("id"), active);
        this.props.actionsExtended.updateActiveFeatureCategories(
            this.props.layer.get("id"),
            active
        );
    }
}

LayerControlContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    activeNum: PropTypes.number.isRequired,
    palette: PropTypes.object
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(layerActions, dispatch),
        actionsExtended: bindActionCreators(layerActionsExtended, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(LayerControlContainer);
