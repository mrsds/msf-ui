import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "components/MSFAnalytics/MSFAnalyticsContainerStyles.scss";
import { connect } from "react-redux";
import MiscUtil from "_core/utils/MiscUtil";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import InsertChartIcon from "@material-ui/icons/InsertChart";
import RadioButtonChecked from "@material-ui/icons/RadioButtonChecked";
import RadioButtonUnchecked from "@material-ui/icons/RadioButtonUnchecked";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { bindActionCreators } from "redux";
import * as MSFAnalyticsActions from "actions/MSFAnalyticsActions";
import * as MSFTypes from "constants/MSFTypes";
import Divider from "@material-ui/core/Divider";
import DataFilterContainer from "components/MSFAnalytics/DataFilterContainer";
import EmissionsSummaryInfoContainer from "components/MSFAnalytics/EmissionsSummaryInfoContainer";

export class MSFAnalyticsContainer extends Component {
    makeAnalyticsModeListItems() {
        const availableModes = [
            {
                type: MSFTypes.ANALYTICS_MODE_DATA_COLLECTION_STATS,
                title: "Data Collection Statistics"
            },
            {
                type: MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS,
                title: "Plume Detection Statistics"
            },
            { type: MSFTypes.ANALYTICS_MODE_EMISSIONS_CHARTS, title: "Emissions Charts" },
            {
                type: MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO,
                title: "Emissions Summary Info"
            }
        ];
        return availableModes.map(mode => {
            const modeIcon =
                mode.type === this.props.analyticsMode ? (
                    <RadioButtonChecked />
                ) : (
                    <RadioButtonUnchecked />
                );
            return (
                <React.Fragment key={mode.type}>
                    <ListItem dense onClick={() => this.props.changeAnalyticsMode(mode.type)}>
                        <ListItemIcon>{modeIcon}</ListItemIcon>
                        <ListItemText primary={mode.title} />
                    </ListItem>
                    <Divider />
                </React.Fragment>
            );
        });
    }

    getAnalyticsContent() {
        switch (this.props.analyticsMode) {
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO:
                return <EmissionsSummaryInfoContainer />;
            default:
                return (
                    <div>
                        “There are moments, Jeeves, when one asks oneself, 'Do trousers matter?'"
                        "The mood will pass, sir.” <i>― P.G. Wodehouse, The Code of the Woosters</i>
                    </div>
                );
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
                    <AppBar elevation={3} position="static" style={{ height: "100%" }}>
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
