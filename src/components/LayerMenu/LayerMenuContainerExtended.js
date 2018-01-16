import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Collapse from "material-ui/transitions/Collapse";
import Typography from "material-ui/Typography";
import Tooltip from "material-ui/Tooltip";
import KeyboardArrowUpIcon from "material-ui-icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "material-ui-icons/KeyboardArrowDown";
import List from "material-ui/List";
import Paper from "material-ui/Paper";
import * as appStrings from "_core/constants/appStrings";
import * as mapActions from "_core/actions/mapActions";
import { IconButtonSmall } from "_core/components/Reusables";
import LayerControlContainerExtended from "components/LayerMenu/LayerControlContainerExtended";
import GroupControlContainer from "components/LayerMenu/GroupControlContainer";
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

        layerList.sort((a, b) => {
            const aOrder = a.get("layerOrder");
            const bOrder = b.get("layerOrder");
            if (!aOrder && !bOrder) return 0;
            if (!aOrder) return -1;
            if (!bOrder) return 1;
            return aOrder - bOrder;
        });

        return (
            <div className={layerMenuClasses}>
                <Paper elevation={1}>
                    <div className={styles.layerHeaderRow}>
                        <div className={styles.layerHeader}>
                            <Typography type="subheading" color="inherit">
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
                    <Collapse in={this.props.layerMenuOpen} timeout="auto">
                        <div className={styles.layerMenuContent}>
                            <List disablePadding>
                                {this.props.groups.map(group => (
                                    <GroupControlContainer key={group} layer={group} />
                                ))}
                                {layerList.map(layer => (
                                    <LayerControlContainerExtended
                                        key={layer.get("id") + "_layer_listing"}
                                        layer={layer}
                                        activeNum={activeNum}
                                        palette={this.props.palettes.get(
                                            layer.getIn(["palette", "name"])
                                        )}
                                    />
                                ))}
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
