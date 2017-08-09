import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, IconButton } from 'react-toolbox/lib/button';
import { Tab, Tabs } from 'react-toolbox';
import * as appStrings from '_core/constants/appStrings';
import * as layerSidebarActions from 'actions/LayerSidebarActions';
import LayerControlContainer from '_core/components/LayerMenu/LayerControlContainer';
import MiscUtil from '_core/utils/MiscUtil';
import * as layerSidebarTypes from 'constants/layerSidebarTypes';
import FeatureInfoContainer from 'components/FeatureInfo/FeatureInfoContainer';

const miscUtil = new MiscUtil();

export class LayerSidebarContainer extends Component {
    render() {
        // let layerList = this.props.layers.filter((layer) => !layer.get("isDisabled")).toList().sort(miscUtil.getImmutableObjectSort("title"));
        // let totalNum = layerList.size;
        // let activeNum = layerList.count((el) => {
        //     return el.get("isActive");
        // });

        // // css classes
        // let layerMenuClasses = miscUtil.generateStringFromSet({
        //     "open": this.props.layerMenuOpen,
        //     "hidden-fade-out": this.props.distractionFreeMode,
        //     "hidden-fade-in": !this.props.distractionFreeMode
        // });


        // const plumeCategoryClasses = miscUtil.generateStringFromSet({
        //     "layer-sidebar-menu-header col-xs-6 text-center": true,
        //     "selected": this.props.layerSidebarActiveCategory === layerSidebarTypes.CATEGORY_PLUMES
        // });

        // const infrastructureCategoryClasses = miscUtil.generateStringFromSet({
        //     "layer-sidebar-menu-header col-xs-6 text-center": true,
        //     "selected": this.props.layerSidebarActiveCategory === layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        // });

        const infrastructureCount = this.props.availableFeatures.size;

        const plumePageIndex = this.props.featurePageIndex.get("plumes");
        const infrastructurePageIndex = this.props.featurePageIndex.get("infrastructure");

        let availableFeaturesList;
        let currentPageIndex;
        let currentFeatureCount;
        if (this.props.categoryIndex === layerSidebarTypes.CATEGORY_PLUMES) {
            availableFeaturesList = [];
        } else if (this.props.categoryIndex === layerSidebarTypes.CATEGORY_INFRASTRUCTURE) {
            currentPageIndex = infrastructurePageIndex;
            currentFeatureCount = infrastructureCount;
            availableFeaturesList = this.props.availableFeatures.slice(currentPageIndex, currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE);
        }

        const infrastructureLabel = `Infrastructure (${infrastructureCount})`;

                    // <div className={plumeCategoryClasses} onClick={() => this.props.setLayerSidebarCategory(layerSidebarTypes.CATEGORY_PLUMES)}>
                    //     <span>PLUMES (XXX)</span>
                    // </div>
                    // <div className={infrastructureCategoryClasses} onClick={() => this.props.setLayerSidebarCategory(layerSidebarTypes.CATEGORY_INFRASTRUCTURE)}>
                    //     <span>INFRASTRUCTURE ({infrastructureCount})</span>
                    // </div>
        return (
            <div id="layerSidebar">
                <div id="layerSidebarHeaderRow" className="row middle-xs">
                <Tabs index={this.props.categoryIndex} onChange={this.props.changeSidebarCategory} inverse fixed theme={{navigation: "category-tab-nav", pointer: "category-tab-pointer", tabs: "category-tabs", tab: "category-tab-content"}}>
                    <Tab label="Plumes">Plumes</Tab>
                    <Tab label={infrastructureLabel}>
                            {availableFeaturesList
                                .map(feature => 
                                <FeatureInfoContainer 
                                    key={feature.get("id") + "_feature_listing"}
                                    id={feature.get("id")}
                                    category={feature.get("category")}
                                />
                            )}
                        <div className="feature-results-page-row">
                            <div className="layer-sidebar-page-label">Showing results {currentPageIndex + 1} - {currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE < currentFeatureCount ? currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE : currentFeatureCount }</div>
                            <IconButton icon="chevron_left" onClick={() => this.props.pageBackward(this.props.categoryIndex)} disabled={currentPageIndex === 0} theme={{icon: "layer-sidebar-page-icon"}}/>
                            <IconButton icon="chevron_right" onClick={() => this.props.pageForward(this.props.categoryIndex)} disabled={currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE > currentFeatureCount + 1} theme={{icon: "layer-sidebar-page-icon"}}/>
                        </div>
                    </Tab>
                </Tabs>
                </div>
            </div>
        );
    }
}

 LayerSidebarContainer.propTypes = {
   setLayerSidebarCategory: PropTypes.func.isRequired,
   availableFeatures: PropTypes.object.isRequired,
   featurePageIndex: PropTypes.object.isRequired,
   pageForward: PropTypes.func.isRequired,
   pageBackward: PropTypes.func.isRequired,
   categoryIndex: PropTypes.number.isRequired,
   changeSidebarCategory: PropTypes.func.isRequired,
//     layers: PropTypes.object.isRequired,
//     distractionFreeMode: PropTypes.bool.isRequired,
//     palettes: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
       availableFeatures: state.layerSidebar.get("availableFeatures"),
       featurePageIndex: state.layerSidebar.get("featurePageIndex"),
       categoryIndex: state.layerSidebar.get("categoryIndex"),
//         layerMenuOpen: state.view.get("layerMenuOpen"),
//         layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA]),
//         palettes: state.map.get("palettes"),
//         distractionFreeMode: state.view.get("distractionFreeMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLayerSidebarCategory: bindActionCreators(layerSidebarActions.setLayerSidebarCategory, dispatch),
        pageForward: bindActionCreators(layerSidebarActions.pageForward, dispatch),
        pageBackward: bindActionCreators(layerSidebarActions.pageBackward, dispatch),
        changeSidebarCategory: bindActionCreators(layerSidebarActions.changeSidebarCategory, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerSidebarContainer);
