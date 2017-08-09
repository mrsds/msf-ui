import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, IconButton } from 'react-toolbox/lib/button';
import * as appStrings from '_core/constants/appStrings';
import * as layerSidebarActions from 'actions/LayerSidebarActions';
import LayerControlContainer from '_core/components/LayerMenu/LayerControlContainer';
import MiscUtil from '_core/utils/MiscUtil';
import * as layerSidebarTypes from 'constants/layerSidebarTypes';
import FontIcon from 'react-toolbox/lib/font_icon';

const miscUtil = new MiscUtil();

export class FeatureInfoContainer extends Component {
    getCategoryIcon() {
        switch (this.props.category) {
            case "Oil & Gas Wells":
                return "whatshot";
            default:
                return "";
        }
    }

    render() {
        return (
            <div className="feature-info">
                <div className="feature-title">{this.props.id}</div>
                <div className="feature-details">
                    <span className="county">Los Angeles County</span>
                    <div className="category">
                        <FontIcon value={this.getCategoryIcon()}  className="category-icon" />
                        <div>{this.props.category}</div>
                    </div>
                </div>
            </div>
        );
    }
}

 FeatureInfoContainer.propTypes = {
    id: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
   // layerSidebarActiveCategory: PropTypes.string.isRequired,
   // setLayerSidebarCategory: PropTypes.func.isRequired,
   // availableFeatures: PropTypes.array.isRequired,
//     layers: PropTypes.object.isRequired,
//     distractionFreeMode: PropTypes.bool.isRequired,
//     palettes: PropTypes.object.isRequired
};

// function mapStateToProps(state) {
    // return {
       // layerSidebarActiveCategory: state.layerSidebar.get("activeCategory"),
       // availableFeatures: state.layerSidebar.get("availableFeatures"),
//         layerMenuOpen: state.view.get("layerMenuOpen"),
//         layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA]),
//         palettes: state.map.get("palettes"),
//         distractionFreeMode: state.view.get("distractionFreeMode")
    // };
// }

// function mapDispatchToProps(dispatch) {
//     return {
//         setLayerSidebarCategory: bindActionCreators(layerSidebarActions.setLayerSidebarCategory, dispatch)
//     };
// }

export default connect(
    null,
    // mapStateToProps,
    null
    // mapDispatchToProps
)(FeatureInfoContainer);
