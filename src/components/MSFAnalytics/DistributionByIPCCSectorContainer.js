import { HorizontalBar as BarChart } from "react-chartjs-2";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import MiscUtilExtended from "utils/MiscUtilExtended";

import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";
import * as MSFTypes from "constants/MSFTypes";

export class DistributionByIPCCSectorContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { binningMode: MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS };
    }

    componentDidMount() {
        this.props.updateEmissionsCharts();
    }

    makeLoadingModal() {
        if (this.props.isLoading) {
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

    getOccurrenceStatsBySector(sectorLevel) {
        return this.props.emissionsSourceData.reduce((acc, source) => {
            acc[source.get(`sector_level_${sectorLevel}`)] =
                acc[source.get(`sector_level_${sectorLevel}`)] + 1 || 1;
            return acc;
        }, {});
    }

    makeEmissionsChartForSectorLevel(sectorLevel) {
        if (!this.props.emissionsSourceData) return;

        const scaleLabel =
            this.state.binningMode === MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS
                ? "Emissions"
                : "Occurrences";

        const options = {
            legend: { display: false },
            scales: {
                xAxes: [{ scaleLabel: { display: true, labelString: scaleLabel } }],
                yAxes: [{ scaleLabel: { display: false } }]
            }
        };

        const title = `IPCC Sector Level ${sectorLevel}`;
        const data =
            this.state.binningMode === MSFTypes.SECTOR_DISTRIBUTION_MODE_EMISSIONS
                ? this.getEmissionsStatsBySector(sectorLevel)
                : this.getOccurrenceStatsBySector(sectorLevel);
        const rankedData = Object.entries(data).sort(
            ([sectorA, avgA], [sectorB, avgB]) => avgB - avgA
        );

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
        filterOptions: state.MSFAnalytics.get("filterOptions")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateEmissionsCharts: bindActionCreators(
            MSFAnalyticsActions.updateEmissionsCharts,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributionByIPCCSectorContainer);
