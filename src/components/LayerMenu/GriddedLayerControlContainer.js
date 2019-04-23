import { Manager, Target, Popper } from "react-popper";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Collapse from "@material-ui/core/Collapse";
import DateRangeIcon from "@material-ui/icons/DateRange";
import Grow from "@material-ui/core/Grow";
import InfoOutlineIcon from "@material-ui/icons/InfoOutline";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import PropTypes from "prop-types";
import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import { Colorbar } from "_core/components/Colorbar";
import { EnhancedSwitch, IconButtonSmall, ClickAwayListener } from "_core/components/Reusables";
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
import { LayerOpacityIcon, LayerOpacityControl } from "_core/components/LayerMenu";
import LayerDateControl from "components/LayerMenu/LayerDateControl";
import * as MSFTypes from "constants/MSFTypes";
import MiscUtil from "_core/utils/MiscUtil";
import colorbarStylesExtended from "components/LayerMenu/ColorbarStylesExtended.scss";
import displayStyles from "_core/styles/display.scss";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsExtended from "actions/mapActions";
import styles from "_core/components/LayerMenu/LayerControlContainer.scss";
import stylesExtended from "components/LayerMenu/LayerControlContainerExtendedStyles.scss";
import textStyles from "_core/styles/text.scss";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";

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
                .isSame(this.props.griddedSettings.get("currentDate")) ||
            nextProps.griddedSettings.get("activeLayer") !==
                this.props.griddedSettings.get("activeLayer")
        ) {
            return true;
        }
        return LayerControlContainerCore.prototype.shouldComponentUpdate.call(this, nextProps);
    }

    setLayerActive(active) {
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.props.mapActionsExtended.setGroupVisible(this.props.group, !active);
        this.props.mapActionsExtended.changeActiveGriddedLayer(
            this.props.griddedSettings.get("activeLayer")
        );
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

    openLayerInfo() {
        this.props.mapActions.loadLayerMetadata(
            this.props.layers.find(
                l => l.get("id") === this.props.griddedSettings.get("activeLayer")
            )
        );
    }

    getDateFormat() {
        const period = appConfig.GRIDDED_LAYER_TYPES.find(
            l => l.name === this.props.griddedSettings.get("activeLayer")
        ).period;

        switch (period) {
            case "daily":
                return "MMM Do, YYYY";
            case "monthly":
                return "MMM YYYY";
            case "yearly":
                return "YYYY";
        }
    }

    renderTopContent() {
        let currentGriddedDate = this.props.griddedSettings
            .get("currentDate")
            .format(this.getDateFormat());

        let title = (
            <div>
                {this.props.group.get("title")}
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
                    title={this.props.group.get("isActive") ? "Hide Layer" : "Show Layer"}
                    placement="right"
                >
                    <EnhancedSwitch
                        checked={this.props.group.get("isActive")}
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
                            this.props.group.get("isActive")
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

    renderSublayerSelection() {
        return (
            <select
                onChange={e =>
                    this.props.mapActionsExtended.changeActiveGriddedLayer(e.target.value)
                }
                className={stylesExtended.dropdownSelect}
            >
                {appConfig.GRIDDED_LAYER_TYPES.map(type => (
                    <option key={type.name} value={type.name}>
                        {this.props.layers.find(l => l.get("id") === type.name).get("title")}
                    </option>
                ))}
            </select>
        );
    }

    renderDateIcon() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.layerControlIconRow]: true,
            [stylesExtended.layerControlIconRow]: true
        });

        return (
            <span className={containerClasses}>
                <div style={{ display: "unset" }}>
                    {this.props.griddedSettings.get("currentDate").format(this.getDateFormat())}
                </div>
                <Manager style={{ display: "unset" }}>
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
                                    incrementDate={(period, goBack) =>
                                        this.props.mapActionsExtended.incrementGriddedDate(
                                            period,
                                            goBack
                                        )
                                    }
                                    onClose={() => this.toggleDatePickerVisible()}
                                    griddedSettings={this.props.griddedSettings}
                                />
                            </div>
                        </Grow>
                    </Popper>
                </Manager>
            </span>
        );
    }

    renderBottomContent() {
        const activeLayer = this.props.layers.find(
            l => l.get("id") === this.props.griddedSettings.get("activeLayer")
        );
        const paletteName = activeLayer.getIn(["palette", "name"]);
        const palette = this.props.palettes.find(p => p.get("id") === paletteName);
        const units = activeLayer.get("units");

        return (
            <div>
                <Collapse
                    in={this.props.group.get("isActive")}
                    timeout="auto"
                    className={styles.layerControl}
                    classes={{ entered: styles.collapseEntered }}
                >
                    <div className={styles.layerControlContent}>
                        <div className={stylesExtended.controlRow}>
                            {this.renderSublayerSelection()}
                            {this.renderDateIcon()}
                        </div>
                        <div className={stylesExtended.controlRow}>
                            <Colorbar
                                palette={palette}
                                min={parseFloat(this.props.layer.get("min"))}
                                max={parseFloat(this.props.layer.get("max"))}
                                units={units}
                                displayMin={this.props.layer.getIn(["palette", "min"])}
                                displayMax={this.props.layer.getIn(["palette", "max"])}
                                handleAs={this.props.layer.getIn(["palette", "handleAs"])}
                                url={this.props.layer.getIn(["palette", "url"])}
                                className={colorbarStylesExtended.colorbar}
                            />
                            {this.renderIconRow()}
                        </div>
                    </div>
                </Collapse>
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

GriddedLayerControlContainer.propTypes = {
    mapActions: PropTypes.object.isRequired,
    mapActionsExtended: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    griddedSettings: PropTypes.object.isRequired,
    activeNum: PropTypes.number.isRequired,
    palette: PropTypes.object,
    layers: PropTypes.object,
    palettes: PropTypes.object
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        griddedSettings: state.map.get("griddedSettings"),
        layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA]),
        palettes: state.map.get("palettes")
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GriddedLayerControlContainer);
