import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Typography from "material-ui/Typography";
import IconButton from "material-ui/IconButton";
import MiscUtil from "_core/utils/MiscUtil";
import { ListItemSecondaryAction } from "material-ui/List";
import MiscUtilExtended from "utils/MiscUtilExtended";
import MyLocationIcon from "material-ui-icons/MyLocation";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
// import Divider from "material-ui/Divider";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/Map/MapTooltipStyles.scss";
import * as mapActionsMSF from "actions/mapActions";
import MetadataUtil from "utils/MetadataUtil";
import * as layerSidebarActions from "actions/layerSidebarActions";

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
                let roundedIME = MiscUtilExtended.roundTo(feature.get("ime"), 2);
                title = dateString;
                subtitle1 = (
                    <React.Fragment>
                        {roundedIME} kg/m <sup>2</sup> IME
                    </React.Fragment>
                );
                subtitle2 = feature.get("name");
            } else if (
                this.props.activeFeature.get("category") ===
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE
            ) {
                title = feature.get("name");
                subtitle1 = "No Flyovers";
                subtitle2 = feature.get("category");
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
                    <Typography className={styles.title} color="default" type="body1" noWrap>
                        {title}
                    </Typography>
                    <Typography color="secondary" type="caption" noWrap>
                        {subtitle1}
                    </Typography>
                    <Typography color="secondary" type="caption" noWrap>
                        {subtitle2}
                    </Typography>
                </div>
                <ListItemSecondaryAction>
                    <span ref={ref => (this.zoomToRef = ref)}>
                        <IconButton>
                            {this.props.activeFeature.get("feature") ? (
                                <MyLocationIcon />
                            ) : (
                                <span />
                            )}
                        </IconButton>
                    </span>

                    <span ref={ref => (this.detailsRef = ref)}>
                        <IconButton>
                            {this.props.activeFeature.get("feature") ? (
                                <InfoOutlineIcon />
                            ) : (
                                <span />
                            )}
                        </IconButton>
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
