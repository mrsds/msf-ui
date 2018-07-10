import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloudOffOutlineIcon from "mdi-material-ui/CloudOffOutline";
import InfoOutlineIcon from "@material-ui/icons/InfoOutline";
import InfoIcon from "@material-ui/icons/Info";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import MiscUtilExtended from "utils/MiscUtilExtended";
import MetadataUtil from "utils/MetadataUtil";
import appConfig from "constants/appConfig";
import * as mapActionsMSF from "actions/mapActions";
import PageControls from "components/PageControls/PageControls";
import PlumeFiltersContainer from "components/MethaneSidebar/PlumeFiltersContainer";
import layerSidebarStyles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import SearchInput from "components/Reusables/SearchInput";
import MiscUtil from "_core/utils/MiscUtil";

export class PlumesContainer extends Component {
    // componentDidUpdate(prevProps) {
    //     console.log(this.props.isLoading, "isloading");
    //     if (
    //         !this.props.isLoading &&
    //         this.props.activeFeature.getIn(["feature", "id"]) &&
    //         prevProps.activeFeature.getIn(["feature", "id"]) !==
    //             this.props.activeFeature.getIn(["feature", "id"])
    //     ) {
    //         // Bring new active feature into view if needed
    //         let item = ReactDOM.findDOMNode(this.activeListItemRef);
    //         if (item) {
    //             console.log(item);
    //             console.log("item found, scrolling");
    //             // item.scrollIntoView();
    //         }
    //     }
    // }
    isActiveFeature(feature) {
        return (
            this.props.activeFeature.get("category") === layerSidebarTypes.CATEGORY_PLUMES &&
            feature.get("id") === this.props.activeFeature.getIn(["feature", "id"])
        );
    }

    isActiveDetailFeature(feature) {
        return (
            this.props.activeDetailFeature.get("category") === layerSidebarTypes.CATEGORY_PLUMES &&
            feature.get("id") === this.props.activeDetailFeature.getIn(["feature", "id"])
        );
    }

    makeListItem(feature) {
        const isDetailPageOpen = this.props.activeDetailFeature.getIn(["feature", "id"])
            ? true
            : false;
        const isActive = this.isActiveFeature(feature);
        const isActiveDetail = this.isActiveDetailFeature(feature);
        // const isItemPrimary = isActive || isActiveDetail;
        const isItemPrimary = isActive;
        const listItemRootClassnames = MiscUtilExtended.generateStringFromSet({
            [layerSidebarStyles.selectedItem]: isItemPrimary,
            [layerSidebarStyles.itemRoot]: true
        });
        const toggleDetailAction = isActiveDetail
            ? () => this.props.hideFeatureDetail()
            : () => this.props.setFeatureDetail(layerSidebarTypes.CATEGORY_PLUMES, feature);

        const onListItemClick = () => {
            if (isDetailPageOpen) {
                // If the list item clicked is the same as current feature detail
                // then close the detail
                if (isActiveDetail) {
                    this.props.hideFeatureDetail();
                } else {
                    this.props.setFeatureDetail(layerSidebarTypes.CATEGORY_PLUMES, feature);
                }
            } else if (!isActive) {
                this.props.toggleFeatureLabel(layerSidebarTypes.CATEGORY_PLUMES, feature);
            }
        };

        const lat = MetadataUtil.getLat(feature, null);
        const long = MetadataUtil.getLong(feature, null);
        const centerMapAction =
            lat && long ? () => this.props.centerMapOnFeature(feature, "AVIRIS") : null;

        const datetime = feature.get("datetime");
        const dateString = MiscUtilExtended.formatPlumeDatetime(datetime);
        // const plumeThumbnail = feature.get("rgbqlctr_url");
        const plumeThumbnail = feature.get("thumbnail");

        const listItemSecondaryActionClasses = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.selectedItemSecondary]: isItemPrimary,
            [layerSidebarStyles.listItemSecondaryAction]: true
        });
        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem
                    className={listItemRootClassnames}
                    classes={{
                        root: listItemRootClassnames,
                        container: layerSidebarStyles.listItemContainer
                    }}
                    button
                    onClick={onListItemClick}
                    onMouseEnter={() => this.props.setHoverPlume(feature)}
                    onMouseLeave={() => this.props.setHoverPlume(null)}
                >
                    <div className={layerSidebarStyles.imageContainer}>
                        <img src={plumeThumbnail} />
                    </div>
                    <div className={layerSidebarStyles.listItemTextContainer}>
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemText}
                            variant="body1"
                            noWrap
                        >
                            {dateString}
                        </Typography>
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {MiscUtilExtended.roundTo(feature.get("ime"), 2) + " kg IME"}
                        </Typography>
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {feature.get("name")}
                        </Typography>
                    </div>
                    <ListItemSecondaryAction
                        onMouseEnter={() => this.props.setHoverPlume(feature)}
                        onMouseLeave={() => this.props.setHoverPlume(null)}
                        className={listItemSecondaryActionClasses}
                    >
                        <Button
                            className={isItemPrimary ? layerSidebarStyles.buttonContrast : ""}
                            disabled={
                                !lat ||
                                !long ||
                                !this.props.activeDetailFeature.get("feature").isEmpty()
                            }
                            key={feature.get("id") + "_my_location_icon"}
                            onClick={centerMapAction}
                        >
                            Zoom To
                        </Button>
                        <Button
                            className={isItemPrimary ? layerSidebarStyles.buttonContrast : ""}
                            color={isActiveDetail ? "primary" : "default"}
                            key={feature.get("id") + "_info_icon"}
                            onClick={toggleDetailAction}
                        >
                            Details
                        </Button>
                    </ListItemSecondaryAction>
                </ListItem>
            </React.Fragment>
        );
    }

    makeListItems() {
        const currentPageIndex = this.props.searchState.get("pageIndex");
        const startIndex = currentPageIndex * layerSidebarTypes.FEATURES_PER_PAGE;
        const endIndex =
            (currentPageIndex + 1) * layerSidebarTypes.FEATURES_PER_PAGE >
            this.props.searchState.get("searchResults").size
                ? this.props.searchState.get("searchResults").size
                : (currentPageIndex + 1) * layerSidebarTypes.FEATURES_PER_PAGE;

        return this.props.searchState
            .get("searchResults")
            .slice(startIndex, endIndex)
            .map(feature => this.makeListItem(feature));
    }

    makeLoadingModal() {
        if (this.props.isLoading) {
            return (
                <div className={layerSidebarStyles.loadingModal}>
                    <CircularProgress />
                </div>
            );
        }
        return <div />;
    }

    makeResultsArea() {
        const hasResults = this.props.searchState.get("searchResults").size;
        const resultsClassname = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.sidebarContent]: true
        });
        let innerContent = "";
        if (hasResults) {
            innerContent = (
                <List dense={true} className={layerSidebarStyles.featureItemList}>
                    {this.makeListItems()}
                </List>
            );
        } else {
            innerContent = (
                <div className={layerSidebarStyles.noResultsInfo} hidden={hasResults}>
                    <CloudOffOutlineIcon className={layerSidebarStyles.noResultsIcon} />
                    <div className={layerSidebarStyles.noResultsTitle}>No Plumes Found</div>
                    <div className={layerSidebarStyles.noResultsSubtitle}>
                        Try widening some search parameters
                    </div>
                </div>
            );
        }
        return (
            <div className={resultsClassname}>
                {innerContent}
                {this.makePageControls()}
            </div>
        );
    }

    makePageControls() {
        return (
            <PageControls
                resultCount={this.props.searchState.get("searchResults").size}
                currentPageIndex={this.props.searchState.get("pageIndex")}
                onPageBackward={() => this.props.pageBackward(layerSidebarTypes.CATEGORY_PLUMES)}
                onPageForward={() => this.props.pageForward(layerSidebarTypes.CATEGORY_PLUMES)}
            />
        );
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.flexboxParent]: true,
            [layerSidebarStyles.featureItemContainer]: true
        });

        let selectedFlightCampaignValue =
            this.props.searchState.get("selectedFlightCampaign") || "";
        let selectedIME = this.props.searchState.get("selectedIME") || "";
        return (
            <div className={containerClasses}>
                <Paper elevation={1} className={layerSidebarStyles.searchFiltersContainer}>
                    <Typography style={{ padding: "4px 0px 8px" }} variant="subheading">
                        Browse Plume Observations & Sources
                    </Typography>
                    <PlumeFiltersContainer />
                </Paper>
                {this.makeLoadingModal()}
                {this.makeResultsArea()}
            </div>
        );
    }
}

PlumesContainer.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    activeFeature: PropTypes.object,
    activeDetailFeature: PropTypes.object,
    searchState: PropTypes.object.isRequired,
    pageForward: PropTypes.func.isRequired,
    pageBackward: PropTypes.func.isRequired,
    setFeatureDetail: PropTypes.func.isRequired,
    hideFeatureDetail: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    centerMapOnFeature: PropTypes.func.isRequired,
    toggleFeatureLabel: PropTypes.func.isRequired,
    setHoverPlume: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        activeFeature: state.map.get("activeFeature"),
        activeDetailFeature: state.featureDetail,
        searchState: state.layerSidebar.getIn(["searchState", layerSidebarTypes.CATEGORY_PLUMES])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        pageForward: bindActionCreators(layerSidebarActions.pageForward, dispatch),
        pageBackward: bindActionCreators(layerSidebarActions.pageBackward, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch),
        hideFeatureDetail: bindActionCreators(layerSidebarActions.hideFeatureDetail, dispatch),
        centerMapOnFeature: bindActionCreators(mapActionsMSF.centerMapOnFeature, dispatch),
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch),
        setHoverPlume: bindActionCreators(mapActionsMSF.setHoverPlume, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumesContainer);
