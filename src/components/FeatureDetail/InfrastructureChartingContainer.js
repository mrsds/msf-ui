import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import MetadataUtil from "utils/MetadataUtil";
import * as MSFTypes from "constants/MSFTypes";
import * as featureDetailActions from "actions/featureDetailActions";
import featureDetailStyles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";
import styles from "components/FeatureDetail/ChartingContainerStyles.scss";
import { Scatter as ScatterChart } from "react-chartjs-2";
import Immutable from "immutable";
import { Manager, Target, Popper } from "react-popper";
import ChipDropdown from "components/Reusables/ChipDropdown";
import displayStyles from "_core/styles/display.scss";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import { ClickAwayListener } from "_core/components/Reusables";
import Radio from "@material-ui/core/Radio";
import moment from "moment";
import CircularProgress from "@material-ui/core/CircularProgress";
import PlumeDateFilterControl from "components/FeatureDetail/PlumeDateFilterControl";

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
        return this.props.plumeList.filter(
            feature =>
                !this.props.plumeSourceId ||
                this.props.plumeSourceId === feature.getIn(["sourceId", "value"])
        );
    }

    getDateFilteredPlumeList() {
        return this.getFilteredPlumeList()
            .filter(
                feature =>
                    !this.props.plumeFilterStartDate ||
                    moment(feature.get("datetime")).isSameOrAfter(this.props.plumeFilterStartDate)
            )
            .filter(
                feature =>
                    !this.props.plumeFilterEndDate ||
                    moment(feature.get("datetime")).isSameOrBefore(this.props.plumeFilterEndDate)
            );
    }

    getAvailablePlumeSources() {
        return this.props.plumeList.reduce((acc, feature) => {
            const sourceId = feature.getIn(["sourceId", "value"]);
            if (sourceId && !acc.includes(sourceId)) {
                acc.push(sourceId);
            }
            return acc;
        }, []);
    }

    getAvailableFlyovers() {
        return this.props.plumeList.reduce((acc, feature) => {
            const count = feature.get("flyoverCount");
            if (count && !acc.includes(count)) {
                acc.push(count);
            }
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
        const datetime = feature.get("datetime");
        const dateString = datetime ? moment(datetime).format("M/D/YYYY") : "(No Date)";
        const timeString = datetime ? moment(datetime).format("H:mm") : "";
        return (
            <React.Fragment key={feature.get("name")}>
                <TableRow>
                    <TableCell padding="dense">Yes</TableCell>
                    <TableCell padding="dense">
                        {" "}
                        {dateString}
                        <br />
                        {timeString}
                    </TableCell>
                    <TableCell padding="dense">
                        {MetadataUtil.getPlumeID(feature, "(none)")}
                    </TableCell>
                    <TableCell numeric padding="dense">
                        (none)
                    </TableCell>
                    <TableCell numeric padding="dense">
                        {Math.round(MetadataUtil.getFetch(feature, "20", "(none)") * 100) / 100}
                    </TableCell>
                    <TableCell numeric padding="dense">
                        (none)
                    </TableCell>
                    <TableCell numeric padding="dense">
                        {Math.round(MetadataUtil.getIME(feature, "20", "(none)") * 100) / 100}
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
                                <TableCell padding="dense">
                                    Plume<br />Detected
                                </TableCell>
                                <TableCell padding="dense">Flyover Date</TableCell>
                                <TableCell padding="dense">Plume ID</TableCell>
                                <TableCell numeric padding="dense">
                                    Wind (mph/hr)
                                </TableCell>
                                <TableCell numeric padding="dense">
                                    Fetch (m)
                                </TableCell>
                                <TableCell numeric padding="dense">
                                    Flux (kg/hr)
                                </TableCell>
                                <TableCell numeric padding="dense">
                                    IME (kg)
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
        return (
            <div className={styles.thumbGrid}>
                <GridList cols={2} spacing={20} cellHeight={464}>
                    {this.getDateFilteredPlumeList().map(feature => {
                        const datetime = feature.get("datetime");
                        const dateString = datetime
                            ? moment(datetime).format("MMMM Do, YYYY, H:mm")
                            : "(No Date)";
                        return (
                            <GridListTile key={feature.get("name")}>
                                <img src={feature.get("rgbqlctr_url")} alt={feature.get("name")} />
                                <GridListTileBar
                                    title={
                                        <div className={styles.gridTileHeading}>
                                            <span>{dateString}</span>
                                            <span>
                                                {Math.round(feature.get("ime") * 100) / 100} (kg)
                                            </span>
                                        </div>
                                    }
                                    subtitle={
                                        <div className={styles.gridTileHeading}>
                                            <span>{feature.get("name")}</span>
                                            <span>IME</span>
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
        const options = {
            maintainAspectRatio: false,
            legend: { display: false },
            scales: {
                yAxes: [
                    {
                        scaleLabel: { display: true, labelString: "IME (kg)" }
                    }
                ],
                xAxes: [{ type: "time", ticks: { autoSkip: true, autoSkipPadding: 2 } }]
            }
        };

        const sortedData = this.getDateFilteredPlumeList().sort(
            (a, b) => moment(a.get("datetime")).toDate() - moment(b.get("datetime")).toDate()
        );
        const data = {
            labels: sortedData.map(feature => moment(feature.get("datetime")).toDate()),
            datasets: [
                {
                    data: sortedData.map(feature => feature.get("ime")),
                    borderColor: "#4285F4",
                    fill: false
                }
            ]
        };

        return (
            <div className={styles.chartContainer}>
                <ScatterChart data={data} options={options} height={250} />
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
                                Uncertainty Warning:{" "}
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
