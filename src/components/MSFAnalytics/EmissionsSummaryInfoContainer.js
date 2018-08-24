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

    render() {
        return (
            <React.Fragment>
                {this.makeLoadingModal()}
                {this.makeSummaryContent()}
            </React.Fragment>
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
