import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  List,
  ListItem,
  ListSubHeader,
  ListCheckbox
} from "react-toolbox/lib/list";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import MiscUtil_Extended from "utils/MiscUtil_Extended";
import MapUtil_Extended from "utils/MapUtil_Extended";
import MetadataUtil from "utils/MetadataUtil";
import { Button, IconButton } from "react-toolbox/lib/button";
import ProgressBar from "react-toolbox/lib/progress_bar";
import DatePicker from "react-toolbox/lib/date_picker";
import FontIcon from "react-toolbox/lib/font_icon";
import Dropdown from "react-toolbox/lib/dropdown";
import appConfig from "constants/appConfig";
import moment from "moment";
import * as mapActions_Extended from "actions/MapActions_Extended";
import PageControls from "components/PageControls/PageControls";
import SearchInput from "components/Reusables/SearchInput";

const miscUtil = new MiscUtil_Extended();
const mapUtil = new MapUtil_Extended();
const metadataUtil = new MetadataUtil();

export class PlumesContainer extends Component {
  isActiveFeature(feature) {
    return (
      this.props.activeFeature.get("category") ===
        layerSidebarTypes.CATEGORY_PLUMES &&
      feature.get("id") === this.props.activeFeature.getIn(["feature", "id"])
    );
  }

  isActiveDetailFeature(feature) {
    return (
      this.props.activeDetailFeature.get("category") ===
        layerSidebarTypes.CATEGORY_PLUMES &&
      feature.get("id") ===
        this.props.activeDetailFeature.getIn(["feature", "id"])
    );
  }

  getCountyLabel(feature) {
    const countyName = miscUtil.getCountyFromFeature(feature, null);
    return countyName ? countyName + " County" : "(no county)";
  }

  truncateName(nameString) {
    return nameString.length > 20
      ? nameString.slice(0, 17) + "..."
      : nameString;
  }

