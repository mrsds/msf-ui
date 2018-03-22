import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AppBar from "material-ui/AppBar";
import Tabs, { Tab } from "material-ui/Tabs";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import InfrastructureContainer from "components/MethaneSidebar/InfrastructureContainer";
import PlumesContainer from "components/MethaneSidebar/PlumesContainer";
import Paper from "material-ui/Paper";
import Tooltip from "material-ui/Tooltip";
import Button from "material-ui/Button";
import ArrowDropDownIcon from "mdi-material-ui/MenuLeft";
import styles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import MiscUtil from "_core/utils/MiscUtil";
import { appColorPalette } from "styles/appColorPalette";

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
                isVisible={true}
                isLoading={this.props.featureLoadingState.get(
                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                )}
            />
        );
    }

    renderPlumesContainer() {
        return (
            <PlumesContainer
                isVisible={true}
                isLoading={this.props.featureLoadingState.get(layerSidebarTypes.CATEGORY_PLUMES)}
            />
        );
    }

    render() {
        let plumesTabLabel = `${this.getNameForCategory(layerSidebarTypes.CATEGORY_PLUMES)} (${
            this.props.numPlumeSearchResults
        })`;
        let infrastuctureTabLabel = `${this.getNameForCategory(
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        )} (${this.props.numInfrastructureSearchResults})`;

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.flexboxParent]: true,
            [styles.layerSidebar]: true,
            [styles.layerSidebarCollapsed]: this.props.layerSidebarCollapsed
        });

        let iconClasses = MiscUtil.generateStringFromSet({
            [styles.sidebarCollapseButtonIcon]: true,
            [styles.sidebarCollapseButtonIconRotated]: this.props.layerSidebarCollapsed
        });

        let activeTabIndex = this.getIndexForCategory(this.props.activeFeatureCategory);
        return (
            <Paper elevation={2} square={true} className={containerClasses}>
                <Tooltip
                    title={this.props.layerSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    placement="right"
                >
                    <Button
                        variant="raised"
                        className={styles.sidebarCollapseButton}
                        onClick={() =>
                            this.props.setLayerSidebarCollapsed(!this.props.layerSidebarCollapsed)
                        }
                    >
                        <ArrowDropDownIcon className={iconClasses} />
                    </Button>
                </Tooltip>
                <AppBar elevation={1} position="static">
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
    numPlumeSearchResults: PropTypes.number.isRequired,
    numInfrastructureSearchResults: PropTypes.number.isRequired,
    layerSidebarCollapsed: PropTypes.bool.isRequired,
    setLayerSidebarCollapsed: PropTypes.func.isRequired,
    pageForward: PropTypes.func.isRequired,
    pageBackward: PropTypes.func.isRequired,
    changeSidebarCategory: PropTypes.func.isRequired,
    featureLoadingState: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        availableFeatures: state.layerSidebar.get("availableFeatures"),
        layerSidebarCollapsed: state.layerSidebar.get("layerSidebarCollapsed"),
        activeFeatureCategory: state.layerSidebar.get("activeFeatureCategory"),
        numPlumeSearchResults: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "searchResults"
        ]).size,
        numInfrastructureSearchResults: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
            "searchResults"
        ]).size,
        featureLoadingState: state.asynchronous.get("loadingFeatures")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLayerSidebarCollapsed: bindActionCreators(
            layerSidebarActions.setLayerSidebarCollapsed,
            dispatch
        ),
        pageForward: bindActionCreators(layerSidebarActions.pageForward, dispatch),
        pageBackward: bindActionCreators(layerSidebarActions.pageBackward, dispatch),
        changeSidebarCategory: bindActionCreators(
            layerSidebarActions.changeSidebarCategory,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSidebarContainer);
