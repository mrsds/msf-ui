import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";
import Typography from "@material-ui/core/Typography";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { bindActionCreators } from "redux";
import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as MSFTypes from "constants/MSFTypes";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import { Manager, Target, Popper } from "react-popper";
import ChipDropdown from "components/Reusables/ChipDropdown";
import displayStyles from "_core/styles/display.scss";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Radio from "@material-ui/core/Radio";
import Immutable from "immutable";
import { ClickAwayListener } from "_core/components/Reusables";

export class DataFilterContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            area: false,
            sector: false,
            subsector: false,
            startDate: false,
            endDate: false,
            units: false
        });
    }

    componentDidMount() {
        this.props.fetchAreaSearchOptionsList();
        this.props.fetchSectorOptionsList();
    }

    setPopperActive(key, active) {
        this.popperProps = this.popperProps.map((v, k) => (k === key ? active : false));
        this.forceUpdate();
    }

    closeAllPoppers() {
        this.popperProps = this.popperProps.map((v, k) => false);
        this.forceUpdate();
    }

    getAreaList() {
        return this.props.areaSearchOptionsList
            ? this.props.areaSearchOptionsList
                  .map(opt => opt.get("name"))
                  .filter(opt => opt)
                  .toArray()
            : [];
    }

    getSectors() {
        return this.props.sectorOptionsList
            ? this.props.sectorOptionsList.reduce((acc, item) => {
                  const sectorName = item.get("sector_level_1");
                  if (!acc.includes(sectorName)) acc.push(sectorName);
                  return acc;
              }, [])
            : [];
    }

    getSubsectors() {
        return this.props.sectorOptionsList
            ? this.props.sectorOptionsList
                  .filter(
                      item =>
                          !this.props.selectedSector ||
                          item.get("sector_level_1") === this.props.selectedSector
                  )
                  .reduce((acc, item) => {
                      const sectorName = item.get("sector_level_2");
                      if (!acc.includes(sectorName)) acc.push(sectorName);
                      return acc;
                  }, [])
            : [];
    }

    getChartUnits() {
        return ["kg", "mg", "cbgb", "ghg"];
    }

    makeDropdown(label, currentValue, getOptionsFunction, setFilterFunction, popperId, active) {
        return (
            <React.Fragment>
                <Target>
                    <ChipDropdown
                        className={styles.chip}
                        onClick={() => this.setPopperActive(popperId, !active)}
                        onDelete={() => {
                            setFilterFunction(null);
                            this.setPopperActive(popperId, false);
                        }}
                        label={label}
                        active={active}
                        value={currentValue}
                    />
                </Target>
                <Popper
                    placement="bottom-start"
                    modifiers={{
                        computeStyle: {
                            gpuAcceleration: false
                        }
                    }}
                    eventsEnabled={active}
                    className={!active ? displayStyles.noPointer : styles.pointer}
                    style={{ zIndex: 1 }}
                >
                    <Grow style={{ transformOrigin: "left top" }} in={active}>
                        <div>
                            <Paper elevation={8} className={styles.popoverPaper}>
                                <div className={styles.formControl}>
                                    <div
                                        onClick={() => {
                                            setFilterFunction(null);
                                        }}
                                        key={"All"}
                                        className={styles.formControlLabel}
                                    >
                                        <Radio value={""} checked={currentValue === null} />
                                        <Typography className={styles.radioLabel}>All</Typography>
                                    </div>
                                    {getOptionsFunction
                                        .bind(this)()
                                        .map(sourceId => {
                                            return (
                                                <div
                                                    onClick={() => {
                                                        setFilterFunction(sourceId);
                                                    }}
                                                    key={sourceId}
                                                    className={styles.formControlLabel}
                                                >
                                                    <Radio
                                                        value={""}
                                                        checked={
                                                            currentValue !== null &&
                                                            currentValue === sourceId
                                                        }
                                                    />
                                                    <Typography className={styles.radioLabel}>
                                                        {sourceId}
                                                    </Typography>
                                                </div>
                                            );
                                        })}
                                </div>
                            </Paper>
                        </div>
                    </Grow>
                </Popper>
            </React.Fragment>
        );
    }

    makeDateSelector(
        active,
        label,
        popperId,
        activeDate,
        earliestDate,
        latestDate,
        updateFunction
    ) {
        return (
            <React.Fragment>
                <Target
                    style={{
                        display: "inline-block"
                    }}
                >
                    <ChipDropdown
                        className={styles.chip}
                        onClick={() => this.setPopperActive(popperId, !active)}
                        onDelete={() => {
                            this.setPopperActive(popperId, false);
                        }}
                        label={label + activeDate.format("MMM Do, YYYY")}
                        active={active}
                    />{" "}
                </Target>
                <Popper
                    placement="bottom-start"
                    modifiers={{
                        computeStyle: {
                            gpuAcceleration: false
                        }
                    }}
                    eventsEnabled={active}
                    className={!active ? styles.noPointer : styles.pointer}
                >
                    <Grow style={{ transformOrigin: "left top" }} in={active}>
                        <div>
                            <ChartDateFilterControl
                                currentDate={activeDate}
                                earliestDate={earliestDate}
                                latestDate={latestDate}
                                updateDateFunction={updateFunction}
                                onClose={() => this.setPopperActive(popperId, false)}
                            />
                        </div>
                    </Grow>
                </Popper>
            </React.Fragment>
        );
    }

    render() {
        const areaPickerActive = this.popperProps.get("area");
        const sectorPickerActive = this.popperProps.get("sector");
        const subsectorPickerActive = this.popperProps.get("subsector");
        const unitPickerActive = this.popperProps.get("units");
        const startDatePickerActive = this.popperProps.get("startDate");
        const endDatePickerActive = this.popperProps.get("endDate");
        const sectorPicker =
            this.props.analyticsMode === MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO
                ? this.makeDropdown(
                      "Sector",
                      this.props.selectedSector,
                      this.getSectors,
                      this.props.changeSector,
                      "sector",
                      sectorPickerActive
                  )
                : null;
        const subSectorPicker =
            this.props.analyticsMode === MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO
                ? this.makeDropdown(
                      "Subsector",
                      this.props.selectedSubsector,
                      this.getSubsectors,
                      this.props.changeSubsector,
                      "subsector",
                      subsectorPickerActive
                  )
                : null;
        return (
            <Card className={styles.cardRoot}>
                <CardContent>
                    <Typography variant="headline" component="h2">
                        Data Filters
                    </Typography>
                    <Manager className={styles.manager}>
                        <ClickAwayListener
                            onClickAway={() => {
                                if (!startDatePickerActive && !endDatePickerActive) {
                                    this.closeAllPoppers();
                                }
                            }}
                        >
                            {this.makeDropdown(
                                "Area",
                                this.props.selectedArea,
                                this.getAreaList,
                                this.props.changeSelectedArea,
                                "area",
                                areaPickerActive
                            )}
                            {sectorPicker}
                            {subSectorPicker}
                        </ClickAwayListener>
                    </Manager>
                </CardContent>
            </Card>
        );
    }
}

