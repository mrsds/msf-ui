import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as layerSidebarActions from "actions/layerSidebarActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import List, {
    ListItem,
    ListSubheader,
    ListItemSecondaryAction,
    ListItemIcon,
    ListItemText
} from "material-ui/List";
import Checkbox from "material-ui/Checkbox";
import Switch from "material-ui/Switch";
import Popover from "material-ui/Popover";
import Paper from "material-ui/Paper";
import Search from "material-ui-icons/Search";
import Sort from "material-ui-icons/SortByAlpha";
import Check from "material-ui-icons/Check";
import Clear from "material-ui-icons/Clear";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import AppBar from "material-ui/AppBar";
import Typography from "material-ui/Typography";
import Toolbar from "material-ui/Toolbar";
import DomainIcon from "mdi-material-ui/Domain";
import CloseIcon from "material-ui-icons/Close";
import { Manager, Target, Popper } from "react-popper";
import ChipDropdown from "components/Reusables/ChipDropdown";
import SearchInput from "components/Reusables/SearchInput";
import styles from "components/MethaneSidebar/FiltersContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import { IconButtonSmall } from "_core/components/Reusables";
import MapUtilExtended from "utils/MapUtilExtended";
import Immutable from "immutable";

export class PlumeFiltersContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            infrastructureSubcategories: false,
            sortBy: false
        });
    }

    shouldComponentUpdate(nextProps) {
        console.log(
            nextProps.activeInfrastructureSubCategories,
            this.props.activeInfrastructureSubCategories
        );
        return (
            (!nextProps.filters.equals(this.props.filters) ||
                !nextProps.activeInfrastructureSubCategories.equals(
                    this.props.activeInfrastructureSubCategories
                )) &&
            !!this.popperProps.find(v => v)
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
        let infrastructureNameFilter = this.props.filters.get(
            layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME
        );
        let infrastructureNameFilterSelectedValue = infrastructureNameFilter.getIn([
            "selectedValue",
            "value"
        ]);

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
                ? activeInfrastructureSubCategories.size + " Active Infrastructure Types"
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
                                                    type="body1"
                                                    color="inherit"
                                                    className={styles.popoverTitle}
                                                >
                                                    Infrastructure Types
                                                </Typography>
                                                <IconButtonSmall
                                                    color="contrast"
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
                                                    ].categories.map(category => {
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
                                                Sort By<Sort />
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
                                                                <span />
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
    setInfrastructureFilter: PropTypes.func.isRequired,
    updateInfrastructureCategoryFilter: PropTypes.func.isRequired,
    toggleInfrastructureCategoryFilters: PropTypes.func.isRequired,
    activeInfrastructureSubCategories: PropTypes.object.isRequired
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
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumeFiltersContainer);
