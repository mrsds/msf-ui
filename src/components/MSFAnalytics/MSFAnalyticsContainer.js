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
import PlumeDetectionStatisticsContainer from "components/MSFAnalytics/PlumeDetectionStatisticsContainer";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

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
            case MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS:
                return <PlumeDetectionStatisticsContainer />;
            default:
                return (
                    <Card className={styles.contentCard}>
                        <CardContent>
                            <Typography variant="headline" component="h2">
                                The Suggestiveness Of One Stray Hair In An Otherwise Perfect
                                Coiffure
                            </Typography>
                            <div style={{ whiteSpace: "normal" }}>
                                He's got a car bomb. He puts the key in the ignition and turns it --
                                the car blows up. He gets out. He opens the hood and makes a cursory
                                inspection. He closes the hood and gets back in. He turns the key in
                                the ignition. The car blows up. He gets out and slams the door shut
                                disgustedly. He kicks the tire. He takes off his jacket and shimmies
                                under the chassis. He pokes around. He slides back out and wipes the
                                grease off his shirt. He puts his jacket back on. He gets in. He
                                turns the key in the ignition. The car blows up, sending debris into
                                the air and shattering windows for blocks. He gets out and says,
                                Damn it! He calls a tow truck. He gives them his AAA membership
                                number. They tow the car to an Exxon station. The mechanic gets in
                                and turns the key in the ignition. The car explodes, demolishing the
                                gas pumps, the red-and-blue Exxon logo high atop its pole bursting
                                like a balloon on a string. The mechanic steps out. You got a car
                                bomb, he says. The man rolls his eyes. I know that, he says. <br />
                                <br />- Mark Leyner, <i>My Cousin, My Gasteroenterologist</i>
                            </div>
                        </CardContent>
                    </Card>
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
