import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, IconButton } from "react-toolbox/lib/button";
import { Tab, Tabs } from "react-toolbox";
import * as appStrings from "_core/constants/appStrings";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import LayerControlContainer from "_core/components/LayerMenu/LayerControlContainer";
import MiscUtil from "_core/utils/MiscUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import FeatureInfoContainer from "components/FeatureInfo/FeatureInfoContainer";

const miscUtil = new MiscUtil();

export class LayerSidebarContainer extends Component {
    // Gets the category name for a numerical tab index
    getCategoryForIndex(category) {
        switch (category) {
            case 0:
                return layerSidebarTypes.CATEGORY_PLUMES;
            case 1:
                return layerSidebarTypes.CATEGORY_INFRASTRUCTURE;
        }
    }

    // Gets the numerical tab index for a category name
    getIndexForCategory(index) {
        switch (index) {
            case layerSidebarTypes.CATEGORY_PLUMES:
                return 0;
            case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
                return 1;
        }
    }

    changeCategory(index) {
        this.props.changeSidebarCategory(this.getCategoryForIndex(index));
    }

    makeTab(category) {
        return (
            <Tab
                label={`Infrastructure (${this.props.availableFeatures.get(
                    category
                ).size})`}
            >
                {this.props.availableFeatures
                    .get(category)
                    .slice(
                        this.props.pageIndices.get(category),
                        this.props.pageIndices.get(category) +
                            layerSidebarTypes.FEATURES_PER_PAGE
                    )
                    .map(feature =>
                        <FeatureInfoContainer
                            key={feature.get("id") + "_feature_listing"}
                            name={feature.get("name")}
                            id={feature.get("id")}
                            category={feature.get("category")}
                        />
                    )}
                {this.getPageControls(category)}
            </Tab>
        );
    }

    getPageControls(category) {
        const totalFeatures = this.props.availableFeatures.get(category).size;
        const currentPageIndex = this.props.pageIndices.get(category);
        const endIndex =
            currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE >
            totalFeatures
                ? totalFeatures
                : currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE;
        const counterLabel =
            totalFeatures !== 0
                ? `Showing ${currentPageIndex + 1} to ${endIndex}`
                : "No features found in the current viewport";

        return (
            <div className="feature-results-page-row">
                <div className="layer-sidebar-page-label">
                    {counterLabel}
                </div>
                <IconButton
                    icon="chevron_left"
                    onClick={() => this.props.pageBackward(category)}
                    disabled={currentPageIndex === 0}
                    theme={{ icon: "layer-sidebar-page-icon" }}
                />
                <IconButton
                    icon="chevron_right"
                    onClick={() => this.props.pageForward(category)}
                    disabled={endIndex === totalFeatures}
                    theme={{ icon: "layer-sidebar-page-icon" }}
                />
            </div>
        );
    }

    render() {
        const containerStyle = this.props.availableFeatures.get(
            this.props.activeFeatureCategory
        ).size
            ? null
            : "no-results";
        return (
            <div id="layerSidebar">
                <div id="layerSidebarHeaderRow" className="row middle-xs">
                    <Tabs
                        index={this.getIndexForCategory(
                            this.props.activeFeatureCategory
                        )}
                        onChange={index => this.changeCategory(index)}
                        inverse
                        fixed
                        theme={{
                            navigation: "category-tab-nav",
                            pointer: "category-tab-pointer",
                            tabs: "category-tabs",
                            tab: "category-tab-content"
                        }}
                        className={containerStyle}
                    >
                        {this.makeTab(layerSidebarTypes.CATEGORY_PLUMES)}
                        {this.makeTab(
                            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                        )}
                    </Tabs>
                </div>
            </div>
        );
    }
}

LayerSidebarContainer.propTypes = {
    availableFeatures: PropTypes.object.isRequired,
    activeFeatureCategory: PropTypes.string.isRequired,
    pageForward: PropTypes.func.isRequired,
    pageBackward: PropTypes.func.isRequired,
    changeSidebarCategory: PropTypes.func.isRequired,
    pageIndices: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        availableFeatures: state.layerSidebar.get("availableFeatures"),
        activeFeatureCategory: state.layerSidebar.get("activeFeatureCategory"),
        pageIndices: state.layerSidebar.get("pageIndices")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        pageForward: bindActionCreators(
            layerSidebarActions.pageForward,
            dispatch
        ),
        pageBackward: bindActionCreators(
            layerSidebarActions.pageBackward,
            dispatch
        ),
        changeSidebarCategory: bindActionCreators(
            layerSidebarActions.changeSidebarCategory,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    LayerSidebarContainer
);
