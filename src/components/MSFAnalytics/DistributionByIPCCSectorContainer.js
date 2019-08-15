import { HorizontalBar as BarChart } from "react-chartjs-2";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as MSFTypes from "constants/MSFTypes";
import * as statsHelperFunctions from "components/MSFAnalytics/statsHelperFunctions";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";

export class DistributionByIPCCSectorContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { binningMode: MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS, isScaled: false };
    }

    componentDidMount() {
        if (!this.props.emissionsSourceData) this.props.updateEmissionsCharts();
        if (!this.props.detectionStats && this.state.isScaled) this.props.fetchDetectionStats();
    }

    handleChange(name) {
        return event => this.setState({ ...this.state, [name]: event.target.checked });
    }

    makeLoadingModal() {
        if (this.props.isLoading || (this.state.isScaled && this.props.detectionStatsAreLoading)) {
            return (
                <div className={styles.loadingModal}>
                    <CircularProgress />
                </div>
            );
        }
        return <div />;
    }

    getEmissionsStatsBySector(sectorLevel) {
        return this.props.emissionsSourceData.reduce((acc, source) => {
            const emissions = source.get("q_source_final");
            acc[source.get(`sector_level_${sectorLevel}`)] =
                acc[source.get(`sector_level_${sectorLevel}`)] + emissions || emissions;
            return acc;
        }, {});
    }

    getScaledEmissionsStatsBySector(sectorLevel) {
        const totalEmissions = this.props.emissionsSourceData.reduce(
            (acc, source) => acc + source.get("q_source_final"),
            0
        );

        const stats = statsHelperFunctions.getStatsBySectorLevel(
            this.props.detectionStats,
            sectorLevel
        );

        return stats.reduce((acc, sector) => {
            const scaledAmount = sector.uniqueFacilityWithPlumePct * totalEmissions;
            if (scaledAmount) acc[sector.sector] = scaledAmount;
            return acc;
        }, {});
    }

    getOccurrenceStatsBySector(sectorLevel) {
        return this.props.emissionsSourceData.reduce((acc, source) => {
            acc[source.get(`sector_level_${sectorLevel}`)] =
                acc[source.get(`sector_level_${sectorLevel}`)] + 1 || 1;
            return acc;
        }, {});
    }

    makeEmissionsChartForSectorLevel(sectorLevel) {
        if (!this.props.emissionsSourceData) return;

        const title = `IPCC Sector Level ${sectorLevel}`;
        const scaleLabel =
            this.state.binningMode === MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS
                ? "Emissions"
                : "Occurrences";

        const data =
            this.state.binningMode === MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS
                ? this.state.isScaled
                  ? this.getScaledEmissionsStatsBySector(sectorLevel)
                  : this.getEmissionsStatsBySector(sectorLevel)
                : this.getOccurrenceStatsBySector(sectorLevel);

        if (!Object.keys(data).length) return null;

        const rankedData = Object.entries(data).sort(
            ([sectorA, avgA], [sectorB, avgB]) => avgB - avgA
        );

        const options = {
            legend: { display: false },
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: scaleLabel
                        },
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            suggestedMax: rankedData[0][1]
                        }
                    }
                ],
                yAxes: [{ scaleLabel: { display: false } }]
            }
        };

        const dataset = {
            label: scaleLabel,
            yAxisID: "y-axis-0",
            data: rankedData.map(([_, val]) => val),
            backgroundColor: "rgba(97, 100, 221, 0.66)"
        };

        return (
            <Card className={[styles.contentCard, styles.contentCardFixed].join(" ")} key={title}>
                <CardContent>
                    <Typography variant="headline" component="h2">
                        {title}
                    </Typography>
                    <BarChart
                        options={options}
                        data={{
                            labels: rankedData.map(([sector]) => sector),
                            datasets: [dataset]
                        }}
                    />
                </CardContent>
            </Card>
        );
    }

    makeModeButtons() {
        return (
            <Card className={[styles.contentCard, styles.contentCardFixed].join(" ")}>
                <CardContent>
                    {MSFTypes.SECTOR_DISTRIBUTION_MODES.map(mode => (
                        <Button
                            key={mode.key}
                            onClick={_ => this.setState({ binningMode: mode.key })}
                            variant={this.state.binningMode === mode.key ? "raised" : "outlined"}
                            color="primary"
                        >
                            {mode.title}
                        </Button>
                    ))}
                    <FormGroup className={styles.scalingSwitch}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.isScaled}
                                    onChange={this.handleChange("isScaled")}
                                    value="isScaled"
                                    inputProps={{ "aria-label": "secondary checkbox" }}
                                    disabled={
                                        this.state.binningMode !==
                                        MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS
                                    }
                                />
                            }
                            label="Scaled by Coverage"
                        />
                    </FormGroup>
                </CardContent>
            </Card>
        );
    }

    render() {
        return (
            <div>
                {this.makeLoadingModal()}
                {this.makeModeButtons()}
                {[1, 2, 3].map(idx => this.makeEmissionsChartForSectorLevel(idx))}
            </div>
        );
    }
}

DistributionByIPCCSectorContainer.propTypes = {
    emissionsSourceData: PropTypes.object,
    isLoading: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        emissionsSourceData: state.MSFAnalytics.get("emissionsSourceData"),
        isLoading: state.MSFAnalytics.get("emissionsSourceDataIsLoading"),
        filterOptions: state.MSFAnalytics.get("filterOptions"),
        detectionStats: state.MSFAnalytics.get("detectionStats"),
        detectionStatsAreLoading: state.MSFAnalytics.get("detectionStatsAreLoading")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateEmissionsCharts: bindActionCreators(
            MSFAnalyticsActions.updateEmissionsCharts,
            dispatch
        ),
        fetchDetectionStats: bindActionCreators(MSFAnalyticsActions.fetchDetectionStats, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributionByIPCCSectorContainer);
