import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { FormGroup, FormControlLabel } from "material-ui/Form";
import Checkbox from "material-ui/Checkbox";
import Switch from "material-ui/Switch";
import Grid from "material-ui/Grid";
import GridList, { GridListTile, GridListTileBar } from "material-ui/GridList";
import Card, { CardActions, CardContent, CardMedia } from "material-ui/Card";
import Typography from "material-ui/Typography";
import Table, { TableBody, TableCell, TableHead, TableRow } from "material-ui/Table";
import Button from "material-ui/Button";
import MetadataUtil from "utils/MetadataUtil";
import * as MSFTypes from "constants/MSFTypes";
import * as featureDetailActions from "actions/featureDetailActions";
import featureDetailStyles from "components/FeatureDetail/FeatureDetailContainerStyles.scss";
import styles from "components/FeatureDetail/ChartingContainerStyles.scss";
import { Line as LineChart } from "react-chartjs-2";
import moment from "moment";
import { CircularProgress } from "material-ui/Progress";
import PlumeDateFilterControl from "components/FeatureDetail/PlumeDateFilterControl";

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

    makePlumeListItem(feature) {
        const datetime = feature.get("datetime");
        const dateString = datetime
            ? moment(datetime).format("MMMM Do, YYYY, H:mm [UTC]")
            : "(No Date)";
        return (
            <React.Fragment key={feature.get("name")}>
                <TableRow>
                    <TableCell>Maybe?</TableCell>
                    <TableCell>{dateString}</TableCell>
                    <TableCell>{MetadataUtil.getPlumeID(feature, "(none)")}</TableCell>
                    <TableCell numeric>(none)</TableCell>
                    <TableCell numeric>{MetadataUtil.getFetch(feature, "20", "(none)")}</TableCell>
                    <TableCell numeric>(none)</TableCell>
                    <TableCell numeric>{MetadataUtil.getIME(feature, "20", "(none)")}</TableCell>
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
        return this.props.plumeList.map(feature => this.makePlumeListItem(feature));
    }

    makePlumeList() {
        return (
            <div className={styles.tableWrapper}>
                <div className={styles.tableScroll}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Plume Detected</TableCell>
                                <TableCell>Flyover Date</TableCell>
                                <TableCell>Plume ID</TableCell>
                                <TableCell numeric>Wind (mph/hr)</TableCell>
                                <TableCell numeric>Fetch (m)</TableCell>
                                <TableCell numeric>Flux (kg/hr)</TableCell>
                                <TableCell numeric>IME (kg)</TableCell>
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
            <GridList cols={2} spacing={20} cellHeight={464}>
                {this.props.plumeList.map(feature => {
                    const datetime = feature.get("datetime");
                    const dateString = datetime
                        ? moment(datetime).format("MMMM Do, YYYY, H:mm [UTC]")
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
                xAxes: [{ ticks: { autoSkip: false } }]
            }
        };

        const data = {
            labels: this.props.plumeList.map(feature =>
                moment(feature.get("datetime")).format("MMMM Do, YYYY, H:mm [UTC]")
            ),
            datasets: [
                {
                    data: this.props.plumeList.map(feature => feature.get("ime")),
                    borderColor: "#4285F4"
                }
            ]
        };

        return (
            <div className={styles.chartContainer}>
                <LineChart data={data} options={options} height={250} />
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
                            <strong> {this.props.feature.getIn(["sourceId", "value"])}</strong>
                            <Typography variant="caption">
                                Uncertainty Warning:
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
