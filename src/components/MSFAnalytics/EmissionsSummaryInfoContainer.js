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
import moment from "moment";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Button from "@material-ui/core/Button";
import MiscUtilExtended from "utils/MiscUtilExtended";
import layerSidebarStyles from "components/MethaneSidebar/LayerSidebarContainerStyles.scss";
import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import PageControls from "components/MSFAnalytics/PageControls";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";
import * as mapActionsExtended from "actions/mapActions";

const SOURCE_RESULTS_PER_PAGE = 25;

export class EmissionsSummaryInfoContainer extends Component {
    componentDidMount() {
        this.props.updateSummaryPageData();
    }

    sortSectors(a, b) {
        return parseInt(a.charAt(0)) - parseInt(b.charAt(0));
    }

    makeLoadingModal() {
        if (this.props.isLoading || this.props.sourcesLoading) {
            return (
                <div className={styles.loadingModal}>
                    <CircularProgress />
                </div>
            );
        }
        return <div />;
    }

    makeTable(stats, filename) {
        // console.log(stats);
        // stats = stats.map(row => {
        //     return {
        //         Sector: row.sector,
        //         Facilities: row.facilities,
        //         "Facility Flyovers": row.flyovers,
        //         "Unique Facilities Flown Over": row.uniqueFacilityCount,
        //         "Unique Facilities with > 0 Plume Detections": row.uniqueFacilityWithPlumeCount
        //     };
        // });
        MiscUtilExtended.downloadCSV(stats, filename);
        this.props.emissionsSummaryDownloadRequested();
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
        const summaryData = this.props.summaryData.get(0);

        const valuePairs = [
            { name: "Number of Sources", value: summaryData.get("number_of_sources") },
            {
                name: "Average Emissions",
                value: `${Math.round(summaryData.get("avg_q_source_final") * 100) /
                    100} ± ${Math.round(summaryData.get("avg_q_source_final_sigma") * 100) /
                    10} kg/hr`
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

    formatBasicL3SourceName(sourceName) {
        return sourceName
            .split(/\s/)
            .splice(1)
            .join(" ");
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
                const vistaName = source.get("vista_name");
                const vistaCategory = source.get("vista_category").replace(/_/g, " ");
                const ipccSectorName = source.get("sector_level_3");
                const startDateStr = this.formatDateStr(source.get("first_flyover_date"));
                const endDateStr = this.formatDateStr(source.get("last_flyover_date"));
                // const timespan = `${startDateStr} - ${endDateStr}`;
                const avgFlux =
                    source.get("q_source_final") &&
                    parseFloat(source.get("q_source_final")).toFixed(2);
                const fluxUncertainty = parseFloat(source.get("q_source_final_sigma")).toFixed(1);
                const fluxString = avgFlux
                    ? `${avgFlux} ${fluxUncertainty ? " ± " + fluxUncertainty : ""}`
                    : "";
                const persistence = source.get("source_persistence");
                const lat = source.get("source_latitude");
                const long = source.get("source_longitude");
                const confidence = source.get("confidence_in_persistence");

                return (
                    <TableRow key={sourceId}>
                        <TableCell padding="dense">
                            <div
                                className={styles.locationCol}
                                onClick={_ => this.props.openMapToLatLong(lat, long)}
                            >
                                {sourceId}
                                <LocationOnIcon
                                    classes={{ root: styles.locationIcon }}
                                    fontSize="small"
                                />
                            </div>
                        </TableCell>
                        <TableCell padding="dense">
                            {vistaName}
                            <br />
                            <Typography
                                className={layerSidebarStyles.listItemTextSecondary}
                                variant="caption"
                                noWrap
                            >
                                {vistaCategory}
                            </Typography>
                        </TableCell>
                        <TableCell padding="dense">{ipccSectorName}</TableCell>
                        <TableCell padding="dense">{source.get("flyover_count")}</TableCell>
                        <TableCell padding="dense">{persistence}</TableCell>
                        <TableCell padding="dense">{confidence}</TableCell>
                        <TableCell padding="dense">{fluxString}</TableCell>
                    </TableRow>
                );
            });
    }

    makeSourcesContent() {
        if (!this.props.sourcesData) return null;
        const filename = "Methane Plume Sources";
        return (
            <Card className={styles.contentCard}>
                <CardContent>
                    <div className={styles.tableHeader}>
                        <Typography
                            variant="headline"
                            component="h2"
                            classes={{ root: styles.tableTitle }}
                        >
                            Methane Plume Sources
                        </Typography>
                    </div>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableScroll}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense">Source ID</TableCell>
                                        <TableCell padding="dense">Vista Name</TableCell>
                                        <TableCell padding="dense">IPCC Sector</TableCell>
                                        <TableCell padding="dense">Flyovers</TableCell>
                                        <TableCell padding="dense">Persistence</TableCell>
                                        <TableCell padding="dense">
                                            Confidence in
                                            <br />
                                            Persistence
                                        </TableCell>
                                        <TableCell padding="dense">Avg Emissions (kg/hr)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{this.makeSourcesTableBody()}</TableBody>
                            </Table>
                        </div>
                        {this.makePageControls()}
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
    updateSummaryPageSourceIndex: PropTypes.func.isRequired,
    openMapToLatLong: PropTypes.func.isRequired,
    sourcesLoading: PropTypes.bool.isRequired,
    emissionsSummaryDownloadRequested: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        summaryData: state.MSFAnalytics.get("summaryData"),
        isLoading: state.MSFAnalytics.get("summaryDataIsLoading"),
        filterOptions: state.MSFAnalytics.get("filterOptions"),
        sourcesData: state.MSFAnalytics.get("emissionsSourceData"),
        sourceStartIndex: state.MSFAnalytics.get("emissionsSummarySourceStartIndex"),
        sourcesLoading: state.MSFAnalytics.get("emissionsSourceDataIsLoading")
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
        ),
        openMapToLatLong: bindActionCreators(mapActionsExtended.openMapToLatLong, dispatch),
        emissionsSummaryDownloadRequested: bindActionCreators(
            MSFAnalyticsActions.emissionsSummaryDownloadRequested,
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmissionsSummaryInfoContainer);
