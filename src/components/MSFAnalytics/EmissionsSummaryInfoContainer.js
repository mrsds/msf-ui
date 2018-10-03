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
import moment from "moment";
import PageControls from "components/MSFAnalytics/PageControls";

const SOURCE_RESULTS_PER_PAGE = 25;

export class EmissionsSummaryInfoContainer extends Component {
    componentDidMount() {
        this.props.updateSummaryPageData();
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

    makeSummaryStat({ name, value }) {
        return (
            <div key={name} className={styles.bigStat}>
                <Typography variant="headline" component="h2">
                    {name}
                </Typography>
                <Typography variant="headline" component="h1">
                    {value}
                </Typography>
            </div>
        );
    }

    makeSummaryContent() {
        if (!this.props.summaryData) return null;
        const valuePairs = [
            { name: "Number of Sources", value: this.props.summaryData.get("number_of_sources") },
            { name: "Number of Plumes", value: this.props.summaryData.get("number_of_plumes") },
            {
                name: "Average Source IME",
                value: `${Math.round(this.props.summaryData.get("average_source_ime") * 100) /
                    100}kg`
            },
            {
                name: "Average Plume Count Per Source",
                value:
                    Math.round(
                        this.props.summaryData.get("average_number_of_plumes_per_source") * 100
                    ) / 100
            }
        ];
        return (
            <Card className={styles.contentCard} key={name}>
                <CardContent className={styles.topLevelContent}>
                    {valuePairs.map(this.makeSummaryStat)}
                </CardContent>
            </Card>
        );
    }

    formatBasicL1SourceName(sourceName) {
        return sourceName.split(/\s/)[1].split(",")[0];
    }

    formatDateStr(dateStr) {
        return moment(dateStr).format("M/D/YYYY");
    }

    makePageControls() {
        return (
            <PageControls
                className={styles.pageControls}
                resultCount={this.props.sourcesData.size}
                currentPageIndex={this.props.sourceStartIndex}
                onPageBackward={this.props.updateSummaryPageSourceIndex}
                onPageForward={this.props.updateSummaryPageSourceIndex}
                resultsPerPage={SOURCE_RESULTS_PER_PAGE}
            />
        );
    }

    makeSourcesTableBody() {
        return this.props.sourcesData
            .slice(
                this.props.sourceStartIndex,
                this.props.sourceStartIndex + SOURCE_RESULTS_PER_PAGE
            )
            .map(source => {
                const sourceId = source.get("source_id");
                const sectorName = this.formatBasicL1SourceName(source.get("sector_level_1"));
                const startDateStr = this.formatDateStr(source.get("first_flyover_date"));
                const endDateStr = this.formatDateStr(source.get("last_flyover_date"));
                const timespan = `${startDateStr} - ${endDateStr}`;
                const avgIme = source.get("avg_ime5_1500ppmm_150m")
                    ? parseFloat(source.get("avg_ime5_1500ppmm_150m")).toFixed(2)
                    : "";
                const minIme = source.get("min_ime5_1500ppmm_150m")
                    ? parseFloat(source.get("min_ime5_1500ppmm_150m")).toFixed(2)
                    : null;
                const maxIme = source.get("max_ime5_1500ppmm_150m")
                    ? parseFloat(source.get("max_ime5_1500ppmm_150m")).toFixed(2)
                    : null;
                const imeRange = minIme && maxIme ? `${minIme} - ${maxIme}` : "";
                return (
                    <TableRow key={sourceId}>
                        <TableCell padding="dense">{sourceId}</TableCell>
                        <TableCell padding="dense">{sectorName}</TableCell>
                        <TableCell padding="dense">{source.get("plume_count")}</TableCell>
                        <TableCell padding="dense">{source.get("flyover_count")}</TableCell>
                        <TableCell padding="dense">{timespan}</TableCell>
                        <TableCell padding="dense">{avgIme}</TableCell>
                        <TableCell padding="dense">{imeRange}</TableCell>
                    </TableRow>
                );
            });
    }

    makeSourcesContent() {
        if (!this.props.sourcesData) return null;
        return (
            <Card className={styles.contentCard}>
                <CardContent className={styles.tableContent}>
                    <Typography variant="headline" component="h2">
                        Methane Plume Sources
                    </Typography>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableScroll}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense">Source ID</TableCell>
                                        <TableCell padding="dense">Sector</TableCell>
                                        <TableCell padding="dense">Plumes</TableCell>
                                        <TableCell padding="dense">Flyovers</TableCell>
                                        <TableCell padding="dense">
                                            Plume Observations Timespan
                                        </TableCell>
                                        <TableCell padding="dense">Avg Plume IME (kg)</TableCell>
                                        <TableCell padding="dense">Plume IME Range (kg)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{this.makeSourcesTableBody()}</TableBody>
                            </Table>
                            {this.makePageControls()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    render() {
        return (
            <React.Fragment>
                {this.makeLoadingModal()}
                {this.makeSummaryContent()}
                {this.makeSourcesContent()}
            </React.Fragment>
        );
    }
}

EmissionsSummaryInfoContainer.propTypes = {
    summaryData: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    updateSummaryPageData: PropTypes.func.isRequired,
    filterOptions: PropTypes.object.isRequired,
    sourcesData: PropTypes.object,
    sourceStartIndex: PropTypes.number.isRequired,
    updateSummaryPageSourceIndex: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        summaryData: state.MSFAnalytics.get("summaryData"),
        isLoading: state.MSFAnalytics.get("summaryDataIsLoading"),
        filterOptions: state.MSFAnalytics.get("filterOptions"),
        sourcesData: state.MSFAnalytics.get("emissionsSourceData"),
        sourceStartIndex: state.MSFAnalytics.get("emissionsSummarySourceStartIndex")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateSummaryPageData: bindActionCreators(
            MSFAnalyticsActions.updateSummaryPageData,
            dispatch
        ),
        updateSummaryPageSourceIndex: bindActionCreators(
            MSFAnalyticsActions.updateSummaryPageSourceIndex,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmissionsSummaryInfoContainer);
