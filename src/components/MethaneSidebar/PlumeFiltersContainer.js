import { Manager, Target, Popper } from "react-popper";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";
import CloseIcon from "@material-ui/icons/Close";
import Grow from "@material-ui/core/Grow";
import Immutable from "immutable";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import React, { Component } from "react";
import Search from "@material-ui/icons/Search";
import Sort from "@material-ui/icons/SortByAlpha";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";

import MiscUtil from "_core/utils/MiscUtil";
import { IconButtonSmall, ClickAwayListener } from "_core/components/Reusables";
import ChipDropdown from "components/Reusables/ChipDropdown";
import SearchInput from "components/Reusables/SearchInput";
import displayStyles from "_core/styles/display.scss";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/MethaneSidebar/FiltersContainerStyles.scss";
import accessibilityStyles from "_core/styles/accessibility.scss";

export class PlumeFiltersContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            flightCampaigns: false,
            plumeFlux: false,
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

    handleSearchInput(valueStr) {
        this.props.setPlumeTextFilter(valueStr);
        clearTimeout(this.searchInputTimeout);
        this.searchInputTimeout = setTimeout(_ => this.props.applyPlumeTextFilter(), 350);
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
        let plumeIDFilterSelectedValue = plumeIDFilter.get("selectedValue");

        let plumeFluxFilter = this.props.filters.get(layerSidebarTypes.PLUME_FILTER_PLUME_FLUX);
        let plumeFluxFilterSelectedValue =
            typeof plumeFluxFilter.getIn(["selectedValue", "value"]) === "undefined"
                ? null
                : plumeFluxFilter.getIn(["selectedValue", "value"]);
        let plumeFluxFilterSelectedValueLabel = plumeFluxFilter.getIn(["selectedValue", "label"]);
        let plumeFluxPopoverActive = this.popperProps.get("plumeFlux");

        let plumeSortByFilter = this.props.filters.get(layerSidebarTypes.PLUME_FILTER_SORT_BY);
        let plumeSortBySelectedValue = plumeSortByFilter.getIn(["selectedValue", "value"]);
        let plumeSortBySelectedValueLabel = plumeSortByFilter.getIn(["selectedValue", "label"]);
        let plumeSortByPopperActive = this.popperProps.get("sortBy");

        const dateChipStyles = MiscUtil.generateStringFromSet({
            [styles.chip]: true,
            [displayStyles.hidden]: !this.props.startDate
        });

        return (
            <React.Fragment>
                <label
                    htmlFor="PlumeIdFilter"
                    className={accessibilityStyles.hideExceptForScreenReaders}
                >
                    Filter by Plume ID
                </label>
                <SearchInput
                    icon={<Search />}
                    SearchInputId="PlumeIdFilter"
                    placeholder="Filter by Plume ID"
                    value={plumeIDFilterSelectedValue}
                    disabled={false}
                    onUpdate={valueStr => this.handleSearchInput(valueStr)}
                    validate={valueStr => true}
                    primaryDataTip="Filter by Plume ID"
                    primaryDataPlace="top"
                    actionIcon={<Clear />}
                    onActionIconClick={() => {
                        this.props.setPlumeFilter(layerSidebarTypes.PLUME_FILTER_PLUME_ID, "");
                        this.forceUpdate();
                    }}
                />
                <ClickAwayListener
                    onClickAway={() => {
                        if (
                            plumeFluxPopoverActive ||
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
                                    this.setPopperActive("plumeFlux", !plumeFluxPopoverActive)
                                }
                                onDelete={() => {
                                    this.setPopperActive("plumeFlux", false);
                                    this.props.setPlumeFilter(
                                        layerSidebarTypes.PLUME_FILTER_PLUME_FLUX,
                                        null
                                    );
                                }}
                                label="Plume Emissions"
                                value={
                                    plumeFluxFilterSelectedValueLabel
                                        ? plumeFluxFilterSelectedValueLabel
                                        : null
                                }
                                active={plumeFluxPopoverActive}
                            />
                        </Target>
                        <Popper
                            placement="bottom-start"
                            modifiers={{
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }}
                            eventsEnabled={plumeFluxPopoverActive}
                            className={
                                !plumeFluxPopoverActive ? displayStyles.noPointer : styles.pointer
                            }
                        >
                            <Grow
                                style={{ transformOrigin: "left top" }}
                                in={plumeFluxPopoverActive}
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
                                                    Plume Emissions
                                                </Typography>
                                                <IconButtonSmall
                                                    aria-label="Close Plume Flux Filter Selector"
                                                    color="inherit"
                                                    onClick={() =>
                                                        this.setPopperActive("plumeFlux", false)
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
                                                        layerSidebarTypes.PLUME_FILTER_PLUME_FLUX,
                                                        null
                                                    );
                                                }}
                                                key={"plumeFluxNoValue"}
                                                className={styles.formControlLabel}
                                            >
                                                <Radio
                                                    value={""}
                                                    checked={plumeFluxFilterSelectedValue === null}
                                                    inputProps={{
                                                        "aria-label": "Filter by Any Plume Flux"
                                                    }}
                                                />
                                                <Typography className={styles.radioLabel}>
                                                    Any Plume Flux
                                                </Typography>
                                            </div>
                                            {plumeFluxFilter.get("selectableValues").map(x => (
                                                <div
                                                    onClick={() => {
                                                        this.props.setPlumeFilter(
                                                            layerSidebarTypes.PLUME_FILTER_PLUME_FLUX,
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
                                                            plumeFluxFilterSelectedValue
                                                        }
                                                        inputProps={{
                                                            "aria-label":
                                                                "Filter by flux greater than " +
                                                                x.get("value").toString() +
                                                                " kg per hr (currently " +
                                                                (x.get("value") ===
                                                                plumeFluxFilterSelectedValue
                                                                    ? "checked"
                                                                    : "unchecked") +
                                                                ")"
                                                        }}
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
                        <ChipDropdown
                            className={dateChipStyles}
                            onDelete={() => {
                                this.props.setPlumeDateFilter();
                            }}
                            value={this.props.startDate ? this.props.startDate : ""}
                            label={this.props.startDate ? this.props.startDate : ""}
                            active={true}
                        />
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
                                                Sort By
                                                <Sort />
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
    setPlumeFilter: PropTypes.func.isRequired,
    setPlumeTextFilter: PropTypes.func.isRequired,
    applyPlumeTextFilter: PropTypes.func.isRequired,
    setPlumeDateFilter: PropTypes.func.isRequired,
    startDate: PropTypes.string
};

function mapStateToProps(state) {
    return {
        filters: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "filters"
        ]),
        startDate: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "filters",
            layerSidebarTypes.PLUME_FILTER_PLUME_START_DATE,
            "selectedValue",
            "label"
        ])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setPlumeFilter: bindActionCreators(layerSidebarActions.setPlumeFilter, dispatch),
        setPlumeTextFilter: bindActionCreators(layerSidebarActions.setPlumeTextFilter, dispatch),
        applyPlumeTextFilter: bindActionCreators(
            layerSidebarActions.applyPlumeTextFilter,
            dispatch
        ),
        setPlumeDateFilter: bindActionCreators(layerSidebarActions.setPlumeDateFilter, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumeFiltersContainer);
