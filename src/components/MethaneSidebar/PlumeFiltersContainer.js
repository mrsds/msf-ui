import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as layerSidebarActions from "actions/layerSidebarActions";
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

    closeAllPoppers() {
        this.popperProps = this.popperProps.map((v, k) => false);
        this.forceUpdate();
    }

    render() {
        let flightCampaignFilter = this.props.filters.get(
            layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN
        );
        let flightCampaignFilterSelectedValue =
            flightCampaignFilter.getIn(["selectedValue", "value"]) || null;
        let flightCampaignFilterValueLabel = flightCampaignFilter.getIn(["selectedValue", "label"]);
        let flightCampaignsPopoverActive = this.popperProps.get("flightCampaigns");

        let plumeIDFilter = this.props.filters.get(layerSidebarTypes.PLUME_FILTER_PLUME_ID);
        let plumeIDFilterSelectedValue = plumeIDFilter.getIn(["selectedValue", "value"]);

        let plumeIMEFilter = this.props.filters.get(layerSidebarTypes.PLUME_FILTER_PLUME_IME);
        let plumeIMEFilterSelectedValue = plumeIMEFilter.getIn(["selectedValue", "value"]) || null;
        let plumeIMEFilterSelectedValueLabel = plumeIMEFilter.getIn(["selectedValue", "label"]);
        let plumeIMEPopoverActive = this.popperProps.get("plumeIME");

        return (
            <React.Fragment>
                <SearchInput
                    icon={<Search />}
                    placeholder="Filter by Plume ID"
                    value={plumeIDFilterSelectedValue}
                    disabled={false}
                    onUpdate={valueStr =>
                        this.props.setPlumeFilter(layerSidebarTypes.PLUME_FILTER_PLUME_ID, {
                            value: valueStr,
                            label: ""
                        })
                    }
                    validate={valueStr => true}
                    primaryDataTip="Filter by Plume ID"
                    primaryDataPlace="top"
                    actionIcon={<Clear />}
                    onActionIconClick={() =>
                        this.props.setPlumeFilter(layerSidebarTypes.PLUME_FILTER_PLUME_ID, {
                            value: "",
                            label: ""
                        })
                    }
                />
                <ClickAwayListener
                    onClickAway={() => {
                        if (plumeIMEPopoverActive || flightCampaignFilter) {
                            this.closeAllPoppers();
                        }
                    }}
                >
                    <Manager className={styles.manager}>
                        <Target>
                            <ChipDropdown
                                className={styles.chip}
                                onClick={() =>
                                    this.setPopperActive("plumeIME", !plumeIMEPopoverActive)
                                }
                                onDelete={() => {
                                    this.setPopperActive("plumeIME", false);
                                    this.props.setPlumeFilter(
                                        layerSidebarTypes.PLUME_FILTER_PLUME_IME,
                                        null
                                    );
                                }}
                                label="Plume IME"
                                value={
                                    plumeIMEFilterSelectedValueLabel
                                        ? plumeIMEFilterSelectedValueLabel
                                        : null
                                }
                                active={plumeIMEPopoverActive}
                            />
                        </Target>
                        <Popper
                            placement="bottom-start"
                            modifiers={{
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }}
                            eventsEnabled={plumeIMEPopoverActive}
                            className={!plumeIMEPopoverActive ? displayStyles.noPointer : ""}
                        >
                            <Grow
                                style={{ transformOrigin: "left top" }}
                                in={plumeIMEPopoverActive}
                            >
                                <div>
                                    <Paper elevation={8} className={styles.popoverPaper}>
                                        <AppBar elevation={0} className={styles.popoverAppBar}>
                                            <Toolbar className={styles.popoverHeader}>
                                                <Typography
                                                    type="body1"
                                                    color="inherit"
                                                    className={styles.popoverTitle}
                                                >
                                                    Plume Integrated Methane Enhancement
                                                </Typography>
                                                <IconButtonSmall
                                                    color="contrast"
                                                    onClick={() =>
                                                        this.setPopperActive("plumeIME", false)
                                                    }
                                                >
                                                    <CloseIcon />
                                                </IconButtonSmall>
                                            </Toolbar>
                                        </AppBar>
                                        <div className={styles.formControl}>
                                            {/* TODO break out this whole thing into separate ime component */}
                                            <div
                                                onClick={() => {
                                                    this.props.setPlumeFilter(
                                                        layerSidebarTypes.PLUME_FILTER_PLUME_IME,
                                                        null
                                                    );
                                                }}
                                                key={"plumeIMENoValue"}
                                                className={styles.formControlLabel}
                                            >
                                                <Radio
                                                    value={""}
                                                    checked={plumeIMEFilterSelectedValue === null}
                                                />
                                                <Typography className={styles.radioLabel}>
                                                    Any Plume IME
                                                </Typography>
                                            </div>
                                            {plumeIMEFilter.get("selectableValues").map(x => (
                                                <div
                                                    onClick={() => {
                                                        this.props.setPlumeFilter(
                                                            layerSidebarTypes.PLUME_FILTER_PLUME_IME,
                                                            x
                                                        );
                                                    }}
                                                    key={x.get("value")}
                                                    className={styles.formControlLabel}
                                                >
                                                    <Radio
                                                        value={x.get("value").toString()}
                                                        checked={
                                                            x.get("value") ===
                                                            plumeIMEFilterSelectedValue
                                                        }
                                                    />
                                                    <Typography className={styles.radioLabel}>
                                                        {x.get("label")}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    </Paper>
                                </div>
                            </Grow>
                        </Popper>
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
                                                className={styles.chipLeftIcon}
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
                                                    key={x.get("value")}
                                                    className={styles.formControlLabel}
                                                >
                                                    <Radio
                                                        value={x.get("value")}
                                                        checked={
                                                            x.get("value") ===
                                                            flightCampaignFilterSelectedValue
                                                        }
                                                    />
                                                    <Typography className={styles.radioLabel}>
                                                        {x.get("label")}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    </Paper>
                                </div>
                            </Grow>
                        </Popper>
                    </Manager>
                </ClickAwayListener>
            </React.Fragment>
        );
    }
}

PlumeFiltersContainer.propTypes = {
    filters: PropTypes.object.isRequired,
    setPlumeFilter: PropTypes.func.isRequired
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
