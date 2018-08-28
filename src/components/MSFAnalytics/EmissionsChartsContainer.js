import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { bindActionCreators } from "redux";
import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as MSFTypes from "constants/MSFTypes";
import CircularProgress from "@material-ui/core/CircularProgress";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import { Bar as BarChart } from "react-chartjs-2";
import ErrorBarsPlugin from "chartjs-plugin-error-bars";

export class EmissionsChartsContainer extends Component {
    componentDidMount() {
        this.props.fetchEmissionsChartsData();
    }

    sortSectors(a, b) {
        return parseInt(a.charAt(0)) - parseInt(b.charAt(0));
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

    makeChart(data, title) {
        if (!data.length) return;

        const sourceData = data
            .map(source => {
                return {
                    label: `Source near: ${source.get("nearest_facility")}`,
                    min: source.get("min_ime5_1500ppmm_150m", null),
                    max: source.get("max_ime5_1500ppmm_150m", null),
                    avg: source.get("avg_ime5_1500ppmm_150m", null)
                };
            })
            .filter(s => s.min !== null && s.max !== null && s.avg !== null)
            .sort((a, b) => b.avg - a.avg);

        const options = {
            scales: {
                xAxes: [{ scaleLabel: { display: false }, ticks: { display: false } }],
                yAxes: [
                    {
                        id: "y-axis-0", // Have to use this naming scheme else ErrorBar plugin breaks
                        scaleLabel: { display: true, labelString: "IME (kg)" },
                        position: "left",
                        type: "linear",
                        ticks: {
                            // min: 0,
                            // max: sourceData.reduce((acc, s) => (s.avg > acc ? s.avg : acc), 0)
                        }
                    },
                    {
                        id: "y-axis-1",
                        scaleLabel: {
                            display: true,
                            labelString: "Distibution Percentage"
                        },
                        ticks: {
                            display: true
                            // min: 0,
                            // max: sourceData.reduce((acc, s) => acc + s.avg, 0)
                        },
                        gridLines: { display: false, drawBorder: true },
                        position: "right",
                        type: "linear"
                    }
                ]
            },
            legend: { display: false },
            plugins: { chartJsPluginErrorBars: { color: "#000000" } },
            onClick: (evt, item) => {
                if (!item.length) return;
                this.props.openMapToInfrastructure(
                    sourceData
                        .find(s => s.label === item[0]._model.label)
                        .label.replace("Source near: ", "")
                );
            }
        };

        const dataset = {
            label: "ime",
            yAxisID: "y-axis-0",
            data: sourceData.map(s => s.avg),
            backgroundColor: "rgba(97, 100, 221, 0.66)",
            errorBars: sourceData.reduce((acc, s) => {
                acc[s.label] = { plus: s.max, minus: s.min };
                return acc;
            }, {})
        };

        const totalIme = sourceData.reduce((acc, s) => acc + s.avg, 0);
        const distributionDataset = {
            label: "distribution",
            data: sourceData
                .reduce((acc, s) => {
                    const val = acc.length ? acc[acc.length - 1] + s.avg : s.avg;
                    acc.push(val);
                    return acc;
                }, [])
                .map(val => val / totalIme * 100),
            type: "line",
            yAxisID: "y-axis-1",
            fill: false,
            borderColor: "#000000",
            pointRadius: 0,
            borderWidth: 1
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
                            labels: sourceData.map(l => l.label),
                            datasets: [dataset, distributionDataset]
                        }}
                        plugins={[ErrorBarsPlugin]}
                    />
                </CardContent>
            </Card>
        );
    }

    makeTopLevelSummaryChart() {
        const dataBySector = this.props.emissionsChartsData.reduce((acc, source) => {
            const sectorL1Name = source.get("sector_level_1");
            if (!acc[sectorL1Name]) acc[sectorL1Name] = [];
            acc[sectorL1Name].push(source);
            return acc;
        }, {});

        return (
            <React.Fragment>
                {this.makeChart(this.props.emissionsChartsData.toArray(), "All")}
                {Object.keys(dataBySector)
                    .sort(this.sortSectors)
                    .map(key => this.makeChart(dataBySector[key], key))}
            </React.Fragment>
        );
    }

    makeSectorSummaryChart(sector) {
        const sectorData = this.props.emissionsChartsData
            .filter(source => source.get("sector_level_1") === sector)
            .toArray();
        const subSectors = sectorData.reduce((acc, source) => {
            const sectorL2Name = source.get("sector_level_2");
            if (!acc[sectorL2Name]) acc[sectorL2Name] = [];
            acc[sectorL2Name].push(source);
            return acc;
        }, {});

        return (
            <React.Fragment>
                {this.makeChart(sectorData, sector)}
                {Object.keys(subSectors)
                    .sort(this.sortSectors)
                    .map(key => this.makeChart(subSectors[key], key))}
            </React.Fragment>
        );
    }

    makeCharts() {
        if (!this.props.emissionsChartsData || !this.props.emissionsChartsData.size)
            return <div>No sources found</div>;

        const selectedSector = this.props.filterOptions.get("selectedSector");
        const selectedSubsector = this.props.filterOptions.get("selectedSubsector");

        if (!selectedSector) {
            return this.makeTopLevelSummaryChart();
        }

        if (!selectedSubsector) {
            return this.makeSectorSummaryChart(selectedSector);
        }

        return (
            <React.Fragment>
                {this.makeChart(
                    this.props.emissionsChartsData
                        .filter(source => source.get("sector_level_2") === selectedSubsector)
                        .toArray(),
                    selectedSubsector
                )}
            </React.Fragment>
        );
    }

    render() {
        return (
            <div>
                {this.makeLoadingModal()}
                {this.makeCharts()}
            </div>
        );
    }
}

EmissionsChartsContainer.propTypes = {
    emissionsChartsData: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    fetchEmissionsChartsData: PropTypes.func.isRequired,
    filterOptions: PropTypes.object.isRequired,
    openMapToInfrastructure: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        emissionsChartsData: state.MSFAnalytics.get("emissionsChartsData"),
        isLoading: state.MSFAnalytics.get("emissionsChartsDataIsLoading"),
        filterOptions: state.MSFAnalytics.get("filterOptions")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchEmissionsChartsData: bindActionCreators(
            MSFAnalyticsActions.fetchEmissionsChartsData,
            dispatch
        ),
        openMapToInfrastructure: bindActionCreators(
            MSFAnalyticsActions.openMapToInfrastructure,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmissionsChartsContainer);
