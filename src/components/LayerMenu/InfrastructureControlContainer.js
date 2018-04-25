import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsExtended from "actions/mapActions";
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
import { EnhancedSwitch, IconButtonSmall } from "_core/components/Reusables";
import styles from "_core/components/LayerMenu/LayerControlContainer.scss";
import textStyles from "_core/styles/text.scss";
import displayStyles from "_core/styles/display.scss";
import Tooltip from "material-ui/Tooltip";
import { ListItem, ListItemSecondaryAction, ListItemText } from "material-ui/List";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
import Collapse from "material-ui/transitions/Collapse";
import { Colorbar } from "_core/components/Colorbar";
import Divider from "material-ui/Divider";
import Grid from "material-ui/Grid";
import colorbarStyles from "_core/components/Colorbar/Colorbar.scss";
import colorbarStylesExtended from "components/LayerMenu/ColorbarStylesExtended.scss";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import { Manager, Target, Popper } from "react-popper";
import {
    LayerPositionIcon,
    LayerPositionControl,
    LayerOpacityIcon,
    LayerOpacityControl
} from "_core/components/LayerMenu";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "_core/components/Reusables/ClickAwayListener";
import stylesExtended from "components/LayerMenu/LayerControlContainerExtendedStyles.scss";
import MiscUtil from "_core/utils/MiscUtil";

export class InfrastructureControlContainer extends LayerControlContainerCore {
    setLayerActive(active) {
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.props.mapActionsExtended.setGroupVisible(this.props.layer, !active);
    }
    renderTopContent() {
        return (
            <ListItem dense={true} classes={{ dense: styles.dense }}>
                <Tooltip
                    title={this.props.layer.get("isActive") ? "Hide Layer" : "Show Layer"}
                    placement="right"
                >
                    <EnhancedSwitch
                        checked={this.props.layer.get("isActive")}
                        onChange={(value, checked) => this.setLayerActive(!checked)}
                        onClick={evt => this.setLayerActive(evt.target.checked)}
                    />
                </Tooltip>
                <span className={textStyles.textEllipsis}>
                    <ListItemText primary={this.props.layer.get("title")} />
                </span>
                <ListItemSecondaryAction
                    classes={{
                        root: `${styles.secondaryActionRoot} ${
                            this.props.layer.get("isActive")
                                ? displayStyles.invisible
                                : displayStyles.hiddenFadeIn
                        }`
                    }}
                >
                    <Tooltip title="Layer information" placement="left">
                        <IconButtonSmall onClick={() => this.openLayerInfo()}>
                            <InfoOutlineIcon />
                        </IconButtonSmall>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
        );
    }
    renderLegend() {
        return (
            <span className={colorbarStylesExtended.infrastructureLegend}>
                <Grid container spacing={0}>
                    {Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).map(key => (
                        <Grid key={key} item xs className={colorbarStyles.label}>
                            <span
                                className={colorbarStylesExtended.legendColor}
                                style={{
                                    background:
                                        layerSidebarTypes.INFRASTRUCTURE_GROUPS[key].colors
                                            .fillNoTransparency
                                }}
                            />
                            <br />
                            {key}
                        </Grid>
                    ))}
                </Grid>
            </span>
        );
    }
    renderBottomContent() {
        return (
            <div>
                <Collapse
                    in={this.props.layer.get("isActive")}
                    timeout="auto"
                    className={styles.layerControl}
                    classes={{ entered: styles.collapseEntered }}
                >
                    <div className={styles.layerControlContent}>
                        {this.renderLegend()}
                        {this.renderIconRow()}
                    </div>
                </Collapse>
                <Divider />
            </div>
        );
    }

    renderIconRow() {
        let positionPopoverClasses = MiscUtil.generateStringFromSet({
            [styles.popover]: true,
            [styles.positionPopover]: true,
            [displayStyles.noPointer]: !this.isChangingPosition
        });

        let opacityPopoverClasses = MiscUtil.generateStringFromSet({
            [styles.popover]: true,
            [displayStyles.noPointer]: !this.isChangingOpacity
        });

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.layerControlIconRow]: true,
            [stylesExtended.layerControlIconRow]: true
        });

        return (
            <span className={containerClasses}>
                <Manager style={{ display: "inline-block" }}>
                    <ClickAwayListener
                        onClickAway={() => {
                            if (this.isChangingOpacity) {
                                this.toggleChangingOpacity();
                            }
                        }}
                    >
                        <span>
                            <Target style={{ display: "inline-block" }}>
                                <Tooltip title={"Set Layer Opacity"} placement="top">
                                    <LayerOpacityIcon
                                        opacity={this.props.layer.get("opacity")}
                                        className={styles.iconButtonSmall}
                                        color={this.isChangingOpacity ? "primary" : "default"}
                                        onClick={() => this.toggleChangingOpacity()}
                                    />
                                </Tooltip>
                            </Target>
                            <Popper
                                placement="left-end"
                                modifiers={{
                                    computeStyle: {
                                        gpuAcceleration: false
                                    }
                                }}
                                className={opacityPopoverClasses}
                                eventsEnabled={this.isChangingOpacity}
                            >
                                <Grow
                                    style={{ transformOrigin: "right" }}
                                    in={this.isChangingOpacity}
                                >
                                    <div>
                                        <LayerOpacityControl
                                            isActive={this.isChangingOpacity}
                                            opacity={this.props.layer.get("opacity")}
                                            onChange={value => this.changeOpacity(value)}
                                        />
                                    </div>
                                </Grow>
                            </Popper>
                        </span>
                    </ClickAwayListener>
                </Manager>
                <Tooltip title="Layer information" placement="top">
                    <IconButtonSmall
                        className={styles.iconButtonSmall}
                        onClick={() => this.openLayerInfo()}
                    >
                        <InfoOutlineIcon />
                    </IconButtonSmall>
                </Tooltip>
            </span>
        );
    }
}

InfrastructureControlContainer.propTypes = {
    mapActionsExtended: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    activeNum: PropTypes.number.isRequired,
    layer: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(InfrastructureControlContainer);
