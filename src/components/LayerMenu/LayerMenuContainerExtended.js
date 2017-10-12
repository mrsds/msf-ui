import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, IconButton } from "react-toolbox/lib/button";
import * as appStrings from "_core/constants/appStrings";
import * as layerActions from "_core/actions/LayerActions";
import { LayerMenuContainer as CoreLayerMenuContainer } from "_core/components/LayerMenu/LayerMenuContainer";
import LayerControlContainer from "components/LayerMenu/LayerControlContainerExtended";
import GroupControlContainer from "components/LayerMenu/GroupControlContainer";
import MiscUtil from "_core/utils/MiscUtil";

const miscUtil = new MiscUtil();

export class LayerMenuContainer extends CoreLayerMenuContainer {
    render() {
        let layerList = this.props.layers
            .filter(layer => !layer.get("isDisabled"))
            .filter(layer => !layer.get("group"))
            .toList()
            .sort(miscUtil.getImmutableObjectSort("title"));
        let totalNum = layerList.size;
        let activeNum = layerList.count(el => {
            return el.get("isActive");
        });

        // css classes
        let layerMenuClasses = miscUtil.generateStringFromSet({
            open: this.props.layerMenuOpen,
            "hidden-fade-out": this.props.distractionFreeMode,
            "hidden-fade-in": !this.props.distractionFreeMode
        });
        layerList.sort((a, b) => {
            const aOrder = a.get("layerOrder");
            const bOrder = b.get("layerOrder");
            if (!aOrder && !bOrder) return 0;
            if (!aOrder) return -1;
            if (!bOrder) return 1;
            return aOrder - bOrder;
        });
        return (
            <div id="layerMenu" className={layerMenuClasses}>
                <div id="layerHeaderRow" className="row middle-xs">
                    <div className="col-xs-8 text-left">
                        <span className="layer-menu-header">Map Layers</span>
                    </div>
                    <div className="col-xs-4 text-right">
                        <IconButton
                            neutral
                            inverse
                            data-tip={
                                this.props.layerMenuOpen ? (
                                    "Close layer menu"
                                ) : (
                                    "Open layer menu"
                                )
                            }
                            data-place="left"
                            icon={
                                this.props.layerMenuOpen ? (
                                    "keyboard_arrow_down"
                                ) : (
                                    "keyboard_arrow_up"
                                )
                            }
                            className="no-padding mini-xs-waysmall"
                            onClick={() =>
                                this.props.setLayerMenuOpen(
                                    !this.props.layerMenuOpen
                                )}
                        />
                    </div>
                </div>
                <div id="layerMenuContent">
                    {this.props.groups.map(group => (
                        <GroupControlContainer key={group} group={group} />
                    ))}
                    {layerList
                        .reverse()
                        .map(layer => (
                            <LayerControlContainer
                                key={layer.get("id") + "_layer_listing"}
                                layer={layer}
                                activeNum={activeNum}
                                palette={this.props.palettes.get(
                                    layer.getIn(["palette", "name"])
                                )}
                            />
                        ))}
                </div>
            </div>
        );
    }
}

LayerMenuContainer.propTypes = {
    setLayerMenuOpen: PropTypes.func.isRequired,
    layerMenuOpen: PropTypes.bool.isRequired,
    layers: PropTypes.object.isRequired,
    groups: PropTypes.object.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    palettes: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        layerMenuOpen: state.view.get("layerMenuOpen"),
        layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA]),
        groups: state.map.get("groups"),
        palettes: state.map.get("palettes"),
        distractionFreeMode: state.view.get("distractionFreeMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLayerMenuOpen: bindActionCreators(
            layerActions.setLayerMenuOpen,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerMenuContainer);
