import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import Radio from "material-ui/Radio";
import Popover from "material-ui/Popover";
import Paper from "material-ui/Paper";
import Search from "material-ui-icons/Search";
import Clear from "material-ui-icons/Clear";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import AppBar from "material-ui/AppBar";
import Typography from "material-ui/Typography";
import Toolbar from "material-ui/Toolbar";
import AirplanemodeActiveIcon from "material-ui-icons/AirplanemodeActive";
import CloseIcon from "material-ui-icons/Close";
import { Manager, Target, Popper } from "react-popper";
import ChipDropdown from "components/Reusables/ChipDropdown";
import SearchInput from "components/Reusables/SearchInput";
import styles from "components/MethaneSidebar/FiltersContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import { IconButtonSmall } from "_core/components/Reusables";
import Immutable from "immutable";

export class PlumeFiltersContainer extends Component {
    constructor(props) {
        super(props);
        // this.popperProps = Immutable.fromJS({
        //     flightCampaigns: false,
        //     plumeIME: false,
        //     plumeID: false,
        //     source: false
        // });
    }

    // setPopperActive(key, active) {
    //     this.popperProps = this.popperProps.map((v, k) => (k === key ? active : false));
    //     this.forceUpdate();
    // }

    // closeAllPoppers() {
    //     this.popperProps = this.popperProps.map((v, k) => false);
    //     this.forceUpdate();
    // }

    render() {
        let infrastructureNameFilter = this.props.filters.get(
            layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME
        );
        let infrastructureNameFilterSelectedValue = infrastructureNameFilter.get("selectedValue")
            .value;
        let infrastructureNameFilterSelectedValueLabel = infrastructureNameFilter.get(
            "selectedValue"
        )
            ? infrastructureNameFilter.get("selectedValue").label
            : null;

        return (
            <React.Fragment>
                <SearchInput
                    icon={<Search />}
                    placeholder="Filter by Infrastructure Name"
                    value={infrastructureNameFilterSelectedValue}
                    disabled={false}
                    onUpdate={valueStr =>
                        this.props.setInfrastructureFilter(
                            layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME,
                            {
                                value: valueStr,
                                label: ""
                            }
                        )
                    }
                    validate={valueStr => true}
                    primaryDataTip="Filter by Infrastructure Name"
                    primaryDataPlace="top"
                    actionIcon={<Clear />}
                    onActionIconClick={() =>
                        this.props.setInfrastructureFilter(
                            layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME,
                            {
                                value: "",
                                label: ""
                            }
                        )
                    }
                />
            </React.Fragment>
        );
    }
}

PlumeFiltersContainer.propTypes = {
    filters: PropTypes.object.isRequired,
    setInfrastructureFilter: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        filters: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
            "filters"
        ])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setInfrastructureFilter: bindActionCreators(
            layerSidebarActions.setInfrastructureFilter,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumeFiltersContainer);
