import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, IconButton } from "react-toolbox/lib/button";
import * as appStrings from "_core/constants/appStrings";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import MiscUtil_Extended from "utils/MiscUtil_Extended";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import FontIcon from "react-toolbox/lib/font_icon";

const miscUtil = new MiscUtil_Extended();

export class FeatureInfoContainer extends Component {
    getCategoryIcon() {
        switch (this.props.feature.get("category").toLowerCase()) {
            case "oil & gas wells":
                return "whatshot";
            default:
                return "";
        }
    }

    render() {
        console.log(this.props.selected);
        const featureName = /\S/.test(this.props.feature.get("name"))
            ? this.props.feature.get("name")
            : "(no name)";
        const featureClass = miscUtil.generateStringFromSet({
            "feature-info": true,
            "is-selected": this.props.selected
        });
        return (
            <div
                className={featureClass}
                onClick={() => this.props.pickFeatureFocus(this.props.feature)}
            >
                <div className="feature-title">
                    {featureName}
                </div>
                <div className="feature-details">
                    <span className="county">
                        {miscUtil.getCountyFromFeature(
                            this.props.feature,
                            "(no county)"
                        )}
                    </span>
                    <div className="category">
                        <FontIcon
                            value={this.getCategoryIcon()}
                            className="category-icon"
                        />
                        <div>
                            {this.props.feature.get("category")}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

FeatureInfoContainer.propTypes = {
    feature: PropTypes.object,
    pickFeatureFocus: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired
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

function mapDispatchToProps(dispatch) {
    return {
        pickFeatureFocus: bindActionCreators(
            layerSidebarActions.pickFeatureFocus,
            dispatch
        )
    };
}

export default connect(
    null,
    // mapStateToProps,
    mapDispatchToProps
)(FeatureInfoContainer);
