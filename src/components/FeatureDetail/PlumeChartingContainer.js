import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
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
import moment from "moment";
import CircularProgress from "@material-ui/core/CircularProgress";

export class PlumeChartingContainer extends Component {
    makeObservationToggle() {
        return (
            <div>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={this.props.plumesWithObservationsOnly}
                                value=""
                                onClick={this.props.togglePlumesWithObservationsOnly}
                            />
                        }
                        label="Show only flyovers containing plume observations"
                    />
                </FormGroup>
            </div>
        );
    }

    getSortedPlumeList() {
        return this.props.plumeList
            .sort((a, b) => {
                const dateA = moment(a.get("plume_date") || a.get("flightline_date"));
                const dateB = moment(b.get("plume_date") || b.get("flightline_date"));
                return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
            })
            .filter(
                plume => (this.props.plumesWithObservationsOnly ? plume.get("candidate_id") : true)
            );
    }

    getChartButtonColor(mode) {
        return this.props.chartMode === mode ? "primary" : "default";
    }

    makeModeSelector() {
        return (
            <div>
                <Button
                    variant="raised"
                    color={this.getChartButtonColor(MSFTypes.PLUME_SOURCES_LIST)}
                    onClick={() => this.props.changeChartingMode(MSFTypes.PLUME_SOURCES_LIST)}
                    size="small"
                >
                    LIST
                </Button>
                <Button
                    variant="raised"
                    color={this.getChartButtonColor(MSFTypes.PLUME_SOURCES_THUMB)}
                    onClick={() => this.props.changeChartingMode(MSFTypes.PLUME_SOURCES_THUMB)}
                    size="small"
                >
                    THUMBNAILS
                </Button>
                <Button
                    variant="raised"
                    color={this.getChartButtonColor(MSFTypes.PLUME_SOURCES_CHART)}
                    onClick={() => this.props.changeChartingMode(MSFTypes.PLUME_SOURCES_CHART)}
                    size="small"
                >
                    CHART
                </Button>
            </div>
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
            case MSFTypes.PLUME_SOURCES_LIST:
                return this.makePlumeList();
            case MSFTypes.PLUME_SOURCES_THUMB:
                return this.makeThumbs();
            case MSFTypes.PLUME_SOURCES_CHART:
                return this.makeChart();
        }
    }

    makePlumeIdText(feature) {
        const plume_id = feature.get("aviris_plume_id");
        if (plume_id === this.props.feature.get("plume_id")) return <strong>{plume_id}</strong>;
        return plume_id;
    }

    makePlumeListItem(feature) {
        const datetime = feature.get("plume_date") || feature.get("flightline_date");
        const dateString = datetime ? moment(datetime).format("M/D/YYYY") : "(No Date)";
        const timeString = datetime ? moment(datetime).format("H:mm") : "";
        const isFlyover = !feature.get("candidate_id");
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
                    <TableCell padding="dense">
                        {dateString}
                        <br />
                        {timeString}
                    </TableCell>
                    <TableCell padding="dense">
                        {isFlyover ? "-" : this.makePlumeIdText(feature)}
                    </TableCell>
                    <TableCell numeric={!isFlyover} padding="dense">
                        {isFlyover ? "-" : "(none)"}
                    </TableCell>
                    <TableCell numeric={!isFlyover} padding="dense">
                        {isFlyover ? "-" : Math.round(feature.get("fetch20")) / 100}
                    </TableCell>
                    <TableCell numeric={!isFlyover} padding="dense">
                        {isFlyover ? "-" : "(none)"}
                    </TableCell>
                    <TableCell numeric={!isFlyover} padding="dense">
                        {isFlyover ? "-" : Math.round(feature.get("ime20") * 100) / 100}
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

        return this.getSortedPlumeList().map(plume => this.makePlumeListItem(plume));
    }

    makePlumeList() {
        return (
            <div className={styles.tableWrapper}>
                <div className={styles.tableScroll}>
                    <Table className={styles.tableContent}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="dense">Plume Detected</TableCell>
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
        if (!this.props.plumeList.length) {
            return <div className={styles.noResults}>No Results</div>;
        }
        return (
            <div className={styles.thumbGrid}>
                <GridList cols={2} spacing={20} cellHeight={464}>
                    {this.getSortedPlumeList()
                        .filter(feature => feature.get("candidate_id"))
                        .map(feature => {
                            const datetime =
                                feature.get("plume_date") || feature.get("flightline_date");
                            const dateString = datetime
                                ? moment(datetime).format("MMMM Do, YYYY, H:mm")
                                : "(No Date)";
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
                                                <span>{`${Math.round(feature.get("ime20") * 100) /
                                                    100} (kg)`}</span>
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
        if (!this.props.plumeList.length) {
            return <div className={styles.noResults}>No Results</div>;
        }
        const options = {
            maintainAspectRatio: false,
            legend: { display: true, position: "bottom", labels: { usePointStyle: true } },
            scales: {
                yAxes: [
                    {
                        scaleLabel: { display: true, labelString: "IME (kg)" }
                    }
                ],
                xAxes: [{ type: "time", ticks: { autoSkip: true, autoSkipPadding: 2 } }]
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, data) => {
                        return `IME: ${tooltipItem.yLabel}, Date: ${tooltipItem.xLabel}`;
                    }
                }
            }
        };

        const sortedData = this.getSortedPlumeList();
        const dataGroups = sortedData.reduce(
            (acc, plume) => {
                if (!plume.get("candidate_id")) {
                    acc.flyovers.push(plume);
                } else {
                    const sourceId = plume.get("sourceId");
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
                            y: key === "flyovers" ? 0 : Math.round(plume.get("ime20") * 100) / 100
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
                            Flyovers of Connected Plume Source:
                            <strong> {this.props.feature.get("source_id")}</strong>
                            <Typography variant="caption">
                                Uncertainty Warning:{" "}
                                <i>
                                    Plume sources are currently identified through a manual process.
                                </i>
                            </Typography>
                        </Typography>
                        <div className={styles.chartHeader}>
                            {this.makeObservationToggle()}
                            {this.makeModeSelector()}
                        </div>
                        {this.makeChartingContent()}
                    </CardContent>
                </Card>
            </Grid>
        );
    }
}

PlumeChartingContainer.propTypes = {
    feature: PropTypes.object.isRequired,
    chartMode: PropTypes.number.isRequired,
    plumesWithObservationsOnly: PropTypes.bool.isRequired,
    plumeList: PropTypes.array,
    plumeListLoading: PropTypes.bool.isRequired,
    changeChartingMode: PropTypes.func.isRequired,
    togglePlumesWithObservationsOnly: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        feature: state.featureDetail.get("feature"),
        chartMode: state.featureDetail.get("plumeChartMode"),
        plumesWithObservationsOnly: state.featureDetail.get("plumesWithObservationsOnly"),
        plumeList: state.featureDetail.get("plumeList"),
        plumeListLoading: state.featureDetail.get("plumeListLoading")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeChartingMode: bindActionCreators(featureDetailActions.changePlumeChartMode, dispatch),
        togglePlumesWithObservationsOnly: bindActionCreators(
            featureDetailActions.togglePlumesWithObservationsOnly,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumeChartingContainer);
