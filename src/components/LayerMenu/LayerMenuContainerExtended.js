import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Collapse from "material-ui/transitions/Collapse";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import Tooltip from "material-ui/Tooltip";
import KeyboardArrowUpIcon from "material-ui-icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "material-ui-icons/KeyboardArrowDown";
import List from "material-ui/List";
import Paper from "material-ui/Paper";
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
        let plumeLayerControl = null;
        let infrastructureLayerControl = null;
        let griddedMethaneLayerControl = null;
        if (plumeLayer && griddedMethaneLayer && infrastructureLayer) {
            plumeLayerControl = (
                <LayerControlContainerExtended
                    key={plumeLayer.get("id") + "_layer_listing"}
                    layer={plumeLayer}
                    activeNum={activeNum}
                    palette={this.props.palettes.get(plumeLayer.getIn(["palette", "name"]))}
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
                    <div className={styles.layerHeaderRow}>
                        <div className={styles.layerHeader}>
                            <Typography variant="subheading" color="inherit">
                                Map Layers
                            </Typography>
                        </div>
                        <div className="text-right">
                            <Tooltip
                                title={
                                    this.props.layerMenuOpen
                                        ? "Close layer menu"
                                        : "Open layer menu"
                                }
                                placement="bottom"
                            >
                                <IconButtonSmall
                                    className={collapseIconClasses}
                                    color="default"
                                    onClick={() =>
                                        this.props.setLayerMenuOpen(!this.props.layerMenuOpen)
                                    }
                                >
                                    <KeyboardArrowDownIcon />
                                </IconButtonSmall>
                            </Tooltip>
                        </div>
                    </div>
                    <Collapse
                        className={stylesExtended.collapseElement}
                        in={this.props.layerMenuOpen}
                        timeout="auto"
                    >
                        <div className={stylesExtended.layerMenuContent}>
                            <List disablePadding>
                                {/* Manually create layers here since it would be too troublesome to get the order correct otherwise
                                since we have to deal with these layer groups.. */}
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
        setLayerMenuOpen: bindActionCreators(mapActions.setLayerMenuOpen, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerMenuContainer);
