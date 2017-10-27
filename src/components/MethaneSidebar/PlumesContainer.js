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
import { Button, IconButton } from "react-toolbox/lib/button";
import ProgressBar from "react-toolbox/lib/progress_bar";
import DatePicker from "react-toolbox/lib/date_picker";
import FontIcon from "react-toolbox/lib/font_icon";
import Dropdown from "react-toolbox/lib/dropdown";
import appConfig from "constants/appConfig";
const miscUtil = new MiscUtil_Extended();
const mapUtil = new MapUtil_Extended();
import moment from "moment";

export class PlumesContainer extends Component {
	isActiveFeature(feature) {
		return (
			this.props.activeFeature.get("category") ===
				layerSidebarTypes.CATEGORY_PLUMES &&
			feature.get("id") ===
				this.props.activeFeature.getIn(["feature", "id"])
		);
	}

	getCountyLabel(feature) {
		const countyName = miscUtil.getCountyFromFeature(feature, null);
		return countyName ? countyName + " County" : "(no county)";
	}

	getListItemClass(feature) {
		return miscUtil.generateStringFromSet({
			"feature-item-container-list-item": true,
			selected: this.isActiveFeature(feature)
		});
	}

	makeListItems() {
		const currentPageIndex = this.props.searchState.get("pageIndex");
		const endIndex =
			currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE >
			this.props.searchState.get("searchResults").size
				? this.props.searchState.get("searchResults").size
				: currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE;
		const listItems = [];
		this.props.searchState
			.get("searchResults")
			.slice(currentPageIndex, endIndex)
			.forEach(feature =>
				listItems.push(
					<ListItem
						key={feature.get("id")}
						caption={feature.get("name")}
						className={this.getListItemClass(feature)}
						legend={this.getCountyLabel(feature)}
						onClick={() =>
							this.props.toggleFeatureDetail(
								layerSidebarTypes.CATEGORY_PLUMES,
								feature
							)}
					/>
				)
			);
		return listItems;
	}

	makeLoadingModal() {
		if (this.props.isLoading) {
			return (
				<div className="loading-modal">
					<ProgressBar type="circular" mode="indeterminate" />
				</div>
			);
		}
		return null;
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
			"sidebar-content": true,
			"no-results": !hasResults
		});
		return (
			<div id="plumeResults" className={resultsClass}>
				{this.makeLoadingModal()}
				<List selectable ripple className="feature-item-list">
					{this.makeListItems()}
				</List>
				<div className="no-results-info" hidden={hasResults}>
					<div className="icon" />
					<h1>No Plumes Found</h1>
					<h2>Try widening some search parameters</h2>
				</div>
				{this.makePageControls()}
			</div>
		);
	}

	makePageControls() {
		const totalFeatures = this.props.searchState.get("searchResults").size;
		if (!totalFeatures) return;
		const currentPageIndex = this.props.searchState.get("pageIndex");
		const endIndex =
			currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE >
			totalFeatures
				? totalFeatures
				: currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE;
		const counterLabel =
			totalFeatures !== 0
				? `Showing results ${currentPageIndex + 1} - ${endIndex}`
				: "No features found in the current viewport";

		return (
			<div className="feature-results-page-row">
				<div className="layer-sidebar-page-label">{counterLabel}</div>
				<IconButton
					icon="chevron_left"
					onClick={() =>
						this.props.pageBackward(
							layerSidebarTypes.CATEGORY_PLUMES
						)}
					disabled={currentPageIndex === 0}
					theme={{ icon: "layer-sidebar-page-icon" }}
				/>
				<IconButton
					icon="chevron_right"
					onClick={() =>
						this.props.pageForward(
							layerSidebarTypes.CATEGORY_PLUMES
						)}
					disabled={endIndex === totalFeatures}
					theme={{ icon: "layer-sidebar-page-icon" }}
				/>
			</div>
		);
	}

	render() {
		const startDate = this.props.searchState.get("startDate");
		const endDate = this.props.searchState.get("endDate");
		return (
			<div className="feature-item-container">
				<div id="plumeSearch">
					<input
						className="search-input"
						type="text"
						placeholder="Search for Plumes"
						onChange={this.props.updateFeatureSearchText.bind(
							null,
							layerSidebarTypes.CATEGORY_PLUMES
						)}
					/>
					<div id="plumeDatePicker">
						<DatePicker
							inputClassName="date-picker search-input"
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
						<FontIcon
							value="date_range"
							className="calendar-icon"
						/>
						<DatePicker
							inputClassName="date-picker search-input"
							sundayFirstDayOfWeek
							value={this.props.searchState.get("endDate")}
							onChange={this.props.updatePlumeDateRange.bind(
								null,
								"endDate"
							)}
							inputFormat={this.formatDate}
							minDate={startDate}
							maxDate={appConfig.PLUME_END_DATE}
						/>
						<FontIcon
							value="date_range"
							className="calendar-icon"
						/>
					</div>
					<div id="plumeFilterDropdowns">
						<Dropdown
							auto
							allowBlank={false}
							value={this.props.searchState.get(
								"selectedFlightCampaign"
							)}
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
	updateFeatureSearchText: PropTypes.func.isRequired,
	searchState: PropTypes.object.isRequired,
	pageForward: PropTypes.func.isRequired,
	pageBackward: PropTypes.func.isRequired,
	toggleFeatureDetail: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	updatePlumeDateRange: PropTypes.func.isRequired,
	selectFlightCampaign: PropTypes.func.isRequired,
	availableFeatures: PropTypes.object.isRequired
};

function mapStateToProps(state) {
	return {
		activeFeature: state.featureDetail
	};
}

function mapDispatchToProps(dispatch) {
	return {
		updateFeatureSearchText: bindActionCreators(
			layerSidebarActions.updateFeatureSearchText,
			dispatch
		),
		pageForward: bindActionCreators(
			layerSidebarActions.pageForward,
			dispatch
		),
		pageBackward: bindActionCreators(
			layerSidebarActions.pageBackward,
			dispatch
		),
		toggleFeatureDetail: bindActionCreators(
			layerSidebarActions.toggleFeatureDetail,
			dispatch
		),
		updatePlumeDateRange: bindActionCreators(
			layerSidebarActions.updatePlumeDateRange,
			dispatch
		),
		selectFlightCampaign: bindActionCreators(
			layerSidebarActions.selectFlightCampaign,
			dispatch
		)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumesContainer);