// {this.makeDropdown(
//     "Sector",
//     this.props.selectedSector,
//     this.getSectors,
//     this.props.changeSector,
//     "sector",
//     sectorPickerActive
// )}
// {this.makeDropdown(
//     "Subsector",
//     this.props.selectedSubsector,
//     this.getSubsectors,
//     this.props.changeSubsector,
//     "subsector",
//     subsectorPickerActive
// )}
// {this.makeDropdown(
//     "Units",
//     this.props.selectedUnits,
//     this.getChartUnits,
//     this.props.changeUnits,
//     "units",
//     unitPickerActive
// )}

DataFilterContainer.propTypes = {
    analyticsMode: PropTypes.string,
    selectedArea: PropTypes.string,
    selectedSector: PropTypes.string,
    selectedSubsector: PropTypes.string,
    selectedUnits: PropTypes.string,
    changeSelectedArea: PropTypes.func.isRequired,
    changeSector: PropTypes.func.isRequired,
    changeSubsector: PropTypes.func.isRequired,
    changeUnits: PropTypes.func.isRequired,
    areaSearchOptionsList: PropTypes.object,
    sectorOptionsList: PropTypes.object,
    fetchAreaSearchOptionsList: PropTypes.func.isRequired,
    fetchSectorOptionsList: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        analyticsMode: state.MSFAnalytics.get("analyticsMode"),
        selectedArea: state.MSFAnalytics.getIn(["filterOptions", "selectedArea"]),
        selectedSector: state.MSFAnalytics.getIn(["filterOptions", "selectedSector"]),
        selectedSubsector: state.MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]),
        selectedUnits: state.MSFAnalytics.getIn(["filterOptions", "selectedUnits"]),
        areaSearchOptionsList: state.MSFAnalytics.get("areaSearchOptionsList"),
        sectorOptionsList: state.MSFAnalytics.get("sectorOptionsList")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeSelectedArea: bindActionCreators(
            MSFAnalyticsActions.changeFilterSelectedArea,
            dispatch
        ),
        changeSector: bindActionCreators(MSFAnalyticsActions.changeFilterSector, dispatch),
        changeSubsector: bindActionCreators(MSFAnalyticsActions.changeFilterSubsector, dispatch),
        changeUnits: bindActionCreators(MSFAnalyticsActions.changeFilterUnits, dispatch),
        fetchAreaSearchOptionsList: bindActionCreators(
            MSFAnalyticsActions.fetchAreaSearchOptionsList,
            dispatch
        ),
        fetchSectorOptionsList: bindActionCreators(
            MSFAnalyticsActions.fetchSectorOptionsList,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataFilterContainer);
