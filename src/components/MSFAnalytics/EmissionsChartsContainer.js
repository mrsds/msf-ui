import { Bar as BarChart } from "react-chartjs-2";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import ErrorBarsPlugin from "chartjs-plugin-error-bars";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";

export class EmissionsChartsContainer extends Component {
    componentDidMount() {
        this.props.updateEmissionsCharts();
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
                const avg = source.get("avg_flux", null);
                const uncertainty = source.get("avg_flux_uncertainty", null);
                return {
                    label: `Source near: ${source.get("vista_name")}`,
                    avg,
                    min: avg - uncertainty,
                    max: avg + uncertainty,
                    long: source.get("nearest_vista_longitude", null),
                    lat: source.get("nearest_vista_latitude", null),
                    uncertainty
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
                        scaleLabel: { display: true, labelString: "Emissions (kg/hr)" },
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
                            labelString: "Distribution Percentage"
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
            plugins: {
                chartJsPluginErrorBars: {
                    color: "#000000",
                    lineWidth: "2px",
                    width: 10 | "10px" | "60%"
                }
            },
            onClick: (evt, item) => {
                if (!item.length) return;
                this.props.openMapToInfrastructure(
                    sourceData.find(s => s.label === item[0]._model.label)
                );
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, data) => {
                        const uncertainty = sourceData.find(s => s.label === tooltipItem.xLabel)
                            .uncertainty;
                        const uncertaintyString = (uncertainty && `± ${uncertainty}`) || "";
                        const label = `Emissions: ${tooltipItem.yLabel} ${uncertaintyString}`;
                        return label;
                    }
                },
                backgroundColor: "rgba(0,0,0,1)",
                titleFontColor: "rgba(255,255,255,1)",
                bodyFontColor: "rgba(255,255,255,1)"
            }
        };

        const dataset = {
            label: "emissions",
            yAxisID: "y-axis-0",
            data: sourceData.map(s => s.avg),
            backgroundColor: "rgba(97, 100, 221, 0.66)",
            errorBars: sourceData.reduce((acc, s) => {
                acc[s.label] = { plus: s.max, minus: s.min };
                return acc;
            }, {})
        };

        const totalFlux = sourceData.reduce((acc, s) => acc + s.avg, 0);
        const distributionDataset = {
            label: "distribution",
            data: sourceData
                .reduce((acc, s) => {
                    const val = acc.length ? acc[acc.length - 1] + s.avg : s.avg;
                    acc.push(val);
                    return acc;
                }, [])
                .map(val => val / totalFlux * 100),
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
        const dataBySector = this.props.emissionsSourceData.reduce((acc, source) => {
            const sectorL1Name = source.get("vista_category");
            if (!acc[sectorL1Name]) acc[sectorL1Name] = [];
            acc[sectorL1Name].push(source);
            return acc;
        }, {});

        return (
            <React.Fragment>
                {this.makeChart(
                    this.props.emissionsSourceData.toArray(),
                    "Emission Distribution by Source: All"
                )}
                {Object.keys(dataBySector)
                    .sort(this.sortSectors)
                    .map(key =>
                        this.makeChart(
                            dataBySector[key],
                            `Emission Distribution by Source: ${key.replace(/_/g, " ")}`
                        )
                    )}
            </React.Fragment>
        );
    }

    makeSectorSummaryChart(sector) {
        const sectorData = this.props.emissionsSourceData
            .filter(source => source.get("vista_category") === sector)
            .toArray();

        return <React.Fragment>{this.makeChart(sectorData, sector)}</React.Fragment>;
    }

    makeCharts() {
        if (!this.props.emissionsSourceData || !this.props.emissionsSourceData.size)
            return <div className={styles.noResults}>No sources found</div>;

        const vistaCategory = this.props.filterOptions.get("selectedSector");
        const ipccSector = this.props.filterOptions.get("selectedSubsector");

        if (!vistaCategory && !ipccSector) {
            return this.makeTopLevelSummaryChart();
        }

        const vistaLabel =
            vistaCategory && `Emission Distribution by Source: ${vistaCategory.replace(/_/g, " ")}`;
        const ipccLabel = ipccSector && `Emission Distribution by Source: ${ipccSector}`;
        const chartLabel = `${vistaLabel || ""}${ipccLabel && vistaLabel ? " & " : ""}${ipccLabel ||
            ""}`;
        return (
            <React.Fragment>
                {this.makeChart(this.props.emissionsSourceData.toArray(), chartLabel)}
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
    emissionsSourceData: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    updateEmissionsCharts: PropTypes.func.isRequired,
    filterOptions: PropTypes.object.isRequired,
    openMapToInfrastructure: PropTypes.func.isRequired
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
        ),
        openMapToInfrastructure: bindActionCreators(
            MSFAnalyticsActions.openMapToInfrastructure,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmissionsChartsContainer);
