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

import * as MSFControlActions from "actions/MSFControlActions";
import * as MSFTypes from "constants/MSFTypes";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/MSFControl/MSFControlContainerStyles.scss";

import PleiadesJobSubmissionForm from "components/MSFControl/PleiadesJobSubmissionForm";

export class MSFControlContainer extends Component {
    makeControlModeListItems() {
        const availableModes = [
            {
                type: MSFTypes.CONTROL_MODE_JOB_SUBMISSION,
                title: "Pleiades Job Submission"
            }
        ];
        return availableModes.map(mode => {
            const selected = mode.type === this.props.controlMode;
            return (
                <React.Fragment key={mode.type}>
                    <ListItem
                        button
                        onClick={() => this.props.changeControlMode(mode.type)}
                        classes={{
                            root: selected
                                ? styles.controlModeButtonSelected
                                : styles.controlModeButton
                        }}
                    >
                        <ListItemText
                            primary={mode.title}
                            classes={{
                                primary: selected
                                    ? styles.controlModeButtonTextSelected
                                    : styles.controlModeButtonText
                            }}
                        />
                    </ListItem>
                    <Divider />
                </React.Fragment>
            );
        });
    }

    getControlContent() {
        switch (this.props.controlMode) {
            case MSFTypes.CONTROL_MODE_JOB_SUBMISSION:
                return <PleiadesJobSubmissionForm />;
        }
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.flexboxParent]: true,
            [styles.layerSidebar]: true
        });
        return (
            <React.Fragment>
                <React.Fragment>
                    <Paper elevation={2} square={true} className={containerClasses}>
                        <AppBar elevation={3} position="static" className={styles.appBar}>
                            <div className={styles.headerBar}>
                                <InsertChartIcon>insert_chart</InsertChartIcon>
                                <Typography
                                    style={{ color: "white", marginLeft: "5px" }}
                                    variant="subheading"
                                >
                                    Management Console
                                </Typography>
                            </div>
                            <List className={styles.listRoot}>
                                {this.makeControlModeListItems()}
                            </List>
                        </AppBar>
                    </Paper>
                    <Paper elevation={2} square={true} className={styles.controlContent}>
                        {this.getControlContent()}
                    </Paper>
                </React.Fragment>
            </React.Fragment>
        );
    }
}

MSFControlContainer.propTypes = {
    controlMode: PropTypes.string.isRequired,
    changeControlMode: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        controlMode: state.MSFControl.get("controlMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeControlMode: bindActionCreators(MSFControlActions.changeControlMode, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MSFControlContainer);
