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
import * as mapActionsExtended from "actions/MapActions_Extended";
import Colorbar from "_core/components/LayerMenu/Colorbar";
import MiscUtil from "_core/utils/MiscUtil";
import { LayerControlContainer } from "components/LayerMenu/LayerControlContainerExtended";
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

export class GroupControlContainer extends LayerControlContainer {
    setGroupActive(active) {
        this.isChangingPosition = false;
        this.isChangingOpacity = false;
        this.props.actions.setGroupVisible(this.props.group, active);
        // this.props.actionsExtended.updateActiveFeatureCategories(
        //     this.props.layer.get("id"),
        //     active
        // );
    }

    openGroupInfo() {
        console.log("Got nuffin");
    }

    render() {
        let containerClasses = miscUtil.generateStringFromSet({
            "layer-control pos-rel": true,
            active: this.props.group.get("isActive")
        });
        let switchClasses = miscUtil.generateStringFromSet({
            "layer-toggle": true,
            active: this.props.group.get("isActive")
        });
        let sliderContainerClasses = miscUtil.generateStringFromSet({
            "opacity-slider-container row middle-xs": true,
            active: this.isChangingOpacity
        });
        let positionContainerClasses = miscUtil.generateStringFromSet({
            "position-controls-container": true,
            active: this.isChangingPosition
        });
        // let colorbarRangeClasses = miscUtil.generateStringFromSet({
        //     "row middle-xs colorbar-range-wrapper": true,
        //     active: this.props.layer.getIn(["palette", "handleAs"]) !== ""
        // });
        let currOpacity = Math.floor(this.props.group.get("opacity") * 100);
        let layerOrderClassName = miscUtil.generateStringFromSet({
            "layer-order-label": true,
            active: this.isChangingPosition
        });
        let opacityIcon =
            currOpacity === 0 ? (
                <OpacityIcon0 />
            ) : currOpacity < 50 ? (
                <OpacityIcon25 />
            ) : currOpacity < 75 ? (
                <OpacityIcon50 />
            ) : currOpacity < 100 ? (
                <OpacityIcon75 />
            ) : (
                <OpacityIcon100 />
            );

        let layerOrderIcon =
            this.props.group.get("displayIndex") === 1 ? (
                <LayerIconTop />
            ) : this.props.group.get("displayIndex") ===
            this.props.activeNum ? (
                <LayerIconBottom />
            ) : (
                <LayerIconMiddle />
            );

        return (
            <div className={containerClasses}>
                <div className="row middle-xs">
                    <div className="col-xs-2 text-left toggle">
                        <div
                            data-tip={
                                this.props.group.get("isActive") ? (
                                    "Hide Layer"
                                ) : (
                                    "Show Layer"
                                )
                            }
                            data-place="left"
                        >
                            <Switch
                                className={switchClasses}
                                checked={this.props.group.get("isActive")}
                                onChange={active => this.setGroupActive(active)}
                            />
                        </div>
                    </div>
                    <span
                        className="layer-header text-ellipsis col-xs-9"
                        data-tip={this.props.group.get("title")}
                        data-place="left"
                    >
                        {this.props.group.get("title")}
                    </span>
                    <span className="col-xs-1 inactive-info-btn">
                        <IconButton
                            icon="info_outline"
                            className="no-padding mini-xs-waysmall"
                            data-tip="Layer information"
                            data-place="left"
                            onClick={() => this.openGroupInfo()}
                        />
                    </span>
                </div>
                <div className="lower-content">
                    <div className="row middle-xs">
                        <div className="col-xs-3 text-right no-padding">
                            <IconButton
                                primary={this.isChangingPosition}
                                disabled={!this.props.group.get("isActive")}
                                className="no-padding mini-xs-waysmall"
                                data-tip={
                                    !this.isChangingPosition ? (
                                        "Adjust layer positioning"
                                    ) : null
                                }
                                data-place="left"
                                tabIndex={
                                    this.props.group.get("isActive") ? 0 : -1
                                }
                                onClick={() => this.toggleChangingPosition()}
                            >
                                {/*<i className="button-icon ms ms-fw ms-layers-overlay" />*/}
                                {layerOrderIcon}
                                <span className={layerOrderClassName}>
                                    {this.props.group.get("displayIndex")}
                                </span>
                            </IconButton>
                            <div className={positionContainerClasses}>
                                <div className="popover-label">
                                    Layer Positioning
                                </div>
                                <div className="position-control-content row middle-xs">
                                    <Button
                                        primary
                                        label="Top"
                                        className="position-control-button col-xs-6"
                                        onClick={() => this.moveToTop()}
                                    />
                                    <Button
                                        primary
                                        label="Up"
                                        className="position-control-button col-xs-6"
                                        onClick={() => this.moveUp()}
                                    />
                                    <Button
                                        primary
                                        label="Bottom"
                                        className="position-control-button col-xs-6"
                                        onClick={() => this.moveToBottom()}
                                    />
                                    <Button
                                        primary
                                        label="Down"
                                        className="position-control-button col-xs-6"
                                        onClick={() => this.moveDown()}
                                    />
                                </div>
                            </div>
                            <IconButton
                                primary={this.isChangingOpacity}
                                disabled={!this.props.group.get("isActive")}
                                className="no-padding mini-xs-waysmall"
                                data-tip={
                                    !this.isChangingOpacity ? (
                                        "Adjust layer opacity"
                                    ) : null
                                }
                                data-place="left"
                                tabIndex={
                                    this.props.group.get("isActive") ? 0 : -1
                                }
                                onClick={() => this.toggleChangingOpacity()}
                            >
                                {opacityIcon}
                            </IconButton>
                            <div className={sliderContainerClasses}>
                                <div className="popover-label">
                                    Layer Opacity
                                </div>
                                <div className="opacity-slider-content row middle-xs">
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={10}
                                        value={
                                            this.props.group.get("opacity") *
                                            100
                                        }
                                        className="react-toolbox-slider-overrides col-xs-9 no-padding"
                                        onChange={value =>
                                            this.changeOpacity(value)}
                                    />
                                    <span className="opacity-label col-xs-3 no-padding">
                                        {currOpacity}%
                                    </span>
                                </div>
                            </div>
                            <IconButton
                                icon="info_outline"
                                className="no-padding mini-xs-waysmall"
                                data-tip="Layer information"
                                data-place="left"
                                tabIndex={
                                    this.props.group.get("isActive") ? 0 : -1
                                }
                                onClick={() => this.openGroupInfo()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

GroupControlContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    group: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(layerActionsExtended, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(GroupControlContainer);
