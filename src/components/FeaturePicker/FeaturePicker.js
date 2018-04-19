import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/FeaturePicker/FeaturePickerStyles.scss";
import { Popover, PopoverAnimationVertical } from "material-ui/Popover";
import { Menu, MenuItem } from "material-ui/Menu";
import Card, { CardActions, CardContent, CardMedia } from "material-ui/Card";
import List, {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction
} from "material-ui/List";
import Typography from "material-ui/Typography";
import layerSidebarStyles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import MetadataUtil from "utils/MetadataUtil";
import MiscUtilExtended from "utils/MiscUtilExtended";
import Divider from "material-ui/Divider";
import Subheader from "material-ui/List/ListSubheader";
import * as mapActionsMSF from "actions/mapActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import IconButton from "material-ui/IconButton";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
import * as layerSidebarActions from "actions/layerSidebarActions";

export class FeaturePicker extends Component {
    makeInfrastructureItem(feature) {
        const isActive =
            this.props.activeFeature && feature.get("id") === this.props.activeFeature.get("id");
        const listItemRootClassnames = MiscUtilExtended.generateStringFromSet({
            [layerSidebarStyles.selectedItem]: isActive,
            [layerSidebarStyles.itemRoot]: true
        });
        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem
                    className={layerSidebarStyles.itemRoot}
                    classes={{
                        root: listItemRootClassnames,
                        container: layerSidebarStyles.listItemContainer
                    }}
                    onClick={() =>
                        this.props.toggleFeatureLabel(
                            layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                            feature
                        )
                    }
                    onMouseEnter={() =>
                        this.props.setActivePickerFeature(
                            layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                            feature
                        )
                    }
                    onMouseLeave={() => this.props.setActivePickerFeature()}
                    button
                >
                    <div className={layerSidebarStyles.listItemTextContainer}>
                        <Typography
                            color="default"
                            className={layerSidebarStyles.listItemText}
                            variant="body1"
                            noWrap
                        >
                            {feature.get("name")}
                        </Typography>
                        <Typography
                            color="default"
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {MetadataUtil.getFacilityTypeName(feature)}
                        </Typography>
                    </div>{" "}
                    <ListItemSecondaryAction>
                        <IconButton>
                            <InfoOutlineIcon
                                onClick={() =>
                                    this.props.setFeatureDetail(
                                        layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                                        feature
                                    )
                                }
                            />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            </React.Fragment>
        );
    }

    makeInfrastructureItems() {
        if (!this.props.infrastructure.size) return null;
        return this.props.infrastructure.map(this.makeInfrastructureItem.bind(this));
    }

    makePlumeItem(feature) {
        const isActive =
            this.props.activeFeature && feature.get("id") === this.props.activeFeature.get("id");
        const listItemRootClassnames = MiscUtilExtended.generateStringFromSet({
            [layerSidebarStyles.selectedItem]: isActive,
            [layerSidebarStyles.itemRoot]: true
        });
        const datetime = feature.get("datetime");
        const dateString = MiscUtilExtended.formatPlumeDatetime(datetime);
        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem
                    className={layerSidebarStyles.itemRoot}
                    classes={{
                        root: listItemRootClassnames,
                        container: layerSidebarStyles.listItemContainer
                    }}
                    onClick={() =>
                        this.props.toggleFeatureLabel(layerSidebarTypes.CATEGORY_PLUMES, feature)
                    }
                    onMouseEnter={() =>
                        this.props.setActivePickerFeature(
                            layerSidebarTypes.CATEGORY_PLUMES,
                            feature
                        )
                    }
                    onMouseLeave={() => this.props.setActivePickerFeature()}
                    button
                >
                    <div className={layerSidebarStyles.listItemTextContainer}>
                        <Typography
                            color="default"
                            className={layerSidebarStyles.listItemText}
                            variant="body1"
                            noWrap
                        >
                            {dateString}
                        </Typography>
                        <Typography
                            color="default"
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {feature.get("name")}
                        </Typography>
                    </div>
                    <ListItemSecondaryAction>
                        <span>
                            <IconButton>
                                <InfoOutlineIcon
                                    onClick={() =>
                                        this.props.setFeatureDetail(
                                            layerSidebarTypes.CATEGORY_PLUMES,
                                            feature
                                        )
                                    }
                                />
                            </IconButton>
                        </span>
                    </ListItemSecondaryAction>
                </ListItem>
            </React.Fragment>
        );
    }

    makePlumeItems() {
        if (!this.props.plumes.size) return null;
        return this.props.plumes.map(this.makePlumeItem.bind(this));
    }

    getPickerStyle() {
        if (
            this.props.plumes.size + this.props.infrastructure.size <= 1 ||
            (this.props.featureDetailActiveFeature && this.props.featureDetailActiveFeature.size)
        ) {
            return { display: "none" };
        }
        const topPos = this.props.clickEvt.pixel[1] + "px";
        const leftPos = this.props.clickEvt.pixel[0] + 470 + "px";
        return {
            position: "absolute",
            top: topPos,
            left: leftPos
        };
    }

    render() {
        if (!this.props.plumes && !this.props.infrastructure) return null;
        return (
            <div className={styles.featurePicker} style={this.getPickerStyle()}>
                <Card>
                    <CardContent>
                        <List dense={true} className={layerSidebarStyles.featureItemList}>
                            <Subheader hidden={!this.props.infrastructure.size}>
                                Infrastructure
                            </Subheader>
                            {this.makeInfrastructureItems()}
                            <Divider
                                hidden={!this.props.plumes.size || !this.props.infrastructure.size}
                            />
                            <Subheader hidden={!this.props.plumes.size}>Plumes</Subheader>
                            {this.makePlumeItems()}
                        </List>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

FeaturePicker.propTypes = {
    clickEvt: PropTypes.object,
    infrastructure: PropTypes.object,
    plumes: PropTypes.object,
    activeFeature: PropTypes.object,
    closeFeaturePicker: PropTypes.func.isRequired,
    setActivePickerFeature: PropTypes.func.isRequired,
    toggleFeatureLabel: PropTypes.func.isRequired,
    setFeatureDetail: PropTypes.func.isRequired,
    featureDetailActiveFeature: PropTypes.object
};

function mapStateToProps(state) {
    return {
        clickEvt: state.map.getIn(["featurePicker", "clickEvt"]),
        infrastructure: state.map.getIn(["featurePicker", "infrastructure"]),
        plumes: state.map.getIn(["featurePicker", "plumes"]),
        activeFeature: state.map.getIn(["featurePicker", "activeFeature"]),
        featureDetailActiveFeature: state.featureDetail.get("feature")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        closeFeaturePicker: bindActionCreators(mapActionsMSF.closeFeaturePicker, dispatch),
        setActivePickerFeature: bindActionCreators(mapActionsMSF.setActivePickerFeature, dispatch),
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeaturePicker);