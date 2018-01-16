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
import Divider from "material-ui/Divider";
import Typography from "material-ui/Typography";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import IconButton from "material-ui/IconButton";
import { CircularProgress } from "material-ui/Progress";
import CloudOffOutlineIcon from "mdi-material-ui/CloudOffOutline";
import InfoOutlineIcon from "material-ui-icons/InfoOutline";
import MyLocationIcon from "material-ui-icons/MyLocation";
import Search from "material-ui-icons/Search";
import Clear from "material-ui-icons/Clear";
import Select from "material-ui/Select";
import { FormControl } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import MiscUtilExtended from "utils/MiscUtilExtended";
import MetadataUtil from "utils/MetadataUtil";
import appConfig from "constants/appConfig";
import * as mapActionsMSF from "actions/mapActions";
import PageControls from "components/PageControls/PageControls";
import layerSidebarStyles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import SearchInput from "components/Reusables/SearchInput";

import MiscUtil from "_core/utils/MiscUtil";

export class PlumesContainer extends Component {
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

    getCountyLabel(feature) {
        const countyName = MiscUtilExtended.getCountyFromFeature(feature, null);
        return countyName ? countyName + " County" : "(no county)";
    }

    truncateName(nameString) {
        return nameString.length > 20 ? nameString.slice(0, 17) + "..." : nameString;
    }

    makeListItem(feature) {
        const isActive = this.isActiveFeature(feature);
        const isActiveDetail = this.isActiveDetailFeature(feature);
        // const itemClass = MiscUtilExtended.generateStringFromSet({
        //     "feature-item-container-list-item": true,
        //     selected: isActive || isActiveDetail
        // });
        const toggleLabelAction = this.props.toggleFeatureLabel.bind(
            null,
            layerSidebarTypes.CATEGORY_PLUMES,
            feature
        );
        const toggleDetailAction = isActiveDetail
            ? this.props.hideFeatureDetail
            : this.props.setFeatureDetail.bind(null, layerSidebarTypes.CATEGORY_PLUMES, feature);
        const lat = MetadataUtil.getLat(feature, null);
        const long = MetadataUtil.getLong(feature, null);
        const centerMapAction =
            lat && long ? () => this.props.centerMapOnFeature(feature, "AVIRIS") : null;

        const datetime = feature.get("datetime");
        const dateString = MiscUtilExtended.formatPlumeDatetime(datetime);

        return (
            <React.Fragment key={feature.get("id")}>
                <ListItem button onClick={isActiveDetail ? toggleDetailAction : toggleLabelAction}>
                    <ListItemText
                        primary={
                            <Typography type="body1" noWrap>
                                {dateString}
                            </Typography>
                        }
                        secondary={feature.get("name")}
                    />
                    <ListItemSecondaryAction>
                        <IconButton
                            color="default"
                            disabled={!lat || !long}
                            key={feature.get("id") + "_my_location_icon"}
                            onClick={centerMapAction}
                        >
                            <MyLocationIcon />
                        </IconButton>
                        <IconButton
                            color={isActive || isActiveDetail ? "primary" : "default"}
                            key={feature.get("id") + "_info_icon"}
                            onClick={toggleDetailAction}
                        >
                            <InfoOutlineIcon />
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

    getAvailableFlightCampaigns() {
        return this.props.availableFeatures
            .reduce(
                (acc, feature) =>
                    acc.includes(feature.get("flight_campaign"))
                        ? acc
                        : acc.concat(feature.get("flight_campaign")),
                []
            )
            .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
            .map(value => {
                return { value, label: value };
            });
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

        let selectedFlightCampaignValue = "";
        if (this.props.searchState.get("selectedFlightCampaign")) {
            selectedFlightCampaignValue = this.props.searchState.get("selectedFlightCampaign");
        }
        return (
            <div className={containerClasses}>
                <div className={layerSidebarStyles.searchFiltersContainer}>
                    <SearchInput
                        icon={<Search />}
                        placeholder="Search Plumes by ID"
                        value={this.props.searchState.get("searchString")}
                        disabled={false}
                        onUpdate={valueStr =>
                            this.props.updateFeatureSearchText(
                                layerSidebarTypes.CATEGORY_PLUMES,
                                valueStr
                            )
                        }
                        validate={valueStr => true}
                        primaryDataTip="Search Plumes by ID"
                        primaryDataPlace="top"
                        actionIcon={<Clear />}
                        onActionIconClick={() =>
                            this.props.updateFeatureSearchText(
                                layerSidebarTypes.CATEGORY_PLUMES,
                                ""
                            )
                        }
                    />
                    <div>
                        <FormControl>
                            <InputLabel shrink={true} htmlFor="flightCampaginSelect">
                                Flight Campaign
                            </InputLabel>
                            <Select
                                displayEmpty={true}
                                value={selectedFlightCampaignValue}
                                onChange={evt => this.props.selectFlightCampaign(evt.target.value)}
                                input={<Input name="age" id="flightCampaginSelect" />}
                            >
                                {
                                    <MenuItem key="noFlightCampaignSelectItem" value="">
                                        All
                                    </MenuItem>
                                }
                                {this.getAvailableFlightCampaigns().map(result => (
                                    <MenuItem key={result.value} value={result.value}>
                                        {result.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <Divider />
                <Divider />
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
    updateFeatureSearchText: PropTypes.func.isRequired,
    searchState: PropTypes.object.isRequired,
    pageForward: PropTypes.func.isRequired,
    pageBackward: PropTypes.func.isRequired,
    setFeatureDetail: PropTypes.func.isRequired,
    hideFeatureDetail: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    updatePlumeDateRange: PropTypes.func.isRequired,
    selectFlightCampaign: PropTypes.func.isRequired,
    availableFeatures: PropTypes.object.isRequired,
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
        updateFeatureSearchText: bindActionCreators(
            layerSidebarActions.updateFeatureSearchText,
            dispatch
        ),
        pageForward: bindActionCreators(layerSidebarActions.pageForward, dispatch),
        pageBackward: bindActionCreators(layerSidebarActions.pageBackward, dispatch),
        setFeatureDetail: bindActionCreators(layerSidebarActions.setFeatureDetail, dispatch),
        hideFeatureDetail: bindActionCreators(layerSidebarActions.hideFeatureDetail, dispatch),
        updatePlumeDateRange: bindActionCreators(
            layerSidebarActions.updatePlumeDateRange,
            dispatch
        ),
        selectFlightCampaign: bindActionCreators(
            layerSidebarActions.selectFlightCampaign,
            dispatch
        ),
        centerMapOnPoint: bindActionCreators(mapActionsMSF.centerMapOnPoint, dispatch),
        centerMapOnFeature: bindActionCreators(mapActionsMSF.centerMapOnFeature, dispatch),
        toggleFeatureLabel: bindActionCreators(mapActionsMSF.toggleFeatureLabel, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumesContainer);
