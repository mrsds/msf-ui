import { Manager, Target, Popper } from "react-popper";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Check from "@material-ui/icons/Check";
import Checkbox from "@material-ui/core/Checkbox";
import Clear from "@material-ui/icons/Clear";
import CloseIcon from "@material-ui/icons/Close";
import Grow from "@material-ui/core/Grow";
import Immutable from "immutable";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Search from "@material-ui/icons/Search";
import Sort from "@material-ui/icons/SortByAlpha";
import Switch from "@material-ui/core/Switch";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { IconButtonSmall, ClickAwayListener } from "_core/components/Reusables";
import ChipDropdown from "components/Reusables/ChipDropdown";
import MapUtilExtended from "utils/MapUtilExtended";
import SearchInput from "components/Reusables/SearchInput";
import displayStyles from "_core/styles/display.scss";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/MethaneSidebar/FiltersContainerStyles.scss";
import accessibilityStyles from "_core/styles/accessibility.scss";

export class InfrastructureFiltersContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            infrastructureSubcategories: false,
            sortBy: false
        });
    }

    shouldComponentUpdate(nextProps) {
        const filtersChanged = this.props.filters
            .filter((_, k) => k.toLowerCase().startsWith("infrastructure"))
            .some(
                (v, k) => v.get("selectedValue") !== nextProps.filters.getIn([k, "selectedValue"])
            );
        const activeSubCatsChanged = this.props.activeInfrastructureSubCategories.some(
            (v, k) => nextProps.activeInfrastructureSubCategories.get(k) !== v
        );
        return filtersChanged || activeSubCatsChanged;
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
        this.props.setInfraTextFilter(valueStr);
        clearTimeout(this.searchInputTimeout);
        this.searchInputTimeout = setTimeout(_ => this.props.applyInfraTextFilter(), 350);
    }

    clearSearchInput() {
        this.props.setInfraTextFilter("");
        this.props.applyInfraTextFilter();
    }

    render() {
        let infrastructureNameFilter = this.props.filters.get(
            layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME
        );
        let infrastructureNameFilterSelectedValue = infrastructureNameFilter.get("selectedValue");

        let infrastructureSubcategoriesPopoverOpen = this.popperProps.get(
            "infrastructureSubcategories"
        );

        let infrastructureSortByFilter = this.props.filters.get(
            layerSidebarTypes.INFRASTRUCTURE_FILTER_SORT_BY
        );
        let infrastructureSortBySelectedValue = infrastructureSortByFilter.getIn([
            "selectedValue",
            "value"
        ]);
        let infrastructureSortBySelectedValueLabel = infrastructureSortByFilter.getIn([
            "selectedValue",
            "label"
        ]);
        let infrastructureSortByPopperActive = this.popperProps.get("sortBy");

        // Grab only active infra categories
        let activeInfrastructureSubCategories = this.props.activeInfrastructureSubCategories.filter(
            active => active
        );
        let infrastructureSubcategoriesFilterValueLabel =
            activeInfrastructureSubCategories.size > 0
                ? activeInfrastructureSubCategories.size + " Infrastructure Types"
                : null;

        return (
            <React.Fragment>
                <label
                    htmlFor="InfrastructureNameIdFilter"
                    className={accessibilityStyles.hideExceptForScreenReaders}
                >
                    Filter by Infrastructure Name or ID
                </label>
                <SearchInput
                    icon={<Search />}
                    SearchInputId="InfrastructureNameIdFilter"
                    placeholder="Filter by Infrastructure Name/ID"
                    value={infrastructureNameFilterSelectedValue}
                    disabled={false}
                    onUpdate={valueStr => this.handleSearchInput(valueStr)}
                    validate={valueStr => true}
                    primaryDataTip="Filter by Infrastructure Name/ID"
                    primaryDataPlace="top"
                    actionIcon={<Clear />}
                    onActionIconClick={() => this.clearSearchInput()}
                />
                <ClickAwayListener
                    onClickAway={() => {
                        if (
                            infrastructureSubcategoriesPopoverOpen ||
                            infrastructureSortByPopperActive
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
                                    this.setPopperActive(
                                        "infrastructureSubcategories",
                                        !infrastructureSubcategoriesPopoverOpen
                                    )
                                }
                                onDelete={() => {
                                    this.setPopperActive("infrastructureSubcategories", false);
                                    this.props.toggleInfrastructureCategoryFilters(false);
                                }}
                                label="Infrastructure Types"
                                value={
                                    infrastructureSubcategoriesFilterValueLabel ? (
                                        <React.Fragment>
                                            {/* <DomainIcon className={styles.chipLeftIcon} /> */}
                                            {infrastructureSubcategoriesFilterValueLabel}
                                        </React.Fragment>
                                    ) : null
                                }
                                active={infrastructureSubcategoriesPopoverOpen}
                            />
                        </Target>
                        <Popper
                            placement="bottom-start"
                            modifiers={{
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }}
                            eventsEnabled={infrastructureSubcategoriesPopoverOpen}
                            className={
                                !infrastructureSubcategoriesPopoverOpen
                                    ? displayStyles.noPointer
                                    : styles.pointer
                            }
                        >
                            <Grow
                                style={{ transformOrigin: "left top" }}
                                in={infrastructureSubcategoriesPopoverOpen}
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
                                                    Infrastructure Types
                                                </Typography>
                                                <IconButtonSmall
                                                    color="inherit"
                                                    onClick={() =>
                                                        this.setPopperActive(
                                                            "infrastructureSubcategories",
                                                            false
                                                        )
                                                    }
                                                >
                                                    <CloseIcon />
                                                </IconButtonSmall>
                                            </Toolbar>
                                        </AppBar>
                                        <div className={styles.formControl}>
                                            {
                                                <ListItem>
                                                    <ListItemText primary="Select all infrastructure" />
                                                    <ListItemSecondaryAction>
                                                        <Switch
                                                            onChange={() =>
                                                                this.props.toggleInfrastructureCategoryFilters(
                                                                    !(
                                                                        this.props
                                                                            .activeInfrastructureSubCategories
                                                                            .size ===
                                                                        activeInfrastructureSubCategories.size
                                                                    )
                                                                )
                                                            }
                                                            onClick={() =>
                                                                this.props.toggleInfrastructureCategoryFilters(
                                                                    !(
                                                                        this.props
                                                                            .activeInfrastructureSubCategories
                                                                            .size ===
                                                                        activeInfrastructureSubCategories.size
                                                                    )
                                                                )
                                                            }
                                                            checked={
                                                                this.props
                                                                    .activeInfrastructureSubCategories
                                                                    .size ===
                                                                activeInfrastructureSubCategories.size
                                                            }
                                                        />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            }
                                            {Object.keys(
                                                layerSidebarTypes.INFRASTRUCTURE_GROUPS
                                            ).map(group => (
                                                <List
                                                    key={group}
                                                    dense
                                                    subheader={
                                                        <ListSubheader
                                                            className={styles.subheader}
                                                            disableSticky
                                                        >
                                                            {group}
                                                        </ListSubheader>
                                                    }
                                                >
                                                    {layerSidebarTypes.INFRASTRUCTURE_GROUPS[
                                                        group
                                                    ].categories
                                                        .filter(
                                                            category =>
                                                                category !==
                                                                layerSidebarTypes.VISTA_2017_OILGAS_WELLS
                                                        )
                                                        .map(category => {
                                                            const categoryName = MapUtilExtended.getInfrastructureCategoryHumanName(
                                                                category
                                                            );
                                                            const checked =
                                                                this.props.activeInfrastructureSubCategories.get(
                                                                    category
                                                                ) || false;
                                                            return (
                                                                <ListItem
                                                                    key={category}
                                                                    dense
                                                                    button
                                                                    onClick={() =>
                                                                        this.props.updateInfrastructureCategoryFilter(
                                                                            category,
                                                                            !checked
                                                                        )
                                                                    }
                                                                >
                                                                    <Checkbox
                                                                        className={styles.checkbox}
                                                                        checked={checked}
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                    />
                                                                    <ListItemText
                                                                        primary={categoryName}
                                                                    />
                                                                </ListItem>
                                                            );
                                                        })}
                                                </List>
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
                                    this.setPopperActive(
                                        "sortBy",
                                        !infrastructureSortByPopperActive
                                    )
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
                            eventsEnabled={infrastructureSortByPopperActive}
                            style={{ marginTop: "-47px", marginRight: "-16px" }}
                            className={
                                !infrastructureSortByPopperActive
                                    ? displayStyles.noPointer
                                    : styles.pointer
                            }
                        >
                            <Grow
                                style={{ transformOrigin: "right top" }}
                                in={infrastructureSortByPopperActive}
                            >
                                <div>
                                    <Paper elevation={8} className={styles.popoverPaper}>
                                        <List>
                                            <div className={styles.sorterHeader}>
                                                Sort By
                                                <Sort />
                                            </div>
                                            {infrastructureSortByFilter
                                                .get("selectableValues")
                                                .map(x => (
                                                    <ListItem
                                                        dense
                                                        button
                                                        onClick={() => {
                                                            this.props.setInfrastructureFilter(
                                                                layerSidebarTypes.INFRASTRUCTURE_FILTER_SORT_BY,
                                                                x
                                                            );
                                                            this.setPopperActive("sortBy", false);
                                                        }}
                                                        key={x.get("value")}
                                                    >
                                                        <ListItemIcon>
                                                            {x.get("value") ===
                                                            infrastructureSortBySelectedValue ? (
                                                                <Check />
                                                            ) : (
                                                                <span
                                                                    className={styles.blankIcon}
                                                                />
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

InfrastructureFiltersContainer.propTypes = {
    filters: PropTypes.object.isRequired,
    setInfrastructureFilter: PropTypes.func.isRequired,
    updateInfrastructureCategoryFilter: PropTypes.func.isRequired,
    toggleInfrastructureCategoryFilters: PropTypes.func.isRequired,
    activeInfrastructureSubCategories: PropTypes.object.isRequired,
    setInfraTextFilter: PropTypes.func.isRequired,
    applyInfraTextFilter: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        filters: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
            "filters"
        ]),
        activeInfrastructureSubCategories: state.layerSidebar.get(
            "activeInfrastructureSubCategories"
        )
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setInfrastructureFilter: bindActionCreators(
            layerSidebarActions.setInfrastructureFilter,
            dispatch
        ),
        toggleInfrastructureCategoryFilters: bindActionCreators(
            layerSidebarActions.toggleInfrastructureCategoryFilters,
            dispatch
        ),
        updateInfrastructureCategoryFilter: bindActionCreators(
            layerSidebarActions.updateInfrastructureCategoryFilter,
            dispatch
        ),
        setInfraTextFilter: bindActionCreators(layerSidebarActions.setInfraTextFilter, dispatch),
        applyInfraTextFilter: bindActionCreators(layerSidebarActions.applyInfraTextFilter, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InfrastructureFiltersContainer);
