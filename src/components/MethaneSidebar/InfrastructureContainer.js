import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import DeleteIcon from "mdi-material-ui/Delete";
import DomainIcon from "mdi-material-ui/Domain";
import FlashIcon from "mdi-material-ui/Flash";
import LeafIcon from "mdi-material-ui/Leaf";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

import InfrastructureFiltersContainer from "components/MethaneSidebar/InfrastructureFiltersContainer";
import MetadataUtil from "utils/MetadataUtil";
import MiscUtil from "_core/utils/MiscUtil";
import MiscUtilExtended from "utils/MiscUtilExtended";
import PageControls from "components/PageControls/PageControls";
import * as layerSidebarActions from "actions/layerSidebarActions";
import layerSidebarStyles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as mapActionsMSF from "actions/mapActions";
import accessibilityStyles from "_core/styles/accessibility.scss";

export class InfrastructureContainer extends Component {
    clearTextSearch() {
        this.props.setInfrastructureFilter(layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME, "");
        // this.props.toggleInfrastructureCategoryFilters(false);
    }

    getCircleIcon(group, color) {
        return <div className="category-circle" style={{ background: color }} />;
    }

    isActiveFeature(feature) {
        return (
            this.props.activeFeature.get("category") ===
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE &&
            feature.get("id") === this.props.activeFeature.getIn(["feature", "id"])
        );
    }

    isActiveDetailFeature(feature) {
        return (
            this.props.activeDetailFeature.get("category") ===
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE &&
            feature.get("id") === this.props.activeDetailFeature.getIn(["feature", "id"])
        );
    }

    // getCountyLabel(feature) {
    //     const countyName = MiscUtilExtended.getCountyFromFeature(feature, null);
    //     return countyName ? countyName + " County" : "(no county)";
    // }

    getColorByCategoryId(categoryId) {
        return layerSidebarTypes.INFRASTRUCTURE_INFO_BY_CATEGORY_ID[categoryId].fillNoTransparency;
    }

    getIconByCategoryId(categoryId) {
        switch (layerSidebarTypes.INFRASTRUCTURE_INFO_BY_CATEGORY_ID[categoryId].sector) {
            case layerSidebarTypes.SECTORS.AGRICULTURE:
                return <LeafIcon />;
            case layerSidebarTypes.SECTORS.ENERGY:
                return <FlashIcon />;
            case layerSidebarTypes.SECTORS.WASTE:
                return <DeleteIcon />;
        }
    }

    makeListItem(feature) {
        const isDetailPageOpen = this.props.activeDetailFeature.getIn(["feature", "id"])
            ? true
            : false;
        const isActive = this.isActiveFeature(feature);
        const isActiveDetail = this.isActiveDetailFeature(feature);
        const isItemPrimary = isActive;
        const listItemRootClassnames = MiscUtilExtended.generateStringFromSet({
            [layerSidebarStyles.selectedItem]: isItemPrimary,
            [layerSidebarStyles.itemRoot]: true
        });
        const toggleDetailAction = isActiveDetail
            ? () => this.props.hideFeatureDetail()
            : () => this.props.setFeatureDetail(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, feature);

        const onListItemClick = () => {
            if (isDetailPageOpen) {
                // If the list item clicked is the same as current feature detail
                // then close the detail
                if (isActiveDetail) {
                    this.props.hideFeatureDetail();
                } else {
                    this.props.setFeatureDetail(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, feature);
                }
            } else if (!isActive) {
                this.props.toggleFeatureLabel(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, feature);
            }
        };

        const iconContainerClasses = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.iconContainer]: true
        });

        const listItemSecondaryActionClasses = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.selectedItemSecondary]: isItemPrimary,
            [layerSidebarStyles.listItemSecondaryAction]: true
        });

        const listKey =
            feature.get("id") +
            Math.random()
                .toString(36)
                .substring(7);

        return (
            <React.Fragment key={listKey}>
                <ListItem
                    className={listItemRootClassnames}
                    classes={{
                        root: listItemRootClassnames,
                        container: layerSidebarStyles.listItemContainer
                    }}
                    button
                    onClick={onListItemClick}
                >
                    <div
                        className={iconContainerClasses}
                        style={{
                            background: this.getColorByCategoryId(feature.get("category_id"))
                        }}
                    >
                        {this.getIconByCategoryId(feature.get("category_id"))}
                    </div>
                    <div className={layerSidebarStyles.listItemTextContainer}>
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemText}
                            variant="body1"
                            noWrap
                        >
                            {feature.get("name")}
                        </Typography>
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {feature.get("category")}
                        </Typography>{" "}
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {(feature.get("num_flights_matching") || "0") + " flyovers"}
                        </Typography>
                    </div>
                    <ListItemSecondaryAction className={listItemSecondaryActionClasses}>
                        <Button
                            className={isItemPrimary ? layerSidebarStyles.buttonContrast : ""}
                            key={feature.get("id") + "_my_location_button"}
                            onClick={() => this.props.centerMapOnFeature(feature, "VISTA")}
                            disabled={!this.props.activeDetailFeature.get("feature").isEmpty()}
                        >
                            Zoom To
                        </Button>
                        <Button
                            className={isItemPrimary ? layerSidebarStyles.buttonContrast : ""}
                            color={isActiveDetail ? "primary" : "default"}
                            key={feature.get("id") + "_info_button"}
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
        const totalSize =
            this.props.searchState.get("searchResults").size +
            this.props.searchState.get("globalSearchResults").size;
        const endIndex =
            (currentPageIndex + 1) * layerSidebarTypes.FEATURES_PER_PAGE > totalSize
                ? totalSize
                : (currentPageIndex + 1) * layerSidebarTypes.FEATURES_PER_PAGE;

        return (
            <React.Fragment>
                {this.props.searchState
                    .get("searchResults")
                    .slice(startIndex, endIndex)
                    .map(f => this.makeListItem(f))}
                {this.makeGlobalSearchResults(endIndex)}
            </React.Fragment>
        );
    }

    makeGlobalSearchResults(endIndex) {
        if (
            !this.props.searchState.get("globalSearchResults").size ||
            endIndex < this.props.searchState.get("searchResults").size - 1
        )
            return null;

        // Omit any global results we've already found
        const globalResults = this.props.searchState
            .get("globalSearchResults")
            .filter(f =>
                this.props.searchState
                    .get("searchResults")
                    .every(result => result.get("id") !== f.get("id"))
            );
        if (!globalResults.size) return null;

        return (
            <React.Fragment>
                <ListSubheader>Results not in view</ListSubheader>
                {globalResults.map(f => this.makeListItem(f))}
            </React.Fragment>
        );
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
        const hasResults =
            this.props.searchState.get("searchResults").size ||
            this.props.searchState.get("globalSearchResults").size;
        const resultsClassname = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.sidebarContent]: true
        });
        let innerContent = "";
        if (hasResults) {
            innerContent = (
                <List dense className={layerSidebarStyles.featureItemList}>
                    {this.makeListItems()}
                </List>
            );
        } else {
            innerContent = (
                <div className={layerSidebarStyles.noResultsInfo} hidden={hasResults}>
                    <DomainIcon className={layerSidebarStyles.noResultsIcon} />
                    <div className={layerSidebarStyles.noResultsTitle}>No Infrastructure Found</div>
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
                resultCount={
                    this.props.searchState.get("searchResults").size +
                    this.props.searchState.get("globalSearchResults").size
                }
                currentPageIndex={this.props.searchState.get("pageIndex")}
                onPageBackward={() =>
                    this.props.pageBackward(layerSidebarTypes.CATEGORY_INFRASTRUCTURE)
                }
                onPageForward={() =>
                    this.props.pageForward(layerSidebarTypes.CATEGORY_INFRASTRUCTURE)
                }
                totalResults={
                    this.props.availableFeatures.size +
                    this.props.searchState.get("globalSearchResults").size
                }
                clearFilterFunc={() => this.clearTextSearch()}
            />
        );
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [layerSidebarStyles.flexboxParent]: true,
            [layerSidebarStyles.featureItemContainer]: true
        });
        return (
            <div className={containerClasses}>
                <Paper elevation={1} className={layerSidebarStyles.searchFiltersContainer}>
                    <Typography style={{ padding: "4px 0px 8px" }} variant="subheading">
                        Browse Infrastructure
                    </Typography>
                    <InfrastructureFiltersContainer />
                </Paper>
                {this.makeLoadingModal()}
                {this.makeResultsArea()}
            </div>
        );
    }
}

InfrastructureContainer.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    activeFeature: PropTypes.object,
    activeDetailFeature: PropTypes.object,
    searchState: PropTypes.object.isRequired,
    pageForward: PropTypes.func.isRequired,
    pageBackward: PropTypes.func.isRequired,
    setFeatureDetail: PropTypes.func.isRequired,
    hideFeatureDetail: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    centerMapOnPoint: PropTypes.func.isRequired,
    centerMapOnFeature: PropTypes.func.isRequired,
    toggleFeatureLabel: PropTypes.func.isRequired,
    availableFeatures: PropTypes.object,
    setInfrastructureFilter: PropTypes.func.isRequired,
    toggleInfrastructureCategoryFilters: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        activeFeature: state.map.get("activeFeature"),
        activeDetailFeature: state.featureDetail,
        searchState: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        ]),
        availableFeatures: state.layerSidebar.getIn([
            "availableFeatures",
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        ])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        pageForward: bindActionCreators(layerSidebarActions.pageForward, dispatch),
        pageBackward: bindActionCreators(layerSidebarActions.pageBackward, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch),
        hideFeatureDetail: bindActionCreators(layerSidebarActions.hideFeatureDetail, dispatch),
        centerMapOnPoint: bindActionCreators(mapActionsMSF.centerMapOnPoint, dispatch),
        centerMapOnFeature: bindActionCreators(mapActionsMSF.centerMapOnFeature, dispatch),
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch),
        setInfrastructureFilter: bindActionCreators(
            layerSidebarActions.setInfrastructureFilter,
            dispatch
        ),
        toggleInfrastructureCategoryFilters: bindActionCreators(
            layerSidebarActions.toggleInfrastructureCategoryFilters,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InfrastructureContainer);
