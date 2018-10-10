import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsExtended from "actions/mapActions";
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
import { EnhancedSwitch, IconButtonSmall, ClickAwayListener } from "_core/components/Reusables";
import styles from "_core/components/LayerMenu/LayerControlContainer.scss";
import textStyles from "_core/styles/text.scss";
import displayStyles from "_core/styles/display.scss";
import Tooltip from "@material-ui/core/Tooltip";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import InfoOutlineIcon from "@material-ui/icons/InfoOutline";
import DateRangeIcon from "@material-ui/icons/DateRange";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import { Colorbar } from "_core/components/Colorbar";
import colorbarStylesExtended from "components/LayerMenu/ColorbarStylesExtended.scss";
import { Manager, Target, Popper } from "react-popper";
import {
    LayerPositionIcon,
    LayerPositionControl,
    LayerOpacityIcon,
    LayerOpacityControl
} from "_core/components/LayerMenu";
import Grow from "@material-ui/core/Grow";
import stylesExtended from "components/LayerMenu/LayerControlContainerExtendedStyles.scss";
import MiscUtil from "_core/utils/MiscUtil";

export class PlumesControlContainer extends LayerControlContainerCore {
    constructor(props) {
        super(props);
        this.isChangingOpacity = false;
        this.isChangingPosition = false;
        this.opacityButton = null;
    }

    shouldComponentUpdate(nextProps) {
        let nextLayer = nextProps.layer;
        let currLayer = this.props.layer;
        return (
            nextProps.palette !== this.props.palette ||
            nextLayer.get("title") !== currLayer.get("title") ||
            nextLayer.get("opacity") !== currLayer.get("opacity") ||
            nextLayer.get("isActive") !== currLayer.get("isActive") ||
            nextLayer.get("palette") !== currLayer.get("palette") ||
            nextLayer.get("min") !== currLayer.get("min") ||
            nextLayer.get("max") !== currLayer.get("max") ||
            nextLayer.get("units") !== currLayer.get("units") ||
            nextLayer.get("displayIndex") !== currLayer.get("displayIndex") ||
            nextProps.currentZoom !== this.props.currentZoom
        );
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
                        {this.renderIconRow()}
                        {this.getColorbar()}
                    </div>
                </Collapse>
                <Divider />
            </div>
        );
    }

    getColorbar() {
        // if (this.props.currentZoom < 12) {
        //     return <img src="img/PlumeIcon.png" className={stylesExtended.icon} />;
        // }
        return (
            <Colorbar
                palette={this.props.palette}
                min={parseFloat(this.props.layer.get("min"))}
                max={parseFloat(this.props.layer.get("max"))}
                units={this.props.layer.get("units")}
                displayMin={this.props.layer.getIn(["palette", "min"])}
                displayMax={this.props.layer.getIn(["palette", "max"])}
                handleAs={this.props.layer.getIn(["palette", "handleAs"])}
                url={this.props.layer.getIn(["palette", "url"])}
                className={colorbarStylesExtended.colorbar}
            />
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

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });
        return (
            <div className={containerClasses}>
                {this.renderTopContent()}
                {this.renderBottomContent()}
            </div>
        );
    }
}

PlumesControlContainer.propTypes = {
    mapActions: PropTypes.object.isRequired,
    mapActionsExtended: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    activeNum: PropTypes.number.isRequired,
    palette: PropTypes.object,
    currentZoom: PropTypes.number
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(PlumesControlContainer);
