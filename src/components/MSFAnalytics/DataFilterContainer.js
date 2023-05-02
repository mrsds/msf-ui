import { Button } from "@material-ui/core";
import { Manager, Target, Popper } from "react-popper";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import FileDownloadIcon from "@material-ui/icons/FileDownload";
import Grow from "@material-ui/core/Grow";
import Immutable from "immutable";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import appConfig from "constants/appConfig";
import { ClickAwayListener } from "_core/components/Reusables";
import ChipDropdown from "components/Reusables/ChipDropdown";
import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as MSFTypes from "constants/MSFTypes";
import PlumeDateFilterControl from "components/FeatureDetail/PlumeDateFilterControl";
import displayStyles from "_core/styles/display.scss";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";

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
        this.props.fetchVistaCategoryOptionsList();
        this.props.fetchIpccSectorOptionsList();
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

    getVistaCategories() {
        return this.props.vistaCategoryOptionsList
            ? this.props.vistaCategoryOptionsList.map(c => c.get("category"))
            : [];
    }

    getIpccSectors() {
        return this.props.ipccSectorOptionsList
            ? this.props.ipccSectorOptionsList.reduce((acc, item) => {
                  const sectorName = item.get("sector_level_3");
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
                    style={{ zIndex: 2 }}
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
                                                        {sourceId.replace(/_/g, " ")}
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
                            <PlumeDateFilterControl
                                currentDate={activeDate}
                                earliestDate={earliestDate}
                                latestDate={latestDate}
                                updateDateFunction={updateFunction}
                                onClose={() => {
                                    this.setPopperActive(popperId, false);
                                    this.props.updateActiveAnalyticsTab();
                                }}
                            />
                        </div>
                    </Grow>
                </Popper>
            </React.Fragment>
        );
    }

    makeDownloadButton() {
        const downloadSettings = (_ => {
            switch (this.props.analyticsMode) {
                case MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS:
                    return ["Download original plume lists", appConfig.URLS.plumeListDownload];
                case MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO:
                    return ["Download original source lists", appConfig.URLS.sourceListDownload];
                default:
                    null;
            }
        })();

        if (!downloadSettings) return null;

        const [downloadText, downloadUrl] = downloadSettings;

        return (
            <div className={styles.fabContainer}>
                <Button
                    className={styles.fab}
                    color="inherit"
                    href={downloadUrl}
                    target="_blank"
                    variant="fab"
                >
                    <FileDownloadIcon />
                </Button>
                <span className={styles.fabLabel}>{downloadText}</span>
            </div>
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
            this.props.analyticsMode !== MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS
                ? this.makeDropdown(
                      "Vista Sector",
                      this.props.selectedSector && this.props.selectedSector.replace(/_/g, " "),
                      this.getVistaCategories,
                      this.props.changeSector,
                      "sector",
                      sectorPickerActive
                  )
                : null;
        const subSectorPicker =
            this.props.analyticsMode !== MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS
                ? this.makeDropdown(
                      "IPCC Sector",
                      this.props.selectedSubsector,
                      this.getIpccSectors,
                      this.props.changeSubsector,
                      "subsector",
                      subsectorPickerActive
                  )
                : null;

        // Right now, date pickers are only for plume detection stats mode
        const startDatePicker =
            this.props.analyticsMode === MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS
                ? this.makeDateSelector(
                      startDatePickerActive,
                      "From: ",
                      "startDate",
                      this.props.startDate || moment("2000-01-01"),
                      moment("2000-01-01"),
                      moment(Date.now()),
                      this.props.changeDate.bind(null, true)
                  )
                : null;

        const endDatePicker =
            this.props.analyticsMode === MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS
                ? this.makeDateSelector(
                      endDatePickerActive,
                      "To: ",
                      "endDate",
                      this.props.endDate || moment(Date.now()),
                      this.props.startDate || moment(Date.now()),
                      moment(Date.now()),
                      this.props.changeDate.bind(null, false)
                  )
                : null;

        return (
            <Card className={styles.cardRoot}>
                <CardContent classes={{ root: styles.dataFilterContent }}>
                    <div className={styles.filterLeft}>
                        <Typography
                            variant="headline"
                            component="h2"
                            className={styles.filterHeader}
                        >
                            Data Filters (Note that analytics cover California data only)
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
                                {startDatePicker}
                                {endDatePicker}
                            </ClickAwayListener>
                        </Manager>
                    </div>
                    {this.makeDownloadButton()}
                </CardContent>
            </Card>
        );
    }
}

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
    vistaCategoryOptionsList: PropTypes.object,
    ipccSectorOptionsList: PropTypes.object,
    fetchAreaSearchOptionsList: PropTypes.func.isRequired,
    fetchVistaCategoryOptionsList: PropTypes.func.isRequired,
    fetchIpccSectorOptionsList: PropTypes.func.isRequired,
    changeDate: PropTypes.func.isRequired,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    updateActiveAnalyticsTab: PropTypes.func.isRequired,
    emissionsSourceData: PropTypes.object
};

function mapStateToProps(state) {
    return {
        analyticsMode: state.MSFAnalytics.get("analyticsMode"),
        selectedArea: state.MSFAnalytics.getIn(["filterOptions", "selectedArea"]),
        selectedSector: state.MSFAnalytics.getIn(["filterOptions", "selectedSector"]),
        selectedSubsector: state.MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]),
        selectedUnits: state.MSFAnalytics.getIn(["filterOptions", "selectedUnits"]),
        areaSearchOptionsList: state.MSFAnalytics.get("areaSearchOptionsList"),
        vistaCategoryOptionsList: state.MSFAnalytics.get("vistaCategoryOptionsList"),
        ipccSectorOptionsList: state.MSFAnalytics.get("ipccSectorOptionsList"),
        startDate: state.MSFAnalytics.getIn(["filterOptions", "startDate"]),
        endDate: state.MSFAnalytics.getIn(["filterOptions", "endDate"]),
        emissionsSourceData: state.MSFAnalytics.get("emissionsSourceData")
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
        fetchVistaCategoryOptionsList: bindActionCreators(
            MSFAnalyticsActions.fetchVistaCategoryOptionsList,
            dispatch
        ),
        fetchIpccSectorOptionsList: bindActionCreators(
            MSFAnalyticsActions.fetchIpccSectorOptionsList,
            dispatch
        ),
        changeDate: bindActionCreators(MSFAnalyticsActions.changeDate, dispatch),
        updateActiveAnalyticsTab: bindActionCreators(
            MSFAnalyticsActions.updateActiveAnalyticsTab,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataFilterContainer);
