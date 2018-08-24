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

export class PlumeDetectionStatisticsContainer extends Component {
    componentDidMount() {
        this.props.fetchDetectionStats();
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

    getFieldSum(subSectors, field, total) {
        const sum = subSectors.reduce((acc, subSector) => {
            return acc + subSector[field];
        }, 0);
        return [sum, total && (sum / total * 100) | 0];
    }

    makeSectorStats(subSectorList, sector) {
        const subSectors = subSectorList[sector];
        const [facilityCount, _] = this.getFieldSum(subSectors, "facilities");
        const [uniqueFacilityCount, uniqueFacilityPct] = this.getFieldSum(
            subSectors,
            "unique_facilities_flown_over",
            facilityCount
        );
        const [uniqueFacilityWithPlumeCount, uniqueFacilityWithPlumePct] = this.getFieldSum(
            subSectors,
            "unique_facilities_with_plume_detections",
            facilityCount
        );
        return {
            sector,
            facilities: facilityCount,
            flyovers: this.getFieldSum(subSectors, "facility_flyovers")[0],
            uniqueFlownOver: [uniqueFacilityCount, uniqueFacilityPct],
            uniqueWithPlumes: [uniqueFacilityWithPlumeCount, uniqueFacilityWithPlumePct]
        };
    }

    makeSubsectorStats(subSector) {
        const facilityCount = subSector.facilities;
        const uniqueFacilityCount = subSector.unique_facilities_flown_over;
        const uniqueFacilityPct = (uniqueFacilityCount / facilityCount * 100) | 0;
        const uniqueFacilityWithPlumeCount = subSector.unique_facilities_with_plume_detections;
        const uniqueFacilityWithPlumePct = (uniqueFacilityWithPlumeCount / facilityCount * 100) | 0;
        return {
            sector: subSector.sector_level_2,
            facilities: facilityCount,
            flyovers: subSector.facility_flyovers,
            uniqueFlownOver: [uniqueFacilityCount, uniqueFacilityPct],
            uniqueWithPlumes: [uniqueFacilityWithPlumeCount, uniqueFacilityWithPlumePct]
        };
    }

    makePerSectorStats() {
        if (!this.props.detectionStats) return [];

        const sectors = this.props.detectionStats.reduce((acc, subSector) => {
            const sector =
                layerSidebarTypes.IPCC_SECTOR_LEVEL_1_TO_SECTOR[
                    parseInt(subSector.sector_level_1.charAt(0))
                ];
            if (!acc[sector]) {
                acc[sector] = [];
            }
            acc[sector].push(subSector);
            return acc;
        }, {});
        return Object.keys(sectors).map(key => this.makeSectorStats(sectors, key));
    }

    makePerSubsectorStats() {
        if (!this.props.detectionStats) return [];
        return this.props.detectionStats.map(subSector => this.makeSubsectorStats(subSector));
    }

    makePerSectorTableBody() {
        return this.makePerSectorStats().map(sector => (
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

    makePerSubsectorTableBody() {
        return this.makePerSubsectorStats().map(sector => (
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
        return (
            <Card className={styles.contentCard}>
                <CardContent>
                    <Typography variant="headline" component="h2">
                        Methane Plume Detection Rates by Sector
                    </Typography>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableScroll}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense">Sector</TableCell>
                                        <TableCell padding="dense">Facilities</TableCell>
                                        <TableCell padding="dense">Facility Flyovers</TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities<br />Flown Over
                                        </TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities with<br />> 0 Plume Detections
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{this.makePerSectorTableBody()}</TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    makePerSubsectorSection() {
        return (
            <Card className={styles.contentCard}>
                <CardContent>
                    <Typography variant="headline" component="h2">
                        Methane Plume Detection Rates by Subsector
                    </Typography>
                    <div className={styles.tableWrapper}>
                        <div className={styles.tableScroll}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense">Sector</TableCell>
                                        <TableCell padding="dense">Facilities</TableCell>
                                        <TableCell padding="dense">Facility Flyovers</TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities<br />Flown Over
                                        </TableCell>
                                        <TableCell padding="dense">
                                            Unique Facilities with<br />> 0 Plume Detections
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{this.makePerSubsectorTableBody()}</TableBody>
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
