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
import DateRangeIcon from "material-ui-icons/DateRange";
import Collapse from "material-ui/transitions/Collapse";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import { Colorbar } from "_core/components/Colorbar";
import colorbarStylesExtended from "components/LayerMenu/ColorbarStylesExtended.scss";
import { Manager, Target, Popper } from "react-popper";
import {
    LayerPositionIcon,
    LayerPositionControl,
    LayerOpacityIcon,
    LayerOpacityControl
} from "_core/components/LayerMenu";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import stylesExtended from "components/LayerMenu/LayerControlContainerExtendedStyles.scss";
import { MenuItem } from "material-ui/Menu";
import LayerDateControl from "components/LayerMenu/LayerDateControl";
import MiscUtil from "_core/utils/MiscUtil";

export class GriddedLayerControlContainer extends LayerControlContainerCore {
    constructor(props) {
        super(props);

        this.isChangingOpacity = false;
        this.isChangingPosition = false;
        this.isChangingDate = false;
        this.opacityButton = null;
    }
    shouldComponentUpdate(nextProps) {
        if (
            !nextProps.griddedSettings
                .get("currentDate")
                .isSame(this.props.griddedSettings.get("currentDate"))
        ) {
            return true;
        }
        return LayerControlContainerCore.prototype.shouldComponentUpdate.call(this, nextProps);
    }
    toggleDatePickerVisible() {
        this.isChangingDate = !this.isChangingDate;
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.forceUpdate();
    }

    toggleChangingOpacity() {
        this.isChangingOpacity = !this.isChangingOpacity;
        this.isChangingPosition = false;
        this.isChangingDate = false;
        this.forceUpdate();
    }

    toggleChangingPosition() {
        this.isChangingPosition = !this.isChangingPosition;
        this.isChangingOpacity = false;
        this.isChangingDate = false;
        this.forceUpdate();
    }

    setLayerActive(active) {
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.props.mapActions.setLayerActive(this.props.layer.get("id"), !active);
        this.props.mapActionsExtended.updateFeatureList_Layer(this.props.layer.get("id"), !active);
    }

    renderTopContent() {
        let currentGriddedDate = this.props.griddedSettings
            .get("currentDate")
            .format("MMM Do, YYYY");
        let title = (
            <div>
                {this.props.layer.get("title")}
                <Typography style={{ display: "inline" }} variant="caption">
                    &nbsp;({currentGriddedDate})
                </Typography>
            </div>
        );
        return (
            <ListItem
                dense={true}
                classes={{ dense: styles.dense, root: stylesExtended.griddedLayerListItem }}
            >
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
                    <ListItemText primary={title} />
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
                    <Target
                        style={{
                            display: "inline-block"
                        }}
                    >
                        <Tooltip title="Choose date" placement="left">
                            <IconButtonSmall onClick={() => this.toggleDatePickerVisible()}>
                                <DateRangeIcon />
                            </IconButtonSmall>
                        </Tooltip>
                    </Target>
                    <Popper
                        placement="left"
                        modifiers={{
                            computeStyle: {
                                gpuAcceleration: false
                            }
                        }}
                        eventsEnabled={this.isChangingDate}
                        className={!this.isChangingDate ? displayStyles.noPointer : ""}
                    >
                        <Grow style={{ transformOrigin: "right" }} in={this.isChangingDate}>
                            <div>
                                <LayerDateControl
                                    updateDate={date =>
                                        this.props.mapActionsExtended.updateGriddedDate(date)
                                    }
                                    onClose={() => this.toggleDatePickerVisible()}
                                    griddedSettings={this.props.griddedSettings}
                                />
                            </div>
                        </Grow>
                    </Popper>

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

GriddedLayerControlContainer.propTypes = {
    mapActions: PropTypes.object.isRequired,
    mapActionsExtended: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    // griddedSettings: PropTypes.object.isRequired,
    activeNum: PropTypes.number.isRequired,
    palette: PropTypes.object
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        griddedSettings: state.map.get("griddedSettings")
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GriddedLayerControlContainer);
