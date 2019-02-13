import { Manager, Target, Popper } from "react-popper";
import { Scatter as ScatterChart } from "react-chartjs-2";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import Grow from "@material-ui/core/Grow";
import Immutable from "immutable";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import React, { Component } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import moment from "moment";

import { ClickAwayListener } from "_core/components/Reusables";
import ChipDropdown from "components/Reusables/ChipDropdown";
import * as MSFTypes from "constants/MSFTypes";
import MiscUtilExtended from "utils/MiscUtilExtended";
import PlumeDateFilterControl from "components/FeatureDetail/PlumeDateFilterControl";
import displayStyles from "_core/styles/display.scss";
import * as featureDetailActions from "actions/featureDetailActions";
import featureDetailStyles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";
import styles from "components/FeatureDetail/ChartingContainerStyles.scss";

export class InfrastructureChartingContainer extends Component {
    constructor(props) {
        super(props);
        this.popperProps = Immutable.fromJS({
            plumeSource: false,
            flyovers: false,
            startDate: false,
            endDate: false
        });
    }

    getFilteredPlumeList() {
        return this.props.plumeList
            .filter(
                feature =>
                    !this.props.plumeSourceId ||
                    this.props.plumeSourceId === feature.get("source_id")
            )
            .filter(
                feature =>
                    !this.props.flyoverId ||
                    this.props.flyoverId === feature.get("flightline_id").toString()
            )
            .sort((a, b) => {
                const dateA = moment(a.get("plume_date") || a.get("flightline_date"));
                const dateB = moment(b.get("plume_date") || b.get("flightline_date"));
                return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
            });
    }

    getDateFilteredPlumeList() {
        return this.getFilteredPlumeList()
            .filter(
                feature =>
                    !this.props.plumeFilterStartDate ||
                    moment(
                        feature.get("plume_date") || feature.get("flightline_date")
                    ).isSameOrAfter(this.props.plumeFilterStartDate)
            )
            .filter(
                feature =>
                    !this.props.plumeFilterEndDate ||
                    moment(
                        feature.get("plume_date") || feature.get("flightline_date")
                    ).isSameOrBefore(this.props.plumeFilterEndDate)
            );
    }

    getAvailablePlumeSources() {
        return this.props.plumeList.reduce((acc, feature) => {
            if (feature.get("source_id") && !acc.includes(feature.get("source_id")))
                acc.push(feature.get("source_id"));
            return acc;
        }, []);
    }

    getAvailableFlyovers() {
        return this.props.plumeList.reduce((acc, feature) => {
            const id = feature.get("flightline_id").toString();
            if (!acc.includes(id)) acc.push(id);
            return acc;
        }, []);
    }

    setPopperActive(key, active) {
        this.popperProps = this.popperProps.map((v, k) => (k === key ? active : false));
        this.forceUpdate();
    }

    closeAllPoppers() {
        this.popperProps = this.popperProps.map((v, k) => false);
        this.forceUpdate();
    }

    getChartButtonColor(mode) {
        return this.props.chartMode === mode ? "primary" : "default";
    }

    makeModeSelector() {
        return (
            <div>
                <Button
                    variant="raised"
                    color={this.getChartButtonColor(MSFTypes.INFRASTRUCTURE_SOURCES_LIST)}
                    onClick={() =>
                        this.props.changeChartingMode(MSFTypes.INFRASTRUCTURE_SOURCES_LIST)
                    }
                    size="small"
                >
                    LIST
                </Button>
                <Button
                    variant="raised"
                    color={this.getChartButtonColor(MSFTypes.INFRASTRUCTURE_SOURCES_THUMB)}
                    onClick={() =>
                        this.props.changeChartingMode(MSFTypes.INFRASTRUCTURE_SOURCES_THUMB)
                    }
                    size="small"
                >
                    THUMBNAILS
                </Button>
                <Button
                    variant="raised"
                    color={this.getChartButtonColor(MSFTypes.INFRASTRUCTURE_SOURCES_CHART)}
                    onClick={() =>
                        this.props.changeChartingMode(MSFTypes.INFRASTRUCTURE_SOURCES_CHART)
                    }
                    size="small"
                >
                    CHART
                </Button>
            </div>
        );
    }