  makeListItem(feature) {
    const isActive = this.isActiveFeature(feature);
    const isActiveDetail = this.isActiveDetailFeature(feature);
    const itemClass = miscUtil.generateStringFromSet({
      "feature-item-container-list-item": true,
      selected: isActive || isActiveDetail
    });
    const toggleLabelAction = this.props.toggleFeatureLabel.bind(
      null,
      layerSidebarTypes.CATEGORY_PLUMES,
      feature
    );
    const toggleDetailAction = isActiveDetail
      ? this.props.hideFeatureDetail
      : this.props.setFeatureDetail.bind(
          null,
          layerSidebarTypes.CATEGORY_PLUMES,
          feature
        );
    const lat = metadataUtil.getLat(feature, null);
    const long = metadataUtil.getLong(feature, null);
    const centerMapAction =
      lat && long ? this.props.centerMapOnPoint.bind(null, [long, lat]) : null;

    const datetime = feature.get("datetime");
    const dateString = datetime
      ? moment(datetime).format("MMMM Do, YYYY, H:mm [UTC]")
      : "(no date)";

    return (
      <ListItem
        key={feature.get("id")}
        caption={dateString}
        className={itemClass}
        legend={feature.get("name")}
        ripple={false}
        onClick={isActiveDetail ? toggleDetailAction : toggleLabelAction}
        rightActions={[
          <IconButton
            inverse={isActive || isActiveDetail}
            key={feature.get("id") + "_snap_icon"}
            icon="my_location"
            disabled={!lat || !long}
            onClick={centerMapAction}
          />,
          <IconButton
            inverse={isActive || isActiveDetail}
            key={feature.get("id") + "_info_icon"}
            icon="info_outline"
            onClick={toggleDetailAction}
          />
        ]}
        theme={{
          itemAction: "itemAction",
          primary: "primary-text",
          itemText: "item-text",
          item: "item"
        }}
      />
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
        <div className="loading-modal">
          <ProgressBar type="circular" mode="indeterminate" />
        </div>
      );
    }
    return <div />;
  }

  formatDate(date) {
    const format = "MMM D, Y";
    return moment.utc(date).format(format);
  }

  getAvailableFlightCampaigns() {
    const campaigns = this.props.availableFeatures
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
    return [{ value: null, label: "All" }].concat(campaigns);
  }

  makeResultsArea() {
    const hasResults = this.props.searchState.get("searchResults").size;
    const resultsClass = miscUtil.generateStringFromSet({
      "sidebar-content": true
    });
    let innerContent = "";
    if (hasResults) {
      innerContent = (
        <List selectable ripple className="feature-item-list">
          {this.makeLoadingModal()}
          {this.makeListItems()}
        </List>
      );
    } else {
      innerContent = (
        <div className="no-results-info" hidden={hasResults}>
          <FontIcon value="cloud" />
          <div className="no-results-title">No Plumes Found</div>
          <div className="no-results-subtitle">
            Try widening some search parameters
          </div>
        </div>
      );
    }
    return (
      <div className={resultsClass}>
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
          this.props.pageBackward(layerSidebarTypes.CATEGORY_PLUMES)
        }
        onPageForward={() =>
          this.props.pageForward(layerSidebarTypes.CATEGORY_PLUMES)
        }
      />
    );
  }

  render() {
    const startDate = this.props.searchState.get("startDate");
    const endDate = this.props.searchState.get("endDate");
    return (
      <div className="feature-item-container flexbox-parent">
        <div className="search-filters-container">
          <SearchInput
            icon="search"
            placeholder="Search Plumes by ID"
            value=""
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
          />
          <div id="plumeDatePicker">
            <div className="date-picker">
              <FontIcon value="date_range" className="calendar-icon" />
              <DatePicker
                inputClassName="date-picker"
                sundayFirstDayOfWeek
                value={startDate}
                onChange={this.props.updatePlumeDateRange.bind(
                  null,
                  "startDate"
                )}
                inputFormat={this.formatDate}
                minDate={appConfig.PLUME_START_DATE}
                maxDate={endDate}
              />
            </div>
            <div className="date-picker">
              <FontIcon value="date_range" className="calendar-icon" />
              <DatePicker
                inputClassName="date-picker"
                sundayFirstDayOfWeek
                value={this.props.searchState.get("endDate")}
                onChange={this.props.updatePlumeDateRange.bind(null, "endDate")}
                inputFormat={this.formatDate}
                minDate={startDate}
                maxDate={appConfig.PLUME_END_DATE}
              />
            </div>
          </div>
          <div id="plumeFilterDropdowns">
            <Dropdown
              auto
              allowBlank={false}
              value={this.props.searchState.get("selectedFlightCampaign")}
              source={this.getAvailableFlightCampaigns()}
              className="dropdown"
              onChange={this.props.selectFlightCampaign}
              label="Flight Campaign"
              theme={{ values: "values" }}
            />
          </div>
        </div>
        {this.makeResultsArea()}
      </div>
    );
  }
}

PlumesContainer.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  activeFeature: function(props, propName, componentName) {
    const propValue = props[propName];
    if (propValue === null) return;
    if (typeof propValue === "object") return;
    return new Error(`${componentName} only accepts null or object`);
  },
  activeDetailFeature: function(props, propName, componentName) {
    const propValue = props[propName];
    if (propValue === null) return;
    if (typeof propValue === "object") return;
    return new Error(`${componentName} only accepts null or object`);
  },
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
    pageBackward: bindActionCreators(
      layerSidebarActions.pageBackward,
      dispatch
    ),
    setFeatureDetail: bindActionCreators(
      layerSidebarActions.setFeatureDetail,
      dispatch
    ),
    hideFeatureDetail: bindActionCreators(
      layerSidebarActions.hideFeatureDetail,
      dispatch
    ),
    updatePlumeDateRange: bindActionCreators(
      layerSidebarActions.updatePlumeDateRange,
      dispatch
    ),
    selectFlightCampaign: bindActionCreators(
      layerSidebarActions.selectFlightCampaign,
      dispatch
    ),
    centerMapOnPoint: bindActionCreators(
      mapActions_Extended.centerMapOnPoint,
      dispatch
    ),
    toggleFeatureLabel: bindActionCreators(
      mapActions_Extended.toggleFeatureLabel,
      dispatch
    )
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumesContainer);
