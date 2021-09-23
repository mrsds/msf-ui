import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import styles from "components/FeaturePicker/FeaturePickerStyles.scss";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import MetadataUtil from "utils/MetadataUtil";
import MiscUtilExtended from "utils/MiscUtilExtended";
import Divider from "@material-ui/core/Divider";
import Subheader from "@material-ui/core/ListSubheader";
import * as mapActionsMSF from "actions/mapActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as layerSidebarActions from "actions/layerSidebarActions";
import CloseIcon from "@material-ui/icons/Close";
import { IconButtonSmall, ClickAwayListener } from "_core/components/Reusables";

export class FeaturePicker extends Component {
    makeInfrastructureItem(feature) {
        const isActive =
            this.props.activeFeature && feature.get("id") === this.props.activeFeature.get("id");
        const listItemRootClassnames = MiscUtilExtended.generateStringFromSet({
            [styles.selectedItem]: isActive,
            [styles.itemRoot]: true
        });

        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem
                    className={styles.itemRoot}
                    classes={{
                        root: listItemRootClassnames,
                        container: styles.listItemContainer
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
                    <div className={styles.listItemTextContainer}>
                        <Typography
                            color="default"
                            className={styles.listItemText}
                            variant="body1"
                            noWrap
                        >
                            {feature.get("name")}
                        </Typography>
                        <Typography
                            color="default"
                            className={styles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {feature.get("category")}
                        </Typography>
                    </div>
                    <ListItemSecondaryAction className={styles.listItemSecondaryAction}>
                        <Button
                            color="default"
                            key={feature.get("id") + "popup_info_icon"}
                            onClick={() =>
                                this.props.setFeatureDetail(
                                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                                    feature
                                )
                            }
                        >
                            Details
                        </Button>
                    </ListItemSecondaryAction>
                </ListItem>
            </React.Fragment>
        );
    }

    makeInfrastructureItems() {
        if (!this.props.infrastructure.size) return null;
        return this.props.infrastructure.map(x => this.makeInfrastructureItem(x));
    }

    makePlumeItem(feature) {
        if (!feature) return "";
        const isActive =
            this.props.activeFeature && feature.get("id") === this.props.activeFeature.get("id");
        const listItemRootClassnames = MiscUtilExtended.generateStringFromSet({
            [styles.selectedItem]: isActive,
            [styles.itemRoot]: true
        });
        const datetime = feature.get("datetime");
        const dateString = MiscUtilExtended.formatPlumeDatetime(datetime);
        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem
                    className={styles.itemRoot}
                    classes={{
                        root: listItemRootClassnames,
                        container: styles.listItemContainer
                    }}
                    onClick={() =>
                        this.props.toggleFeatureLabel(layerSidebarTypes.CATEGORY_PLUMES, feature)
                    }
                    onMouseEnter={() => this.props.setHoverPlume(feature)}
                    onMouseLeave={() => this.props.setHoverPlume(null)}
                    button
                >
                    <div className={styles.listItemTextContainer}>
                        <Typography
                            color="default"
                            className={styles.listItemText}
                            variant="body1"
                            noWrap
                        >
                            {dateString}
                        </Typography>
                        <Typography
                            color="default"
                            className={styles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {feature.get("name")}
                        </Typography>
                    </div>
                    <ListItemSecondaryAction className={styles.listItemSecondaryAction}>
                        <Button
                            color="default"
                            key={feature.get("id") + "popup_info_icon"}
                            onClick={() =>
                                this.props.setFeatureDetail(
                                    layerSidebarTypes.CATEGORY_PLUMES,
                                    feature
                                )
                            }
                        >
                            Details
                        </Button>
                    </ListItemSecondaryAction>
                </ListItem>
            </React.Fragment>
        );
    }

    makePlumeItems() {
        if (!this.props.plumes.size) return null;
        return this.props.plumes.map(x => this.makePlumeItem(x));
    }

    getPickerStyle() {
        if (
            this.props.plumes.size + this.props.infrastructure.size === 0 ||
            (this.props.featureDetailActiveFeature && this.props.featureDetailActiveFeature.size)
        ) {
            return {
                pickerStyle: {
                    display: "none"
                },
                pickerClass: ""
            };
        }
        const topPos = this.props.clickEvt.pixel[1] + 18 + "px";
        if (
            this.props.clickEvt.pixel[0] + 325 + (!this.props.layerSidebarCollapsed ? 520 : 70) >
            window.innerWidth
        ) {
            const rightPos =
                window.innerWidth -
                this.props.clickEvt.pixel[0] -
                (!this.props.layerSidebarCollapsed ? 430 : -20) +
                "px";
            return {
                pickerStyle: {
                    position: "absolute",
                    top: topPos,
                    right: rightPos
                },
                pickerClass: styles.featurePickerArrowRight
            };
        } else {
            const leftPos =
                this.props.clickEvt.pixel[0] +
                (!this.props.layerSidebarCollapsed ? 470 : 20) +
                "px";
            return {
                pickerStyle: {
                    position: "absolute",
                    top: topPos,
                    left: leftPos
                },
                pickerClass: styles.featurePickerArrowLeft
            };
        }
    }

    getCardStyle() {
        if (
            this.props.plumes.size + this.props.infrastructure.size <= 1 ||
            (this.props.featureDetailActiveFeature && this.props.featureDetailActiveFeature.size)
        ) {
            return {};
        }
        const topPos = this.props.clickEvt.pixel[1];
        const maxHeight = window.innerHeight - topPos - 40 + "px";
        return {
            maxHeight
        };
    }

    render() {
        if (!this.props.plumes && !this.props.infrastructure) return null;
        const { pickerStyle, pickerClass } = this.getPickerStyle();
        const rootClasses = MiscUtilExtended.generateStringFromSet({
            [pickerClass]: true,
            [styles.featurePicker]: true
        });
        return (
            <div className={rootClasses} style={pickerStyle}>
                <Card className={styles.cardRoot} style={this.getCardStyle()}>
                    <CardHeader
                        title="Plumes and Facilities at This Position"
                        classes={{
                            title: styles.pickerHeaderTitle,
                            root: styles.pickerHeaderRoot,
                            avatar: styles.pickerHeaderAvatar
                        }}
                        avatar={
                            <IconButtonSmall
                                onClick={this.props.closeFeaturePicker}
                                aria-label="Close Feature Pop-up"
                            >
                                <CloseIcon />
                            </IconButtonSmall>
                        }
                    />
                    <CardContent className={styles.cardContentRoot}>
                        <List dense={true} className={styles.featureItemList}>
                            <Subheader
                                disableSticky
                                className={styles.subheader}
                                hidden={!this.props.infrastructure.size}
                            >
                                Infrastructure
                            </Subheader>
                            {this.makeInfrastructureItems()}
                            <Divider
                                hidden={!this.props.plumes.size || !this.props.infrastructure.size}
                            />
                            <Subheader
                                disableSticky
                                className={styles.subheader}
                                hidden={!this.props.plumes.size}
                            >
                                Plumes
                            </Subheader>
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
    layerSidebarCollapsed: PropTypes.bool.isRequired,
    featureDetailActiveFeature: PropTypes.object,
    setHoverPlume: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        clickEvt: state.map.getIn(["featurePicker", "clickEvt"]),
        infrastructure: state.map.getIn(["featurePicker", "infrastructure"]),
        plumes: state.map.getIn(["featurePicker", "plumes"]),
        activeFeature: state.map.getIn(["featurePicker", "activeFeature"]),
        layerSidebarCollapsed: state.layerSidebar.get("layerSidebarCollapsed"),
        featureDetailActiveFeature: state.featureDetail.get("feature")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        closeFeaturePicker: bindActionCreators(mapActionsMSF.closeFeaturePicker, dispatch),
        setActivePickerFeature: bindActionCreators(mapActionsMSF.setActivePickerFeature, dispatch),
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch),
        setHoverPlume: bindActionCreators(mapActionsMSF.setHoverPlume, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeaturePicker);