    makeFilter(active, label, popperId, currentValue, setFilterFunction, getOptionsFunction) {
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
                                    {getOptionsFunction().map(sourceId => {
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

    getDateRange() {
        return this.getFilteredPlumeList().reduce((range, feature) => {
            const date = moment(feature.get("datetime"));
            range[0] = !range[0] || date.isBefore(range[0]) ? date : range[0];
            range[1] = !range[1] || date.isAfter(range[1]) ? date : range[1];
            return range;
        }, []);
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
                                onClose={() => this.setPopperActive(popperId, false)}
                            />
                        </div>
                    </Grow>
                </Popper>
            </React.Fragment>
        );
    }

    makeFilterPicker() {
        const plumeSourcePickerActive = this.popperProps.get("plumeSource");
        const flyoverPickerActive = this.popperProps.get("flyovers");
        const startDatePickerActive = this.popperProps.get("startDate");
        const endDatePickerActive = this.popperProps.get("endDate");

        return (
            <React.Fragment>
                <Manager className={styles.manager}>
                    <ClickAwayListener
                        onClickAway={() => {
                            if (plumeSourcePickerActive || flyoverPickerActive) {
                                this.closeAllPoppers();
                            }
                        }}
                    >
                        {this.makeFilter(
                            plumeSourcePickerActive,
                            "Plume Source",
                            "plumeSource",
                            this.props.plumeSourceId,
                            this.props.setPlumeSourceFilter,
                            () => this.getAvailablePlumeSources()
                        )}
                        {this.makeFilter(
                            flyoverPickerActive,
                            "Flyovers",
                            "flyovers",
                            this.props.flyoverId,
                            this.props.setFlyoverFilter,
                            () => this.getAvailableFlyovers()
                        )}
                    </ClickAwayListener>
                    {this.makeDateSelector(
                        startDatePickerActive,
                        "From: ",
                        "startDate",
                        this.props.plumeFilterStartDate || this.getDateRange()[0] || moment(),
                        this.getDateRange()[0] || moment(),
                        this.props.plumeFilterEndDate || moment(),
                        this.props.setPlumeFilterStartDate
                    )}
                    {this.makeDateSelector(
                        endDatePickerActive,
                        "To: ",
                        "endDate",
                        this.props.plumeFilterEndDate || this.getDateRange()[1] || moment(),
                        this.props.plumeFilterStartDate || this.getDateRange()[0] || moment(),
                        this.getDateRange()[1] || moment(),
                        this.props.setPlumeFilterEndDate
                    )}
                </Manager>
            </React.Fragment>
        );
    }

    makeChartingContent() {
        if (this.props.plumeListLoading) {
            return (
                <div className={styles.loadingModal}>
                    <CircularProgress />
                </div>
            );
        }

        switch (this.props.chartMode) {
            case MSFTypes.INFRASTRUCTURE_SOURCES_LIST:
                return this.makePlumeList();
            case MSFTypes.INFRASTRUCTURE_SOURCES_THUMB:
                return this.makeThumbs();
            case MSFTypes.INFRASTRUCTURE_SOURCES_CHART:
                return this.makeChart();
        }
    }

    makePlumeListItem(feature) {
        const datetime = feature.get("plume_date") || feature.get("flightline_date");
        const dateString = datetime ? moment(datetime).format("M/D/YYYY") : "(No Date)";
        const timeString = datetime ? moment(datetime).format("H:mm") : "";
        const isFlyover = !feature.get("candidate_id");

        const flux = feature.get("flux") && MiscUtilExtended.roundTo(feature.get("flux"), 2);
        const fluxUncertainty = feature.get("flux_uncertainty")
            ? " ± " + MiscUtilExtended.roundTo(feature.get("flux_uncertainty"), 2)
            : "";
        const fluxString = flux ? flux + fluxUncertainty : "";

        return (
            <React.Fragment
                key={
                    (isFlyover ? dateString + timeString + "flyover" : feature.get("name")) +
                    Math.random()
                        .toString(36)
                        .substring(7)
                }
            >
                <TableRow>
                    <TableCell padding="dense">{isFlyover ? "No" : "Yes"}</TableCell>
                    <TableCell padding="dense">{feature.get("source_id")}</TableCell>
                    <TableCell padding="dense">
                        {dateString}
                        <br />
                        {timeString}
                    </TableCell>
                    <TableCell padding="dense">
                        {isFlyover ? "-" : feature.get("candidate_id")}
                    </TableCell>
                    <TableCell numeric={!isFlyover} padding="dense">
                        {isFlyover ? "-" : "(none)"}
                    </TableCell>
                    <TableCell numeric={!isFlyover} padding="dense">
                        {isFlyover ? "-" : fluxString}
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }

    makePlumeTableBody() {
        const emptyTable = (
            <TableRow>
                <TableCell colSpan="7" className={styles.emptyListCell}>
                    No Results
                </TableCell>
            </TableRow>
        );

        if (!this.props.plumeList || !this.props.plumeList.length) {
            return emptyTable;
        }
        return this.getDateFilteredPlumeList().map(feature => this.makePlumeListItem(feature));
    }

    makePlumeList() {
        return (
            <div className={styles.tableWrapper}>
                <div className={styles.tableScroll}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="dense">Plume Detected</TableCell>
                                <TableCell padding="dense">Source ID</TableCell>
                                <TableCell padding="dense">Flyover Date</TableCell>
                                <TableCell padding="dense">Candidate ID</TableCell>
                                <TableCell numeric padding="dense">
                                    Wind (mph/hr)
                                </TableCell>
                                <TableCell numeric padding="dense">
                                    Emissions (kg/hr)
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.makePlumeTableBody()}</TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    makeThumbs() {
        if (!this.props.plumeList.length) {
            return <div className={styles.noResults}>No Results</div>;
        }
        return (
            <div className={styles.thumbGrid}>
                <GridList cols={2} spacing={20} cellHeight={464}>
                    {this.getDateFilteredPlumeList()
                        .filter(feature => feature.get("candidate_id"))
                        .map(feature => {
                            const datetime =
                                feature.get("plume_date") || feature.get("flightline_date");
                            const dateString = datetime
                                ? moment(datetime).format("MMMM Do, YYYY, H:mm")
                                : "(No Date)";

                            const flux =
                                feature.get("flux") &&
                                MiscUtilExtended.roundTo(feature.get("flux"), 2);
                            const fluxUncertainty = feature.get("flux_uncertainty")
                                ? " ± " +
                                  MiscUtilExtended.roundTo(feature.get("flux_uncertainty"), 2)
                                : "";
                            const fluxString = flux ? flux + fluxUncertainty + " kg/hr" : "";

                            return (
                                <GridListTile
                                    key={
                                        feature.get("name") +
                                        Math.random()
                                            .toString(36)
                                            .substring(7)
                                    }
                                >
                                    <img
                                        src={feature.get("rgbqlctr_url")}
                                        alt={feature.get("name")}
                                    />
                                    <GridListTileBar
                                        title={
                                            <div className={styles.gridTileHeading}>
                                                <span>{dateString}</span>
                                                <span>{fluxString}</span>
                                            </div>
                                        }
                                        subtitle={
                                            <div className={styles.gridTileHeading}>
                                                <span>{feature.get("name")}</span>
                                            </div>
                                        }
                                    />
                                </GridListTile>
                            );
                        })}
                </GridList>
            </div>
        );
    }

    makeChart() {
        if (!this.props.plumeList.length) {
            return <div className={styles.noResults}>No Results</div>;
        }
        const options = {
            maintainAspectRatio: false,
            legend: { display: true, position: "bottom", labels: { usePointStyle: true } },
            scales: {
                yAxes: [
                    {
                        scaleLabel: { display: true, labelString: "Emissions (kg/hr)" }
                    }
                ],
                xAxes: [{ type: "time", ticks: { autoSkip: true, autoSkipPadding: 2 } }]
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, data) => {
                        return `Emissions: ${tooltipItem.yLabel}, Date: ${tooltipItem.xLabel}`;
                    }
                }
            }
        };

        const sortedData = this.getDateFilteredPlumeList();

        const dataGroups = sortedData.reduce(
            (acc, plume) => {
                if (!plume.get("candidate_id")) {
                    acc.flyovers.push(plume);
                } else {
                    const sourceId = plume.get("source_id");
                    acc[sourceId] = acc[sourceId] ? acc[sourceId].concat([plume]) : [plume];
                }
                return acc;
            },
            { flyovers: [] }
        );

        const emptyFlyoverLabel = "Flyover with no plume detected";
        const colorList = ["#1B6087", "#F44242"];
        let colorIndex = 0;
        const datasets = Object.keys(dataGroups)
            .sort((a, b) => (a === "flyovers" ? 1 : b === "flyovers" ? -1 : 0))
            .map((key, idx) => {
                const pointColor = key === "flyovers" ? "#ffffff00" : colorList[colorIndex++];
                return {
                    data: dataGroups[key].map(plume => {
                        return {
                            x: plume.get("plume_date") || plume.get("flightline_date"),
                            y:
                                key === "flyovers"
                                    ? 0
                                    : plume.get("flux")
                                      ? Math.round(plume.get("flux") * 100) / 100
                                      : 0
                        };
                    }),
                    backgroundColor: pointColor,
                    fill: false,
                    label: key === "flyovers" ? emptyFlyoverLabel : `Source: ${key}`,
                    borderColor: key === "flyovers" ? "#404040" : pointColor,
                    borderWidth: 1
                };
            });

        const data = {
            datasets
        };

        return (
            <div className={styles.chartContainer}>
                <ScatterChart data={data} options={options} height={250} redraw={true} />
            </div>
        );
    }

    render() {
        return (
            <Grid item xs>
                <Card className={featureDetailStyles.cardRoot}>
                    <CardContent>
                        <Typography variant="headline" component="h2">
                            Flyovers of:
                            <strong> {this.props.feature.get("name")}</strong>
                            <Typography variant="caption">
                                Uncertainty Warning:
                                <i>Flyovers may not include the entire facility.</i>
                            </Typography>
                        </Typography>
                        <div className={styles.chartHeader}>
                            {this.makeFilterPicker()}
                            {this.makeModeSelector()}
                        </div>
                        {this.makeChartingContent()}
                    </CardContent>
                </Card>
            </Grid>
        );
    }
}

InfrastructureChartingContainer.propTypes = {
    feature: PropTypes.object.isRequired,
    chartMode: PropTypes.number.isRequired,
    plumeList: PropTypes.array,
    plumeListLoading: PropTypes.bool.isRequired,
    plumeSourceId: PropTypes.string,
    flyoverId: PropTypes.string,
    plumeFilterStartDate: PropTypes.object,
    plumeFilterEndDate: PropTypes.object,
    changeChartingMode: PropTypes.func.isRequired,
    setPlumeSourceFilter: PropTypes.func.isRequired,
    setFlyoverFilter: PropTypes.func.isRequired,
    setPlumeFilterStartDate: PropTypes.func.isRequired,
    setPlumeFilterEndDate: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        feature: state.featureDetail.get("feature"),
        chartMode: state.featureDetail.get("infrastructureChartMode"),
        plumeList: state.featureDetail.get("plumeList"),
        plumeSourceId: state.featureDetail.get("plumeSourceId"),
        flyoverId: state.featureDetail.get("flyoverId"),
        plumeListLoading: state.featureDetail.get("plumeListLoading"),
        plumeFilterStartDate: state.featureDetail.get("plumeFilterStartDate"),
        plumeFilterEndDate: state.featureDetail.get("plumeFilterEndDate")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeChartingMode: bindActionCreators(
            featureDetailActions.changeInfrastructureChartMode,
            dispatch
        ),
        setPlumeSourceFilter: bindActionCreators(
            featureDetailActions.setPlumeSourceFilter,
            dispatch
        ),
        setFlyoverFilter: bindActionCreators(featureDetailActions.setFlyoverFilter, dispatch),
        setPlumeFilterStartDate: bindActionCreators(
            featureDetailActions.setPlumeFilterStartDate,
            dispatch
        ),
        setPlumeFilterEndDate: bindActionCreators(
            featureDetailActions.setPlumeFilterEndDate,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InfrastructureChartingContainer);
