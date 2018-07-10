import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import ListSubheader from "@material-ui/core/ListSubheader";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import DomainIcon from "mdi-material-ui/Domain";
import LeafIcon from "mdi-material-ui/Leaf";
import FlashIcon from "mdi-material-ui/Flash";
import DeleteIcon from "mdi-material-ui/Delete";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import InfoOutlineIcon from "@material-ui/icons/InfoOutline";
import InfoIcon from "@material-ui/icons/Info";
import Search from "@material-ui/icons/Search";
import Clear from "@material-ui/icons/Clear";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import MiscUtilExtended from "utils/MiscUtilExtended";
import MetadataUtil from "utils/MetadataUtil";
import * as mapActionsMSF from "actions/mapActions";
import PageControls from "components/PageControls/PageControls";
import InfrastructureFiltersContainer from "components/MethaneSidebar/InfrastructureFiltersContainer";
import SearchInput from "components/Reusables/SearchInput";
import layerSidebarStyles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";

import MiscUtil from "_core/utils/MiscUtil";

export class InfrastructureContainer extends Component {
    // getFactoryIcon() {
    //     return (
    //         <svg viewBox="0 0 12 12">
    //             <path d="M1.2 9.6L1.2 10.8 3.6 10.8 3.6 9.6 1.2 9.6ZM1.2 7.2L1.2 8.4 7.2 8.4 7.2 7.2 1.2 7.2ZM4.8 9.6L4.8 10.8 7.2 10.8 7.2 9.6 4.8 9.6ZM8.4 7.2L8.4 8.4 10.8 8.4 10.8 7.2 8.4 7.2ZM8.4 9.6L8.4 10.8 10.8 10.8 10.8 9.6 8.4 9.6ZM0 12L0 3.6 3 6 3 3.6 6 6 6 3.6 9 6 9.6 0 11.4 0 12 6 12 12 0 12Z" />
    //         </svg>
    //     );
    // }

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
                >
                    <div
                        className={iconContainerClasses}
                        style={{
                            background: this.getColorByCategoryId(feature.get("categoryId"))
                        }}
                    >
                        {this.getIconByCategoryId(feature.get("categoryId"))}
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
                            {feature.get("flyoverCount") + " flyovers"}
                        </Typography>
                        <Typography
                            color={isItemPrimary ? "inherit" : "default"}
                            className={layerSidebarStyles.listItemTextSecondary}
                            variant="caption"
                            noWrap
                        >
                            {MetadataUtil.getFacilityTypeName(feature)}
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
                resultCount={this.props.searchState.get("searchResults").size}
                currentPageIndex={this.props.searchState.get("pageIndex")}
                onPageBackward={() =>
                    this.props.pageBackward(layerSidebarTypes.CATEGORY_INFRASTRUCTURE)
                }
                onPageForward={() =>
                    this.props.pageForward(layerSidebarTypes.CATEGORY_INFRASTRUCTURE)
                }
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
    toggleFeatureLabel: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        activeFeature: state.map.get("activeFeature"),
        activeDetailFeature: state.featureDetail,
        searchState: state.layerSidebar.getIn([
            "searchState",
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
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InfrastructureContainer);
