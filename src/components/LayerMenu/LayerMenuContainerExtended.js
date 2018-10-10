import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import * as appStrings from "_core/constants/appStrings";
import * as mapActions from "_core/actions/mapActions";
import { IconButtonSmall } from "_core/components/Reusables";
import LayerControlContainerExtended from "components/LayerMenu/LayerControlContainerExtended";
import InfrastructureControlContainer from "components/LayerMenu/InfrastructureControlContainer";
import GriddedLayerControlContainer from "components/LayerMenu/GriddedLayerControlContainer";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/LayerMenu/LayerMenuContainer.scss";
import stylesExtended from "components/LayerMenu/LayerMenuContainerExtendedStyles.scss";
import displayStyles from "_core/styles/display.scss";
import PlumesControlContainer from "components/LayerMenu/PlumesControlContainer";
import SourceControlContainer from "components/LayerMenu/SourceControlContainer";
import { ButtonBase } from "@material-ui/core";

export class LayerMenuContainer extends Component {
    render() {
        let layerList = this.props.layers
            .filter(layer => !layer.get("isDisabled"))
            .filter(layer => !layer.get("group"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));
        let totalNum = layerList.size;
        let activeNum = layerList.count(el => {
            return el.get("isActive");
        });

        // css classes
        let layerMenuClasses = MiscUtil.generateStringFromSet({
            [styles.layerMenu]: true,
            [stylesExtended.layerMenu]: true,
            [displayStyles.hiddenFadeOut]: this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]: !this.props.distractionFreeMode
        });

        let collapseIconClasses = MiscUtil.generateStringFromSet({
            [styles.expand]: !this.props.layerMenuOpen,
            [styles.collapse]: this.props.layerMenuOpen
        });

        let plumeLayer = layerList.find(x => x.get("id") === "AVIRIS");
        let griddedMethaneLayer = layerList.find(x => x.get("id") === "GRIDDED_EMISSIONS_V2");
        let infrastructureLayer = this.props.groups.get(0);
        let sourceLayer = layerList.find(x => x.get("id") === "AVIRIS_SOURCES");
        let plumeLayerControl = null;
        let infrastructureLayerControl = null;
        let griddedMethaneLayerControl = null;
        let sourceLayerControl = null;

        if (plumeLayer && griddedMethaneLayer && infrastructureLayer && sourceLayer) {
            sourceLayerControl = (
                <SourceControlContainer
                    key={sourceLayer.get("id") + "_layer_listing"}
                    layer={sourceLayer}
                    activeNum={activeNum}
                    palette={this.props.palettes.get(sourceLayer.getIn(["palette", "name"]))}
                    currentZoom={this.props.currentZoom}
                />
            );

            plumeLayerControl = (
                <PlumesControlContainer
                    key={plumeLayer.get("id") + "_layer_listing"}
                    layer={plumeLayer}
                    activeNum={activeNum}
                    palette={this.props.palettes.get(plumeLayer.getIn(["palette", "name"]))}
                    currentZoom={this.props.currentZoom}
                />
            );

            infrastructureLayerControl = (
                <InfrastructureControlContainer
                    activeNum={activeNum}
                    key={infrastructureLayer.get("id") + "_layer_listing"}
                    layer={infrastructureLayer}
                />
            );

            griddedMethaneLayerControl = (
                <GriddedLayerControlContainer
                    key={griddedMethaneLayer.get("id") + "_layer_listing"}
                    layer={griddedMethaneLayer}
                    activeNum={activeNum}
                    palette={this.props.palettes.get(
                        griddedMethaneLayer.getIn(["palette", "name"])
                    )}
                />
            );
        }

        return (
            <div className={layerMenuClasses}>
                <Paper elevation={1}>
                    <Tooltip
                        title={this.props.layerMenuOpen ? "Close layer menu" : "Open layer menu"}
                        placement="left"
                    >
                        <div
                            className={stylesExtended.layerHeaderRow}
                            onClick={evt => {
                                evt.stopPropagation();
                                this.props.setLayerMenuOpen(!this.props.layerMenuOpen);
                            }}
                        >
                            <ButtonBase>
                                <div className={stylesExtended.layerHeader}>
                                    <Typography variant="subheading" color="inherit">
                                        Map Layers
                                    </Typography>
                                </div>
                                <KeyboardArrowDownIcon
                                    color="inherit"
                                    className={collapseIconClasses}
                                />
                            </ButtonBase>
                        </div>
                    </Tooltip>
                    <Collapse
                        className={stylesExtended.collapseElement}
                        in={this.props.layerMenuOpen}
                        timeout="auto"
                    >
                        <div className={stylesExtended.layerMenuContent}>
                            <List disablePadding>
                                {/* Manually create layers here since it would be too troublesome to get the order correct otherwise
                                since we have to deal with these layer groups.. */}
                                {sourceLayerControl}
                                {plumeLayerControl}
                                {infrastructureLayerControl}
                                {griddedMethaneLayerControl}
                            </List>
                        </div>
                    </Collapse>
                </Paper>
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
    palettes: PropTypes.object.isRequired,
    mapState: PropTypes.object
};

function mapStateToProps(state) {
    return {
        layerMenuOpen: state.view.get("layerMenuOpen"),
        layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA]),
        groups: state.map.get("groups"),
        palettes: state.map.get("palettes"),
        distractionFreeMode: state.view.get("distractionFreeMode"),
        currentZoom: state.map.get("currentZoom")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLayerMenuOpen: bindActionCreators(mapActions.setLayerMenuOpen, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerMenuContainer);
