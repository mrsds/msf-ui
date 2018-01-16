import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Divider from "material-ui/Divider";
import { ListItem, ListItemSecondaryAction, ListItemText } from "material-ui/List";
// import Divider from "material-ui/Divider";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
// import Typography from "material-ui/Typography";
import Tooltip from "material-ui/Tooltip";
import Collapse from "material-ui/transitions/Collapse";
// import Popover from "material-ui/Popover";
// import Grow from "material-ui/transitions/Grow";
// import ClickAwayListener from "material-ui/utils/ClickAwayListener";
// import { Manager, Target, Popper } from "react-popper";
import { EnhancedSwitch, IconButtonSmall } from "_core/components/Reusables";
// import * as layerActions from "_core/actions/LayerActions";
// import * as layerActionsExtended from "actions/LayerActions_Extended";
import * as mapActionsExtended from "actions/mapActions";
import * as mapActions from "_core/actions/mapActions";
// import Colorbar from "_core/components/LayerMenu/Colorbar";
import MiscUtil from "_core/utils/MiscUtil";
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
import styles from "_core/components/LayerMenu/LayerControlContainer.scss";
import textStyles from "_core/styles/text.scss";
import displayStyles from "_core/styles/display.scss";

const miscUtil = new MiscUtil();

export class GroupControlContainer extends LayerControlContainerCore {
    setLayerActive(active) {
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.props.mapActionsExtended.setGroupVisible(this.props.layer, !active);
    }
}

GroupControlContainer.propTypes = {
    mapActionsExtended: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(GroupControlContainer);
