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

const miscUtil = new MiscUtil_Extended();
const mapUtil = new MapUtil_Extended();

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

	makeResultsArea() {
		return (
			<div id="plumeResults" className="sidebar-content">
				{this.makeLoadingModal()}
				<List selectable ripple className="feature-item-list">
					{this.makeListItems()}
				</List>
				<div
					className="no-results"
					hidden={this.props.searchState.get("searchResults").size}
				>
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
		return (
			<div className="feature-item-container">
				<div id="plumeSearch">
					<input
						type="text"
						placeholder="Search for Plumes"
						onChange={this.props.updateFeatureSearchText.bind(
							null,
							layerSidebarTypes.CATEGORY_PLUMES
						)}
					/>
				</div>
				{this.makeResultsArea()}
			</div>
		);
	}
}

PlumesContainer.propTypes = {
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
	pageForward: PropTypes.func.isRequired,
	pageBackward: PropTypes.func.isRequired,
	toggleFeatureDetail: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired
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
		)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumesContainer);
