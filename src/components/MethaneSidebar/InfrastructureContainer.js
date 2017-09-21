const Fuse = require("fuse.js");

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

const miscUtil = new MiscUtil_Extended();
const mapUtil = new MapUtil_Extended();

export class InfrastructureContainer extends Component {
	isActiveFeature(feature) {
		return (
			this.props.activeFeature.get("category") ===
				layerSidebarTypes.CATEGORY_INFRASTRUCTURE &&
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
								layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
								feature
							)}
					/>
				)
			);
		return listItems;
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
			layerSidebarTypes.INFRASTRUCTURE_GROUPS[group].forEach(category => {
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
			<div id="infrastructureFilters">
				<List selectable ripple className="facility-filter-list">
					{listItems}
				</List>
			</div>
		);
	}

	makeSearchResults() {
		return (
			<div id="infrastructureResults">
				<List selectable ripple className="feature-item-list">
					{this.makeListItems()}
				</List>
				<div
					className="no-results"
					hidden={this.props.searchState.get("searchResults").size}
				>
					<div className="icon" />
					<h1>No Infrastructure Found</h1>
					<h2>Try widening some search parameters</h2>
				</div>
				{this.makePageControls()}
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
				<span className="factory-icon" />
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
	// activeFeature: PropTypes.object.isRequired,
	activeFeature: function(props, propName, componentName) {
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
	toggleFeatureDetail: PropTypes.func.isRequired
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
		)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(
	InfrastructureContainer
);
