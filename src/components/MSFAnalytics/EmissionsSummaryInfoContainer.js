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

export class EmissionsSummaryInfoContainer extends Component {
    componentDidMount() {
        this.props.fetchSummaryData();
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
        const options = {
            scales: {
                xAxes: [{ scaleLabel: { display: false }, ticks: { display: false } }],
                yAxes: [{ scaleLabel: { display: true, labelString: "IME (kg)" } }]
            },
            legend: { display: false },
            plugins: { chartJsPluginErrorBars: { color: "#000000" } }
        };

        const sourceData = data
            .map(source => {
                return {
                    label: `Source near: ${source.get("nearest_facility")}`,
                    min: source.get("min_ime5_1500ppmm_150m"),
                    max: source.get("max_ime5_1500ppmm_150m"),
                    avg: source.get("avg_ime5_1500ppmm_150m")
                };
            })
            .sort((a, b) => b.avg - a.avg);

        const dataset = {
            label: "ime",
            data: sourceData.map(s => s.avg),
            backgroundColor: "rgba(97, 100, 221, 0.66)",
            errorBars: sourceData.reduce((acc, s) => {
                acc[s.label] = { plus: s.max, minus: s.min };
                return acc;
            }, {})
        };

        return (
            <Card className={styles.contentCard} key={title}>
                <CardContent>
                    <Typography variant="headline" component="h2">
                        {title}
                    </Typography>
                    <BarChart
                        options={options}
                        data={{ labels: sourceData.map(l => l.label), datasets: [dataset] }}
                        plugins={[ErrorBarsPlugin]}
                    />
                </CardContent>
            </Card>
        );
    }

    makeTopLevelSummaryChart() {
        const dataBySector = this.props.summaryData.reduce((acc, source) => {
            const sectorL1Name = source.get("sector_level_1");
            if (!acc[sectorL1Name]) acc[sectorL1Name] = [];
            acc[sectorL1Name].push(source);
            return acc;
        }, {});

        return (
            <React.Fragment>
                {this.makeChart(this.props.summaryData.toArray(), "All")}
                {Object.keys(dataBySector)
                    .sort(this.sortSectors)
                    .map(key => this.makeChart(dataBySector[key], key))}
            </React.Fragment>
        );
    }

    makeSectorSummaryChart(sector) {
        const sectorData = this.props.summaryData
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
        if (!this.props.summaryData || !this.props.summaryData.size)
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
                    this.props.summaryData
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

EmissionsSummaryInfoContainer.propTypes = {
    summaryData: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    fetchSummaryData: PropTypes.func.isRequired,
    filterOptions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        summaryData: state.MSFAnalytics.get("summaryData"),
        isLoading: state.MSFAnalytics.get("summaryDataIsLoading"),
        filterOptions: state.MSFAnalytics.get("filterOptions")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchSummaryData: bindActionCreators(MSFAnalyticsActions.fetchSummaryData, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmissionsSummaryInfoContainer);
