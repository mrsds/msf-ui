import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import List, {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction
} from "material-ui/List";
import Typography from "material-ui/Typography";
import ListSubheader from "material-ui/List/ListSubheader";
import Checkbox from "material-ui/Checkbox";
import Divider from "material-ui/Divider";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import Button from "material-ui/Button";
import IconButton from "material-ui/IconButton";
import { CircularProgress } from "material-ui/Progress";
import DomainIcon from "mdi-material-ui/Domain";
import MyLocationIcon from "material-ui-icons/MyLocation";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
import InfoIcon from "material-ui-icons/Info";
import Search from "material-ui-icons/Search";
import Clear from "material-ui-icons/Clear";
import Select from "material-ui/Select";
import { FormControl } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import Paper from "material-ui/Paper";
import MiscUtilExtended from "utils/MiscUtilExtended";
import MetadataUtil from "utils/MetadataUtil";
import * as mapActionsMSF from "actions/MapActions";
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

    // truncateName(nameString) {
    //     return nameString.length > 20 ? nameString.slice(0, 17) + "..." : nameString;
    // }

    makeListItem(feature) {
        const isActive = this.isActiveFeature(feature);
        const isActiveDetail = this.isActiveDetailFeature(feature);
        const itemClass = MiscUtilExtended.generateStringFromSet({
            [layerSidebarStyles.selectedItem]: isActive || isActiveDetail,
            [layerSidebarStyles.itemRoot]: true
        });
        const toggleLabelAction = () =>
            this.props.toggleFeatureLabel(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, feature);

        const toggleDetailAction = () =>
            isActiveDetail
                ? this.props.hideFeatureDetail
                : this.props.setFeatureDetail(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, feature);

        const lat = MetadataUtil.getLat(feature, null);
        const long = MetadataUtil.getLong(feature, null);
        const centerMapAction =
            lat && long ? () => this.props.centerMapOnFeature(feature, "VISTA") : null;
        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem
                    className={itemClass}
                    button
                    onClick={isActiveDetail ? toggleDetailAction : toggleLabelAction}
                >
                    <ListItemText
                        primary={
                            <Typography type="body1" noWrap>
                                {feature.get("name")}
                            </Typography>
                        }
                        secondary={feature.get("category")}
                    />
                    <ListItemSecondaryAction className={layerSidebarStyles.secondaryAction}>
                        <IconButton
                            color="default"
                            disabled={!lat || !long}
                            key={feature.get("id") + "_my_location_icon"}
                            onClick={centerMapAction}
                        >
                            <MyLocationIcon />
                        </IconButton>
                        <IconButton
                            color={isActiveDetail ? "primary" : "default"}
                            key={feature.get("id") + "_info_icon"}
                            onClick={toggleDetailAction}
                        >
                            {isActiveDetail ? <InfoIcon /> : <InfoOutlineIcon />}
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                <Divider />
            </React.Fragment>
        );
    }

    makeListItems() {
        const currentPageIndex = this.props.searchState.get("pageIndex");
        const endIndex =
            currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE >
            this.props.searchState.get("searchResults").size
                ? this.props.searchState.get("searchResults").size
                : currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE;
        const listItems = [];
        return this.props.searchState
            .get("searchResults")
            .slice(currentPageIndex, endIndex)
            .map(feature => this.makeListItem(feature));
    }

    // makeFacilityFilterList() {
    //     if (!this.props.searchState.get("facilityFilterOptionsVisible")) {
    //         return <div />;
    //     }
    //     const listItems = [];
    //     const listGroups = Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).forEach(group => {
    //         listItems.push(
    //             <ListSubheader
    //                 disableSticky={true}
    //                 key={group}
    //                 className={layerSidebarStyles.facilityFilterCategoryLabel}
    //             >
    //                 {group}
    //             </ListSubheader>
    //         );
    //         listItems.push(
    //             <div
    //                 key={group + "_color"}
    //                 className={layerSidebarStyles.categoryCircle}
    //                 style={{
    //                     background: layerSidebarTypes.INFRASTRUCTURE_GROUPS[group].colors.stroke
    //                 }}
    //             />
    //         );
    //         layerSidebarTypes.INFRASTRUCTURE_GROUPS[group].categories.forEach(category => {

    //             const checked = this.props.activeInfrastructureSubCategories.get(category) || false;
    //             listItems.push(
    //                 <ListItem
    //                     button
    //                     onClick={() =>
    //                         this.props.updateInfrastructureCategoryFilter(category, !checked)
    //                     }
    //                     key={categoryName}
    //                 >
    //                     <Checkbox checked={checked} tabIndex={-1} disableRipple />
    //                     <ListItemText primary={categoryName} />
    //                 </ListItem>
    //             );
    //         });
    //     });
    //     return (
    //         <div
    //             className={`${layerSidebarStyles.filtersOverlay} ${
    //                 layerSidebarStyles.facilityFilterList
    //             }`}
    //         >
    //             <div className={layerSidebarStyles.headerBar}>
    //                 <div className={layerSidebarStyles.headerTitle}>Select Infrastructure</div>
    //                 <Button
    //                     color="primary"
    //                     onClick={this.props.toggleInfrastructureFacilityFilterOptionsVisible}
    //                 >
    //                     Done
    //                 </Button>
    //             </div>
    //             <List className={layerSidebarStyles.facilityFilterList}>{listItems}</List>
    //         </div>
    //     );
    // }

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
                    <Typography style={{ padding: "4px 0px 8px" }} type="subheading">
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
        activeDetailFeature: state.featureDetail
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
