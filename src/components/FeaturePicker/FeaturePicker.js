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
import { Line as LineChart } from "react-chartjs-2";
import appConfig from "constants/appConfig";

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

    makePlumeChart() {
        if(this.props.sdapPlumeChartData != null) {
            return (
                <React.Fragment>
                    <div className={styles.chartContainer}>
                        <LineChart data={this.props.sdapPlumeChartData} options={this.props.sdapPlumeChartOptions} height={250} redraw={true} />
                    </div>
                </React.Fragment>
            );
        }
        // Get lat lon coords for SDAP call
        let coordChecker = {
            infrastructure: null,
            plumes: null
        };
        if (this.props.infrastructure.size) {
            let runningInfraMinLat = this.props.infrastructure.get(0).get('metadata').get('LLat');
            let runningInfraMinLon = this.props.infrastructure.get(0).get('metadata').get('LLon');
            let runningInfraMaxLat = this.props.infrastructure.get(0).get('metadata').get('LLat');
            let runningInfraMaxLon = this.props.infrastructure.get(0).get('metadata').get('LLon');
            this.props.infrastructure.forEach(infra => {
                if (infra.get('metadata').get('LLat') < runningInfraMinLat) {
                    runningInfraMinLat = infra.get('metadata').get('LLat');
                }
                if (infra.get('metadata').get('LLat') > runningInfraMaxLat) {
                    runningInfraMaxLat = infra.get('metadata').get('LLat');
                }
                if (infra.get('metadata').get('LLon') < runningInfraMinLon) {
                    runningInfraMinLon = infra.get('metadata').get('LLon');
                }
                if (infra.get('metadata').get('LLon') > runningInfraMaxLon) {
                    runningInfraMaxLon = infra.get('metadata').get('LLon');
                }
            });
            coordChecker.infrastructure = {
                latMax: runningInfraMaxLat,
                lonMax: runningInfraMaxLon,
                latMin: runningInfraMinLat,
                lonMin: runningInfraMinLon
            };
        }
        if (this.props.plumes.size) {
            let runningPlumeMinLat = this.props.plumes.get(0).get('location').get(0);
            let runningPlumeMinLon = this.props.plumes.get(0).get('location').get(1);
            let runningPlumeMaxLat = this.props.plumes.get(0).get('location').get(0);
            let runningPlumeMaxLon = this.props.plumes.get(0).get('location').get(1);
            this.props.plumes.forEach(plume => {
                if (plume.get('location').get(0) < runningPlumeMinLat) {
                    runningPlumeMinLat = plume.get('location').get(0);
                }
                if (plume.get('location').get(0) > runningPlumeMaxLat) {
                    runningPlumeMaxLat = plume.get('location').get(0);
                }
                if (plume.get('location').get(1) < runningPlumeMinLon) {
                    runningPlumeMinLon = plume.get('location').get(1);
                }
                if (plume.get('location').get(1) > runningPlumeMaxLon) {
                    runningPlumeMaxLon = plume.get('location').get(1);
                }
            });
            coordChecker.plumes = {
                latMax: runningPlumeMaxLat,
                lonMax: runningPlumeMaxLon,
                latMin: runningPlumeMinLat,
                lonMin: runningPlumeMinLon
            };
        }
        let latMax = 0;
        let lonMax = 0;
        let latMin = 0;
        let lonMin = 0;
        if(coordChecker.plumes && coordChecker.infrastructure) {
            latMax = Math.max(coordChecker.infrastructure.latMax, coordChecker.plumes.latMax);
            lonMax = Math.max(coordChecker.infrastructure.lonMax, coordChecker.plumes.lonMax);
            latMin = Math.min(coordChecker.infrastructure.latMin, coordChecker.plumes.latMin);
            lonMin = Math.min(coordChecker.infrastructure.lonMin, coordChecker.plumes.lonMin);
        } else {
            latMax = coordChecker.infrastructure ? coordChecker.infrastructure.latMax : coordChecker.plumes.latMax;
            lonMax = coordChecker.infrastructure ? coordChecker.infrastructure.lonMax : coordChecker.plumes.lonMax;
            latMin = coordChecker.infrastructure ? coordChecker.infrastructure.latMin : coordChecker.plumes.latMin;
            lonMin = coordChecker.infrastructure ? coordChecker.infrastructure.lonMin : coordChecker.plumes.lonMin;
        }
        // SDAP call will fail if min = max, so change values to be a range
        if (latMax == latMin) {
            latMax = latMax + 0.25;
            latMin = latMin - 0.25;
        }
        if (lonMax == lonMin) {
            lonMax = lonMax + 0.25;
            lonMin = lonMin - 0.25;
        }
        this.props.getSdapChartData(
        appConfig.URLS.sdapTimeSeriesSpark
            .replace("{latMax}", latMax)
            .replace("{lonMax}", lonMax)
            .replace("{latMin}", latMin)
            .replace("{lonMin}", lonMin)
            .replace("{timeStart}", "2015-01-28T00:00:00Z")
            .replace("{timeEnd}", "2016-12-24T23:59:59Z"),
        );
        return (
            <React.Fragment>
                <div className={styles.chartContainer}>
                    N/A
                </div>
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
        if ((!this.props.plumes || !this.props.plumes.size) && 
            (!this.props.infrastructure || !this.props.infrastructure.size)) return null;
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
                            {this.makePlumeChart()}
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
    setHoverPlume: PropTypes.func.isRequired,
    getSdapChartData: PropTypes.func.isRequired,
    sdapPlumeChartData: PropTypes.object,
    sdapPlumeChartOptions: PropTypes.object
};

function mapStateToProps(state) {
    return {
        clickEvt: state.map.getIn(["featurePicker", "clickEvt"]),
        infrastructure: state.map.getIn(["featurePicker", "infrastructure"]),
        plumes: state.map.getIn(["featurePicker", "plumes"]),
        activeFeature: state.map.getIn(["featurePicker", "activeFeature"]),
        layerSidebarCollapsed: state.layerSidebar.get("layerSidebarCollapsed"),
        featureDetailActiveFeature: state.featureDetail.get("feature"),
        sdapPlumeChartData: state.map.getIn(["sdapChart", "data"]),
        sdapPlumeChartOptions: state.map.getIn(["sdapChart", "options"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        closeFeaturePicker: bindActionCreators(mapActionsMSF.closeFeaturePicker, dispatch),
        setActivePickerFeature: bindActionCreators(mapActionsMSF.setActivePickerFeature, dispatch),
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch),
        setHoverPlume: bindActionCreators(mapActionsMSF.setHoverPlume, dispatch),
        getSdapChartData: bindActionCreators(mapActionsMSF.getSdapChartData, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeaturePicker);
