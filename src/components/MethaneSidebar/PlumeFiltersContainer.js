import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as layerSidebarActions from "actions/LayerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import Radio, { RadioGroup } from "material-ui/Radio";
import { FormControl, FormControlLabel } from "material-ui/Form";
import Popover from "material-ui/Popover";
import Paper from "material-ui/Paper";
import Search from "material-ui-icons/Search";
import Clear from "material-ui-icons/Clear";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import AppBar from "material-ui/AppBar";
import Typography from "material-ui/Typography";
import Avatar from "material-ui/Avatar";
import Toolbar from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import AirplanemodeActiveIcon from "material-ui-icons/AirplanemodeActive";
import CloseIcon from "material-ui-icons/Close";
import { Manager, Target, Popper } from "react-popper";
import ChipDropdown from "components/Reusables/ChipDropdown";
import SearchInput from "components/Reusables/SearchInput";
import styles from "components/MethaneSidebar/PlumeFiltersContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import Immutable from "immutable";
import { IconButtonSmall } from "_core/components/Reusables";

export class PlumeFiltersContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            flightCampaigns: false,
            plumeIME: false,
            plumeID: false,
            source: false
        });
    }

    setPopperActive(key, active) {
        this.popperProps = this.popperProps.map((v, k) => (k === key ? active : false));
        this.forceUpdate();
    }

    render() {
        let flightCampaignFilter = this.props.filters.getIn([
            layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN
        ]);
        let flightCampaignFilterSelectedValue = flightCampaignFilter.get("selectedValue")
            ? flightCampaignFilter.get("selectedValue").value
            : null;
        let flightCampaignFilterValueLabel = flightCampaignFilter.get("selectedValue")
            ? flightCampaignFilter.get("selectedValue").label
            : null;
        let flightCampaignsPopoverActive = this.popperProps.get("flightCampaigns");

        let plumeIDFilter = this.props.filters.getIn([layerSidebarTypes.PLUME_FILTER_PLUME_ID]);
        let plumeIDFilterSelectedValue = plumeIDFilter.get("selectedValue")
            ? plumeIDFilter.get("selectedValue").value
            : null;
        // let selectedIME = this.props.searchState.get("selectedIME") || "";

        return (
            <React.Fragment>
                <SearchInput
                    className={styles.searchInput}
                    icon={<Search />}
                    placeholder="Search by Plume ID (or Source ID?)"
                    value={plumeIDFilterSelectedValue}
                    disabled={false}
                    onUpdate={valueStr =>
                        this.props.setPlumeFilter(layerSidebarTypes.PLUME_FILTER_PLUME_ID, {
                            value: valueStr,
                            label: ""
                        })
                    }
                    validate={valueStr => true}
                    primaryDataTip="Search by Plume ID (or Source ID?)"
                    primaryDataPlace="top"
                    actionIcon={<Clear />}
                    onActionIconClick={() =>
                        this.props.setPlumeFilter(layerSidebarTypes.PLUME_FILTER_PLUME_ID, {
                            value: "",
                            label: ""
                        })
                    }
                />
                <Manager className={styles.manager}>
                    <Target>
                        <ChipDropdown
                            className={styles.chip}
                            onClick={() =>
                                this.setPopperActive(
                                    "flightCampaigns",
                                    !flightCampaignsPopoverActive
                                )
                            }
                            onDelete={() => {
                                this.setPopperActive("flightCampaigns", false);
                                this.props.setPlumeFilter(
                                    layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN,
                                    null
                                );
                            }}
                            label="Flight Campaigns"
                            value={
                                flightCampaignFilterValueLabel ? (
                                    <React.Fragment>
                                        <AirplanemodeActiveIcon
                                            className={styles.flightCampaignChipIcon}
                                        />
                                        {flightCampaignFilterValueLabel}
                                    </React.Fragment>
                                ) : null
                            }
                            active={flightCampaignsPopoverActive}
                        />
                    </Target>
                    <Popper
                        placement="bottom-start"
                        modifiers={{
                            computeStyle: {
                                gpuAcceleration: false
                            }
                        }}
                        eventsEnabled={flightCampaignsPopoverActive}
                        className={!flightCampaignsPopoverActive ? displayStyles.noPointer : ""}
                    >
                        <Grow
                            style={{ transformOrigin: "left top" }}
                            in={flightCampaignsPopoverActive}
                        >
                            <div>
                                <ClickAwayListener
                                    onClickAway={() => {
                                        if (flightCampaignsPopoverActive) {
                                            this.setPopperActive("flightCampaigns", false);
                                        }
                                    }}
                                >
                                    <Paper elevation={8} className={styles.popoverPaper}>
                                        <AppBar elevation={0} className={styles.popoverAppBar}>
                                            <Toolbar className={styles.popoverHeader}>
                                                <Typography
                                                    type="body1"
                                                    color="inherit"
                                                    className={styles.popoverTitle}
                                                >
                                                    Flight Campaigns
                                                </Typography>
                                                <IconButtonSmall
                                                    color="contrast"
                                                    onClick={() =>
                                                        this.setPopperActive(
                                                            "flightCampaigns",
                                                            false
                                                        )
                                                    }
                                                >
                                                    <CloseIcon />
                                                </IconButtonSmall>
                                            </Toolbar>
                                        </AppBar>
                                        <div className={styles.formControl}>
                                            {/* TODO break out this whole thing into separate flight campaign component */}
                                            <div
                                                onClick={() => {
                                                    this.props.setPlumeFilter(
                                                        layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN,
                                                        null
                                                    );
                                                }}
                                                key={"flightCampaignNoValue"}
                                                className={styles.formControlLabel}
                                            >
                                                <Radio
                                                    value={""}
                                                    checked={
                                                        flightCampaignFilterSelectedValue === null
                                                    }
                                                />
                                                <Typography className={styles.radioLabel}>
                                                    All Flight Campaigns
                                                </Typography>
                                            </div>
                                            {flightCampaignFilter.get("selectableValues").map(x => (
                                                <div
                                                    onClick={() => {
                                                        this.props.setPlumeFilter(
                                                            layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN,
                                                            x
                                                        );
                                                    }}
                                                    key={x.value}
                                                    className={styles.formControlLabel}
                                                >
                                                    <Radio
                                                        value={x.value}
                                                        checked={
                                                            x.value ===
                                                            flightCampaignFilterSelectedValue
                                                        }
                                                    />
                                                    <Typography className={styles.radioLabel}>
                                                        {x.label}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    </Paper>
                                </ClickAwayListener>
                            </div>
                        </Grow>
                    </Popper>
                    <Target>
                        <ChipDropdown
                            onClick={() => {}}
                            onDelete={() => {}}
                            className={styles.chip}
                            label="Plume IME"
                            active={false}
                        />
                    </Target>
                </Manager>
            </React.Fragment>
        );
    }
}

PlumeFiltersContainer.propTypes = {
    filters: PropTypes.object.isRequired,
    setPlumeFilter: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        filters: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "filters"
        ])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setPlumeFilter: bindActionCreators(layerSidebarActions.setPlumeFilter, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumeFiltersContainer);
