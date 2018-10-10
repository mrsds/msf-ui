import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Radio from "@material-ui/core/Radio";
import Popover from "@material-ui/core/Popover";
import Paper from "@material-ui/core/Paper";
import Search from "@material-ui/icons/Search";
import Sort from "@material-ui/icons/SortByAlpha";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";
import Grow from "@material-ui/core/Grow";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import AirplanemodeActiveIcon from "@material-ui/icons/AirplanemodeActive";
import CloseIcon from "@material-ui/icons/Close";
import { Manager, Target, Popper } from "react-popper";
import ChipDropdown from "components/Reusables/ChipDropdown";
import SearchInput from "components/Reusables/SearchInput";
import styles from "components/MethaneSidebar/FiltersContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import { IconButtonSmall, ClickAwayListener } from "_core/components/Reusables";
import Immutable from "immutable";

export class PlumeFiltersContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            flightCampaigns: false,
            plumeIME: false,
            plumeID: false,
            source: false,
            sortBy: false
        });
    }

    shouldComponentUpdate(nextProps) {
        return this.props.filters
            .filter((_, k) => k.toLowerCase().startsWith("plume"))
            .some(
                (v, k) =>
                    v.getIn(["selectedValue", "value"]) !==
                    nextProps.filters.getIn([k, "selectedValue", "value"])
            );
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

        let plumeSortByFilter = this.props.filters.get(layerSidebarTypes.PLUME_FILTER_SORT_BY);
        let plumeSortBySelectedValue = plumeSortByFilter.getIn(["selectedValue", "value"]);
        let plumeSortBySelectedValueLabel = plumeSortByFilter.getIn(["selectedValue", "label"]);
        let plumeSortByPopperActive = this.popperProps.get("sortBy");

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
                    onActionIconClick={() => {
                        this.props.setPlumeFilter(layerSidebarTypes.PLUME_FILTER_PLUME_ID, {
                            value: "",
                            label: ""
                        });
                        this.forceUpdate();
                    }}
                />
                <ClickAwayListener
                    onClickAway={() => {
                        if (
                            plumeIMEPopoverActive ||
                            flightCampaignsPopoverActive ||
                            plumeSortByPopperActive
                        ) {
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
                            className={
                                !plumeIMEPopoverActive ? displayStyles.noPointer : styles.pointer
                            }
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
                                                    variant="body1"
                                                    color="inherit"
                                                    className={styles.popoverTitle}
                                                >
                                                    Plume Integrated Methane Enhancement
                                                </Typography>
                                                <IconButtonSmall
                                                    color="inherit"
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
                            className={
                                !flightCampaignsPopoverActive
                                    ? displayStyles.noPointer
                                    : styles.pointer
                            }
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
                                                    variant="body1"
                                                    color="inherit"
                                                    className={styles.popoverTitle}
                                                >
                                                    Flight Campaigns
                                                </Typography>
                                                <IconButtonSmall
                                                    color="inherit"
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
                        <Target className={styles.sorterContainer}>
                            <div
                                className={styles.sorter}
                                onClick={() =>
                                    this.setPopperActive("sortBy", !plumeSortByPopperActive)
                                }
                            >
                                Sort by: <Sort />
                            </div>
                        </Target>
                        <Popper
                            placement="bottom-end"
                            modifiers={{
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }}
                            eventsEnabled={plumeSortByPopperActive}
                            style={{ marginTop: "-47px", marginRight: "-16px" }}
                            className={
                                !plumeSortByPopperActive ? displayStyles.noPointer : styles.pointer
                            }
                        >
                            <Grow
                                style={{ transformOrigin: "right top" }}
                                in={plumeSortByPopperActive}
                            >
                                <div>
                                    <Paper elevation={8} className={styles.popoverPaper}>
                                        <List>
                                            <div className={styles.sorterHeader}>
                                                Sort By<Sort />
                                            </div>
                                            {plumeSortByFilter.get("selectableValues").map(x => (
                                                <ListItem
                                                    dense
                                                    button
                                                    onClick={() => {
                                                        this.props.setPlumeFilter(
                                                            layerSidebarTypes.PLUME_FILTER_SORT_BY,
                                                            x
                                                        );
                                                        this.setPopperActive("sortBy", false);
                                                    }}
                                                    key={x.get("value")}
                                                >
                                                    <ListItemIcon>
                                                        {x.get("value") ===
                                                        plumeSortBySelectedValue ? (
                                                            <Check />
                                                        ) : (
                                                            <span className={styles.blankIcon} />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText primary={x.get("label")} />
                                                </ListItem>
                                            ))}
                                        </List>
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
