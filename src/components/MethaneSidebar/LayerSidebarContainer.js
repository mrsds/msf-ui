import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AppBar from "material-ui/AppBar";
import Tabs, { Tab } from "material-ui/Tabs";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import InfrastructureContainer from "components/MethaneSidebar/InfrastructureContainer";
import PlumesContainer from "components/MethaneSidebar/PlumesContainer";
import Paper from "material-ui/Paper";
import styles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import MiscUtil from "_core/utils/MiscUtil";

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

    handleChange(index) {
        this.props.changeSidebarCategory(this.getCategoryForIndex(index));
    }

    renderInfrastructureContainer() {
        return (
            <InfrastructureContainer
                availableFeatures={this.props.availableFeatures.get(
                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                )}
                isVisible={true}
                searchState={this.props.searchState.get(layerSidebarTypes.CATEGORY_INFRASTRUCTURE)}
                activeInfrastructureSubCategories={this.props.activeInfrastructureSubCategories}
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
                searchState={this.props.searchState.get(layerSidebarTypes.CATEGORY_PLUMES)}
                activeInfrastructureSubCategories={this.props.activeInfrastructureSubCategories}
                isLoading={this.props.featureLoadingState.get(layerSidebarTypes.CATEGORY_PLUMES)}
            />
        );
    }

    render() {
        const containerClass = this.props.availableFeatures.get(this.props.activeFeatureCategory)
            .size
            ? null
            : "no-results";

        let plumesTabLabel = `${this.getNameForCategory(layerSidebarTypes.CATEGORY_PLUMES)} (${
            this.props.searchState.getIn([layerSidebarTypes.CATEGORY_PLUMES, "searchResults"]).size
        })`;
        let infrastuctureTabLabel = `${this.getNameForCategory(
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        )} (${
            this.props.searchState.getIn([
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                "searchResults"
            ]).size
        })`;

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.flexboxParent]: true,
            [styles.layerSidebar]: true
        });

        let activeTabIndex = this.getIndexForCategory(this.props.activeFeatureCategory);
        return (
            <Paper elevation={2} square={true} className={containerClasses}>
                <AppBar position="static">
                    <Tabs
                        className={styles.tabsRoot}
                        fullWidth
                        indicatorColor="white"
                        value={activeTabIndex}
                        onChange={(event, index) => this.handleChange(index)}
                    >
                        <Tab
                            classes={{ labelContainer: styles.tabLabelContainer }}
                            label={plumesTabLabel}
                        />
                        <Tab
                            classes={{ labelContainer: styles.tabLabelContainer }}
                            label={infrastuctureTabLabel}
                        />
                    </Tabs>
                </AppBar>
                <div className={activeTabIndex === 1 ? displayStyles.hidden : ""}>
                    <div className={styles.tabContainer}>{this.renderPlumesContainer()}</div>
                </div>
                <div className={activeTabIndex === 0 ? displayStyles.hidden : ""}>
                    <div className={styles.tabContainer}>
                        {this.renderInfrastructureContainer()}
                    </div>
                </div>
            </Paper>
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
        pageBackward: bindActionCreators(layerSidebarActions.pageBackward, dispatch),
        changeSidebarCategory: bindActionCreators(
            layerSidebarActions.changeSidebarCategory,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSidebarContainer);
