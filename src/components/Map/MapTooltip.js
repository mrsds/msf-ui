import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Typography from "@material-ui/core/Typography";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import MiscUtilExtended from "utils/MiscUtilExtended";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/Map/MapTooltipStyles.scss";
import * as mapActionsMSF from "actions/mapActions";
import * as layerSidebarActions from "actions/layerSidebarActions";
import MetadataUtil from "utils/MetadataUtil";
import Button from "@material-ui/core/Button";

export class MapTooltip extends Component {
    shouldComponentUpdate(nextProps) {
        return !nextProps.activeFeature.equals(this.props.activeFeature);
    }
    render() {
        let title = "Title";
        let subtitle1 = "Subtitle1";
        let subtitle2 = "Subtitle2";
        let feature = this.props.activeFeature.get("feature");
        if (feature) {
            if (this.props.activeFeature.get("category") === layerSidebarTypes.CATEGORY_PLUMES) {
                const datetime = feature.get("datetime");
                const dateString = MiscUtilExtended.formatPlumeDatetime(datetime);
                title = dateString;
                subtitle1 = feature.get("flux") ? (
                    <React.Fragment>
                        {MiscUtilExtended.roundTo(feature.get("flux"), 2) + " kg/hr"}
                    </React.Fragment>
                ) : (
                    <br />
                );
                subtitle2 = feature.get("name");
            } else if (
                this.props.activeFeature.get("category") ===
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE
            ) {
                title = feature.get("name");
                subtitle1 = feature.get("num_flights_matching") + " flyovers";
                subtitle2 = MetadataUtil.getFacilityTypeName(feature);
            }
        }

        // Sad workaround for openlayers due to overlay click event issues...
        // see https://github.com/openlayers/openlayers/issues/6948
        if (this.zoomToRef && !this.zoomToRef.onclick) {
            this.zoomToRef.onclick = () => {
                this.props.centerMapOnFeature(
                    this.props.activeFeature.get("feature"),
                    this.props.activeFeature.get("category") === layerSidebarTypes.CATEGORY_PLUMES
                        ? "AVIRIS"
                        : "VISTA"
                );
            };
        }
        if (this.detailsRef && !this.detailsRef.onclick) {
            this.detailsRef.onclick = () => {
                this.props.setFeatureDetail(
                    this.props.activeFeature.get("category"),
                    this.props.activeFeature.get("feature")
                );
            };
        }

        return (
            <div id="mapTooltip" className={styles.tooltip}>
                <div>
                    <Typography className={styles.title} color="default" variant="body1" noWrap>
                        {title}
                    </Typography>
                    <Typography color="default" variant="caption" noWrap>
                        {subtitle1}
                    </Typography>
                    <Typography color="default" variant="caption" noWrap>
                        {subtitle2}
                    </Typography>
                </div>
                <ListItemSecondaryAction className={styles.listItemSecondaryAction}>
                    <span ref={ref => (this.zoomToRef = ref)}>
                        <Button
                            color="default"
                            style={{ margin: 0 }}
                            key={feature ? feature.get("id") + "popup_zoom_to" : ""}
                        >
                            Zoom To
                        </Button>
                    </span>
                    <span ref={ref => (this.detailsRef = ref)}>
                        <Button
                            color="default"
                            key={feature ? feature.get("id") + "popup_details" : ""}
                        >
                            Details
                        </Button>
                    </span>
                </ListItemSecondaryAction>
            </div>
        );
    }
}

MapTooltip.propTypes = {
    activeFeature: PropTypes.object,
    centerMapOnFeature: PropTypes.func.isRequired,
    setFeatureDetail: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        activeFeature: state.map.get("activeFeature")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        centerMapOnFeature: bindActionCreators(mapActionsMSF.centerMapOnFeature, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapTooltip);
