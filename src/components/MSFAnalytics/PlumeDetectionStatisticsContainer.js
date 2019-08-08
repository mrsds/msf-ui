import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
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

import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import MiscUtilExtended from "utils/MiscUtilExtended";
import * as statsHelperFunctions from "components/MSFAnalytics/statsHelperFunctions";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";

export class PlumeDetectionStatisticsContainer extends Component {
    componentDidMount() {
        if (!this.props.detectionStats) this.props.fetchDetectionStats();
    }

    shouldComponentUpdate(nextProps) {
        return true;
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

    makeTable(stats, filename) {
        stats = stats.map(row => {
            return {
                Sector: row.sector,
                Facilities: row.facilities,
                "Facility Flyovers": row.flyovers,
                "Unique Facilities Flown Over": row.uniqueFacilityCount,
                "Unique Facilities with > 0 Plume Detections": row.uniqueFacilityWithPlumeCount
            };
        });
        MiscUtilExtended.downloadCSV(stats, filename);
    }

    makePerSectorTableBody(stats) {
        return stats.map(sector => (
            <TableRow key={sector.sector}>
                <TableCell padding="dense">
                    {sector.sector.charAt(0) + sector.sector.toLowerCase().slice(1)}
                </TableCell>
                <TableCell pading="dense">{sector.facilities}</TableCell>
                <TableCell pading="dense">{sector.flyovers}</TableCell>
                <TableCell pading="dense">
                    {sector.uniqueFlownOver[0]}
                    <span className={styles.percentage}> ({sector.uniqueFlownOver[1]}%)</span>
                </TableCell>
                <TableCell pading="dense">
                    {sector.uniqueWithPlumes[0]}
                    <span className={styles.percentage}> ({sector.uniqueWithPlumes[1]}%)</span>
                </TableCell>
            </TableRow>
        ));
    }

    makePerSubsectorTableBody(stats) {
        return stats.map(sector => (
            <TableRow key={sector.sector}>
                <TableCell padding="dense">{sector.sector.replace(/^\d{1}.\s/, "")}</TableCell>
                <TableCell pading="dense">{sector.facilities}</TableCell>
                <TableCell pading="dense">{sector.flyovers}</TableCell>
                <TableCell pading="dense">
                    {sector.uniqueFlownOver[0]}
                    <span className={styles.percentage}> ({sector.uniqueFlownOver[1]}%)</span>
                </TableCell>
                <TableCell pading="dense">
                    {sector.uniqueWithPlumes[0]}
                    <span className={styles.percentage}> ({sector.uniqueWithPlumes[1]}%)</span>
                </TableCell>
            </TableRow>
        ));
    }

    makePerSectorSection() {
        const filename = "Methane Plume Detection Rates by Sector";
        const stats = statsHelperFunctions.getStatsBySectorLevel(this.props.detectionStats, 1);
        return (
            <Card className={styles.contentCard}>
                <CardContent>
                    <div className={styles.tableHeader}>
                        <Typography
                            variant="headline"
                            component="h2"
                            classes={{ root: styles.tableTitle }}
                        >
                            Methane Plume Detection Rates by Sector
                        </Typography>
                        <Button size="small" onClick={_ => this.makeTable(stats, filename)}>
                            Download Table
                        </Button>
                    </div>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableScroll}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense">Sector</TableCell>
                                        <TableCell padding="dense">Facilities</TableCell>
                                        <TableCell padding="dense">Facility Flyovers</TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities
                                            <br />
                                            Flown Over
                                        </TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities with
                                            <br />> 0 Plume Detections
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{this.makePerSectorTableBody(stats)}</TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    makePerSubsectorSection() {
        const filename = "Methane Plume Detection Rates by Subsector";
        const stats = statsHelperFunctions.getStatsBySectorLevel(this.props.detectionStats, 2);
        return (
            <Card className={styles.contentCard}>
                <CardContent>
                    <div className={styles.tableHeader}>
                        <Typography variant="headline" component="h2">
                            Methane Plume Detection Rates by Subsector
                        </Typography>
                        <Button size="small" onClick={_ => this.makeTable(stats, filename)}>
                            Download Table
                        </Button>
                    </div>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableScroll}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense">Sector</TableCell>
                                        <TableCell padding="dense">Facilities</TableCell>
                                        <TableCell padding="dense">Facility Flyovers</TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities
                                            <br />
                                            Flown Over
                                        </TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities with
                                            <br />> 0 Plume Detections
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{this.makePerSubsectorTableBody(stats)}</TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    render() {
        return (
            <div>
                {this.makePerSectorSection()}
                {this.makePerSubsectorSection()}
                {this.makeLoadingModal()}
            </div>
        );
    }
}

PlumeDetectionStatisticsContainer.propTypes = {
    detectionStats: PropTypes.array,
    isLoading: PropTypes.bool.isRequired,
    fetchDetectionStats: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        detectionStats: state.MSFAnalytics.get("detectionStats"),
        isLoading: state.MSFAnalytics.get("detectionStatsAreLoading")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchDetectionStats: bindActionCreators(MSFAnalyticsActions.fetchDetectionStats, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlumeDetectionStatisticsContainer);
