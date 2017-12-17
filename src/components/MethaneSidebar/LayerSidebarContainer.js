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
import InfrastructureContainer from "components/MethaneSidebar/InfrastructureContainer";
import PlumesContainer from "components/MethaneSidebar/PlumesContainer";

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

  getNameForCategory(category) {
    switch (category) {
      case layerSidebarTypes.CATEGORY_PLUMES:
        return "Plumes";
      case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
        return "Infrastructure";
    }
  }

  changeCategory(index) {
    this.props.changeSidebarCategory(this.getCategoryForIndex(index));
  }

  renderInfrastructureContainer() {
    return (
      <InfrastructureContainer
        availableFeatures={this.props.availableFeatures.get(
          layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        )}
        isVisible={true}
        searchState={this.props.searchState.get(
          layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        )}
        activeInfrastructureSubCategories={
          this.props.activeInfrastructureSubCategories
        }
        isLoading={this.props.featureLoadingState.get(
          layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        )}
      />
    );
  }

  renderPlumesContainer() {
    return (
      <PlumesContainer
        availableFeatures={this.props.availableFeatures.get(
          layerSidebarTypes.CATEGORY_PLUMES
        )}
        isVisible={true}
        searchState={this.props.searchState.get(
          layerSidebarTypes.CATEGORY_PLUMES
        )}
        activeInfrastructureSubCategories={
          this.props.activeInfrastructureSubCategories
        }
        isLoading={this.props.featureLoadingState.get(
          layerSidebarTypes.CATEGORY_PLUMES
        )}
      />
    );
  }

  render() {
    const containerStyle = this.props.availableFeatures.get(
      this.props.activeFeatureCategory
    ).size
      ? null
      : "no-results";
    return (
      <div id="layerSidebar" className="flexbox-parent">
        <Tabs
          index={this.getIndexForCategory(this.props.activeFeatureCategory)}
          onChange={index => this.changeCategory(index)}
          inverse
          fixed
          hideMode={"display"}
          theme={{
            navigation: "category-tab-nav",
            navigationContainer: "navigation-container",
            pointer: "category-tab-pointer",
            tabs: "category-tabs",
            tab: "category-tab-content"
          }}
          className={containerStyle}
        >
          <Tab
            label={`${this.getNameForCategory(
              layerSidebarTypes.CATEGORY_PLUMES
            )} (${
              this.props.searchState.getIn([
                layerSidebarTypes.CATEGORY_PLUMES,
                "searchResults"
              ]).size
            })`}
          >
            {this.renderPlumesContainer()}
          </Tab>
          <Tab
            label={`${this.getNameForCategory(
              layerSidebarTypes.CATEGORY_INFRASTRUCTURE
            )} (${
              this.props.searchState.getIn([
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                "searchResults"
              ]).size
            })`}
          >
            {this.renderInfrastructureContainer()}
          </Tab>
        </Tabs>
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
  searchState: PropTypes.object.isRequired,
  activeInfrastructureSubCategories: PropTypes.object.isRequired,
  featureLoadingState: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    availableFeatures: state.layerSidebar.get("availableFeatures"),
    activeFeatureCategory: state.layerSidebar.get("activeFeatureCategory"),
    searchState: state.layerSidebar.get("searchState"),
    activeInfrastructureSubCategories: state.layerSidebar.get(
      "activeInfrastructureSubCategories"
    ),
    featureLoadingState: state.asynchronous.get("loadingFeatures")
  };
}

function mapDispatchToProps(dispatch) {
  return {
    pageForward: bindActionCreators(layerSidebarActions.pageForward, dispatch),
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
