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

    makeChart(sectorData, title) {
        if (!sectorData.data) return <div />;

        const options = {
            scales: {
                xAxes: [{ scaleLabel: { display: false }, ticks: { display: false } }],
                yAxes: [{ scaleLabel: { display: true, labelString: "IME (kg)" } }]
            },
            legend: { display: false },
            plugins: { chartJsPluginErrorBars: { color: "#000000" } }
        };

        const sourceData = sectorData.data
            .map(source => {
                return {
                    label: `Source near: ${source.nearestFacility}`,
                    min: source.imeList.length ? Math.min(...source.imeList) : null,
                    max: source.imeList.length ? Math.max(...source.imeList) : null,
                    avg: source.imeList.length
                        ? source.imeList.reduce((acc, ime) => {
                              return acc + ime;
                          }, 0) / source.imeList.length
                        : 0
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
            <Card className={styles.contentCard} key={sectorData.cat}>
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

    makeSingleSubsector(selectedSubsector) {
        return (
            <React.Fragment>
                {this.makeChart(
                    this.props.summaryData.find(
                        data =>
                            data.cat ===
                            layerSidebarTypes.INFRASTRUCTURE_NAME_TO_TYPE[
                                selectedSubsector.toLowerCase()
                            ]
                    ),
                    selectedSubsector
                )}
            </React.Fragment>
        );
    }

    makeSector(selectedSector) {
        const subsectorsInSector =
            layerSidebarTypes.INFRASTRUCTURE_GROUPS[selectedSector.toLowerCase()].categories;
        return (
            <React.Fragment>
                {this.makeChart(
                    {
                        data: this.props.summaryData.reduce(
                            (acc, subcat) => acc.concat(subcat.data),
                            []
                        )
                    },
                    `All ${selectedSector}`
                )}
                {this.props.summaryData
                    .filter(data => subsectorsInSector.includes(data.cat))
                    .map(subcat =>
                        this.makeChart(
                            subcat,
                            layerSidebarTypes.INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[subcat.cat]
                        )
                    )}
            </React.Fragment>
        );
    }

    makeAllSectors() {
        return (
            <React.Fragment>
                {this.makeChart(
                    {
                        data: this.props.summaryData.reduce(
                            (acc, subcat) => acc.concat(subcat.data),
                            []
                        )
                    },
                    "All"
                )}
                {Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).map(key =>
                    this.makeChart(
                        {
                            data: this.props.summaryData
                                .filter(subcat =>
                                    layerSidebarTypes.INFRASTRUCTURE_GROUPS[
                                        key
                                    ].categories.includes(subcat.cat)
                                )
                                .reduce((acc, subcat) => acc.concat(subcat.data), [])
                        },
                        key.charAt(0).toUpperCase() + key.substr(1)
                    )
                )}
            </React.Fragment>
        );
    }

    makeCharts() {
        if (!this.props.summaryData) return <div />;

        const selectedSubsector = this.props.filterOptions.get("selectedSubsector");
        if (selectedSubsector) {
            return this.makeSingleSubsector(selectedSubsector);
        }

        const selectedSector = this.props.filterOptions.get("selectedSector");
        if (selectedSector) {
            return this.makeSector(selectedSector);
        }

        return this.makeAllSectors();
    }

    render() {
        // Grab summary data if this is the first time this tab has been viewed.
        if (!this.props.summaryData && !this.props.isLoading) {
            this.props.fetchSummaryData();
        }

        return (
            <div>
                {this.makeLoadingModal()}
                {this.makeCharts()}
            </div>
        );
    }
}

EmissionsSummaryInfoContainer.propTypes = {
    summaryData: PropTypes.array,
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
