import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Divider from "@material-ui/core/Divider";
import InsertChartIcon from "@material-ui/icons/InsertChart";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

import DataFilterContainer from "components/MSFAnalytics/DataFilterContainer";
import EmissionsChartsContainer from "components/MSFAnalytics/EmissionsChartsContainer";
import EmissionsSummaryInfoContainer from "components/MSFAnalytics/EmissionsSummaryInfoContainer";
import DistributionByIPCCSectorContainer from "components/MSFAnalytics/DistributionByIPCCSectorContainer";
import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as MSFTypes from "constants/MSFTypes";
import MiscUtil from "_core/utils/MiscUtil";
import PlumeDetectionStatisticsContainer from "components/MSFAnalytics/PlumeDetectionStatisticsContainer";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";

export class MSFAnalyticsContainer extends Component {
    makeAnalyticsModeListItems() {
        const availableModes = [
            {
                type: MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS,
                title: "Plume Detection Statistics"
            },
            { type: MSFTypes.ANALYTICS_MODE_EMISSIONS_CHARTS, title: "Emissions Charts" },
            {
                type: MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO,
                title: "Emissions Summary Info"
            }
            // {
            //     type: MSFTypes.ANALYTICS_MODE_DISTRIBUTION_BY_SECTOR,
            //     title: "Distribution by Sector"
            // }
        ];
        return availableModes.map(mode => {
            const selected = mode.type === this.props.analyticsMode;
            return (
                <React.Fragment key={mode.type}>
                    <ListItem
                        button
                        onClick={() => this.props.changeAnalyticsMode(mode.type)}
                        classes={{
                            root: selected
                                ? styles.analyticsModeButtonSelected
                                : styles.analyticsModeButton
                        }}
                    >
                        <ListItemText
                            primary={mode.title}
                            classes={{
                                primary: selected
                                    ? styles.analyticsModeButtonTextSelected
                                    : styles.analyticsModeButtonText
                            }}
                        />
                    </ListItem>
                    <Divider />
                </React.Fragment>
            );
        });
    }

    getAnalyticsContent() {
        switch (this.props.analyticsMode) {
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_CHARTS:
                return <EmissionsChartsContainer />;
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO:
                return <EmissionsSummaryInfoContainer />;
            case MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS:
                return <PlumeDetectionStatisticsContainer />;
            case MSFTypes.ANALYTICS_MODE_DISTRIBUTION_BY_SECTOR:
                return <DistributionByIPCCSectorContainer />;
        }
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.flexboxParent]: true,
            [styles.layerSidebar]: true
        });

        return (
            <React.Fragment>
                <Paper elevation={2} square={true} className={containerClasses}>
                    <AppBar elevation={3} position="static" className={styles.appBar}>
                        <div className={styles.headerBar}>
                            <InsertChartIcon>insert_chart</InsertChartIcon>
                            <Typography
                                style={{ color: "white", marginLeft: "5px" }}
                                variant="subheading"
                            >
                                Analytics
                            </Typography>
                        </div>
                        <List className={styles.listRoot}>{this.makeAnalyticsModeListItems()}</List>
                    </AppBar>
                </Paper>
                <Paper elevation={2} square={true} className={styles.analyticsContent}>
                    <DataFilterContainer />
                    {this.getAnalyticsContent()}
                </Paper>
            </React.Fragment>
        );
    }
}

MSFAnalyticsContainer.propTypes = {
    analyticsMode: PropTypes.string.isRequired,
    changeAnalyticsMode: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        analyticsMode: state.MSFAnalytics.get("analyticsMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeAnalyticsMode: bindActionCreators(MSFAnalyticsActions.changeAnalyticsMode, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MSFAnalyticsContainer);
