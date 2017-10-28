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
import MetadataUtil from "utils/MetadataUtil";
import * as mapActions_Extended from "actions/MapActions_Extended";

const miscUtil = new MiscUtil_Extended();
const mapUtil = new MapUtil_Extended();
const metadataUtil = new MetadataUtil();

export class InfrastructureContainer extends Component {
	getFactoryIcon() {
		return (
			<svg viewBox="0 0 12 12">
				<path d="M1.2 9.6L1.2 10.8 3.6 10.8 3.6 9.6 1.2 9.6ZM1.2 7.2L1.2 8.4 7.2 8.4 7.2 7.2 1.2 7.2ZM4.8 9.6L4.8 10.8 7.2 10.8 7.2 9.6 4.8 9.6ZM8.4 7.2L8.4 8.4 10.8 8.4 10.8 7.2 8.4 7.2ZM8.4 9.6L8.4 10.8 10.8 10.8 10.8 9.6 8.4 9.6ZM0 12L0 3.6 3 6 3 3.6 6 6 6 3.6 9 6 9.6 0 11.4 0 12 6 12 12 0 12Z" />
			</svg>
		);
	}

	getCircleIcon(group, color) {
		return (
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg">
				<circle stroke={color} fill={color} />
			</svg>
		);
	}

	isActiveFeature(feature) {
		return (
			this.props.activeFeature.get("category") ===
				layerSidebarTypes.CATEGORY_INFRASTRUCTURE &&
			feature.get("id") ===
				this.props.activeFeature.getIn(["feature", "id"])
		);
	}

	isActiveDetailFeature(feature) {
		return (
			this.props.activeDetailFeature.get("category") ===
				layerSidebarTypes.CATEGORY_INFRASTRUCTURE &&
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
			layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
			feature
		);
		const toggleDetailAction = this.props.toggleFeatureDetail.bind(
			null,
			layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
			feature
		);
		const lat = metadataUtil.getLat(feature, null);
		const long = metadataUtil.getLong(feature, null);
		const centerMapAction =
			lat && long
				? this.props.centerMapOnPoint.bind(null, [long, lat])
				: null;
		return (
			<ListItem
				key={feature.get("id")}
				caption={this.truncateName(feature.get("name"))}
				className={itemClass}
				legend={this.getCountyLabel(feature)}
				onClick={
					isActiveDetail ? toggleDetailAction : toggleLabelAction
				}
				rightActions={[
					<IconButton
						key={feature.get("id") + "_snap_icon"}
						icon="my_location"
						hidden={!lat || !long}
						onClick={centerMapAction}
					/>,
					<IconButton
						key={feature.get("id") + "_info_icon"}
						icon="info_outline"
						onClick={toggleDetailAction}
					/>
				]}
				theme={{ itemAction: "itemAction" }}
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

	makeFacilityFilterList() {
		const listItems = [];
		const listGroups = Object.keys(
			layerSidebarTypes.INFRASTRUCTURE_GROUPS
		).forEach(group => {
			listItems.push(
				<ListSubHeader
					key={group}
					caption={group}
					className="facility-filter-category-label"
				/>
			);
			listItems.push(
				<div
					key={group + "_icon"}
					className="facility-filter-category-label-icon"
				>
					{this.getCircleIcon(
						group,
						layerSidebarTypes.INFRASTRUCTURE_GROUPS[group].colors
							.stroke
					)}
				</div>
			);
			layerSidebarTypes.INFRASTRUCTURE_GROUPS[
				group
			].categories.forEach(category => {
				const categoryName = mapUtil.getInfrastructureCategoryHumanName(
					category
				);
				const checked =
					this.props.activeInfrastructureSubCategories.get(
						category
					) || false;
				listItems.push(
					<ListCheckbox
						key={categoryName}
						caption={categoryName}
						className="facility-filter-list-item"
						theme={{ check: "facility-filter-list-item-check" }}
						checked={checked}
						onChange={this.props.updateInfrastructureCategoryFilter.bind(
							null,
							category
						)}
					/>
				);
			});
		});
		return (
			<div id="infrastructureFilters" className="sidebar-content">
				<List selectable ripple className="facility-filter-list">
					{listItems}
				</List>
			</div>
		);
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

	makeSearchResults() {
		if (this.props.searchState.get("searchResults").size) {
			return (
				<div id="infrastructureResults" className="sidebar-content">
					{this.makeLoadingModal()}
					<List selectable ripple className="feature-item-list">
						{this.makeListItems()}
					</List>

					{this.makePageControls()}
				</div>
			);
		}
		return (
			<div id="infrastructureResults">
				<div
					className="no-results"
					hidden={this.props.searchState.get("searchResults").size}
				>
					<div className="icon" />
					<h1>No Infrastructure Found</h1>
					<h2>Try widening some search parameters</h2>
				</div>
			</div>
		);
	}

	makeResultsArea() {
		if (this.props.searchState.get("facilityFilterOptionsVisible")) {
			return this.makeFacilityFilterList();
		} else {
			return this.makeSearchResults();
		}
	}

	makeFacilityFilterButton() {
		const isActive = this.props.searchState.get(
			"facilityFilterOptionsVisible"
		);
		const buttonLabel = "Filter By Facility";
		return (
			<Button
				className="button"
				theme={{
					button: "button-content",
					primary: "button-content-primary"
				}}
				primary={isActive}
				onClick={
					this.props.toggleInfrastructureFacilityFilterOptionsVisible
				}
			>
				{this.getFactoryIcon()}
				<label>{buttonLabel}</label>
			</Button>
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
							layerSidebarTypes.CATEGORY_INFRASTRUCTURE
						)}
					disabled={currentPageIndex === 0}
					theme={{ icon: "layer-sidebar-page-icon" }}
				/>
				<IconButton
					icon="chevron_right"
					onClick={() =>
						this.props.pageForward(
							layerSidebarTypes.CATEGORY_INFRASTRUCTURE
						)}
					disabled={endIndex === totalFeatures}
					theme={{ icon: "layer-sidebar-page-icon" }}
				/>
			</div>
		);
	}

	render() {
		this.makeFacilityFilterList();
		// const testText = this.props.isLoading ? "LOADING" : "";
		return (
			<div className="feature-item-container">
				<div id="infrastructureSearch">
					<input
						type="text"
						placeholder="Search for Infrastructure"
						onChange={this.props.updateFeatureSearchText.bind(
							null,
							layerSidebarTypes.CATEGORY_INFRASTRUCTURE
						)}
					/>
					{this.makeFacilityFilterButton()}
					<Button
						className="button"
						theme={{ button: "button-content" }}
					>
						<span className="plane-icon" />
						<label>Any number of flyovers</label>
					</Button>
				</div>
				{this.makeResultsArea()}
			</div>
		);
	}
}

InfrastructureContainer.propTypes = {
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
	activeInfrastructureSubCategories: PropTypes.object.isRequired,
	updateInfrastructureCategoryFilter: PropTypes.func.isRequired,
	toggleInfrastructureFacilityFilterOptionsVisible: PropTypes.func.isRequired,
	pageForward: PropTypes.func.isRequired,
	pageBackward: PropTypes.func.isRequired,
	toggleFeatureDetail: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
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
		updateInfrastructureCategoryFilter: bindActionCreators(
			layerSidebarActions.updateInfrastructureCategoryFilter,
			dispatch
		),
		toggleInfrastructureFacilityFilterOptionsVisible: bindActionCreators(
			layerSidebarActions.toggleInfrastructureFacilityFilterOptionsVisible,
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

export default connect(mapStateToProps, mapDispatchToProps)(
	InfrastructureContainer
);
