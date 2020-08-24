import { Bar as BarChart } from "react-chartjs-2";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import ErrorBarsPlugin from "chartjs-plugin-error-bars";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import MiscUtilExtended from "utils/MiscUtilExtended";
import Input from "@material-ui/core/Input";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";

import styles from "components/MSFControl/PleiadesJobSubmissionFormStyles.scss";
import * as MSFControlActions from "actions/MSFControlActions";
import Immutable from "immutable";
import * as appStrings from "constants/appStrings";

export class PleiadesJobSubmissionForm extends Component {
    constructor(props) {
        super(props);
    }

    handleOwnerChange(value) {
        this.props.changeOwner(value);
    }

    handleTagChange(value) {
        this.props.changeTag(value);
    }

    handleLatResChange(value) {
        this.props.changeLatRes(value);
    }

    handleLonResChange(value) {
        this.props.changeLonRes(value);
    }

    handleLatLLChange(value) {
        this.props.changeLatLL(value);
    }

    handleLonLLChange(value) {
        this.props.changeLonLL(value);
    }

    handleNumPixXChange(value) {
        this.props.changeNumPixX(value);
    }

    handleNumPixYChange(value) {
        this.props.changeNumPixY(value);
    }

    handleNumParChange(value) {
        this.props.changeNumPar(value);
    }

    handleNhrsChange(value) {
        this.props.changeNhrs(value);
    }

    render() {
        return (
            <div className={styles.jobFormContainer}>
                <h1>Pleiades Job Submission</h1>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_OWNER_ID}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleOwnerChange(evt.target.value)}
                        value={this.props.jobowner}
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_OWNER_ID}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_JOB_TAG}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleTagChange(evt.target.value)}
                        value={this.props.jobtag}
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_JOB_TAG}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LONRES}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLonResChange(evt.target.value)}
                        value={this.props.lonres}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LONRES}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LATRES}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLatResChange(evt.target.value)}
                        value={this.props.latres}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LATRES}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LONLL}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLonLLChange(evt.target.value)}
                        value={this.props.lonll}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LONLL}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LATLL}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLatLLChange(evt.target.value)}
                        value={this.props.latll}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LATLL}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NUMPIXX}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNumPixXChange(evt.target.value)}
                        value={this.props.numpixx}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NUMPIXX}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NUMPIXY}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNumPixYChange(evt.target.value)}
                        value={this.props.numpixy}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NUMPIXY}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NUMPAR}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNumParChange(evt.target.value)}
                        value={this.props.numpar}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NUMPAR}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NHRS}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNhrsChange(evt.target.value)}
                        value={this.props.nhrs}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NHRS}
                    />
                </div>
                <div className={styles.inputRow}>
                    <Button className={styles.submitButton}>Submit</Button>
                </div>
            </div>
        );
    }
}

PleiadesJobSubmissionForm.propTypes = {
    jobowner: PropTypes.string,
    jobtag: PropTypes.string,
    lonres: PropTypes.number,
    latres: PropTypes.number,
    lonll: PropTypes.number,
    latll: PropTypes.number,
    numpixx: PropTypes.number,
    numpixy: PropTypes.number,
    numpar: PropTypes.number,
    nhrs: PropTypes.number,
    changeOwner: PropTypes.func.isRequired,
    changeTag: PropTypes.func.isRequired,
    changeLonRes: PropTypes.func.isRequired,
    changeLatRes: PropTypes.func.isRequired,
    changeLonLL: PropTypes.func.isRequired,
    changeLatLL: PropTypes.func.isRequired,
    changeNumPixX: PropTypes.func.isRequired,
    changeNumPixY: PropTypes.func.isRequired,
    changeNumPar: PropTypes.func.isRequired,
    changeNhrs: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        jobowner: state.MSFControl.getIn(["jobSubmissionOptions", "jobowner"]),
        jobtag: state.MSFControl.getIn(["jobSubmissionOptions", "jobtag"]),
        lonres: state.MSFControl.getIn(["jobSubmissionOptions", "lonres"]),
        latres: state.MSFControl.getIn(["jobSubmissionOptions", "latres"]),
        lonll: state.MSFControl.getIn(["jobSubmissionOptions", "lonll"]),
        latll: state.MSFControl.getIn(["jobSubmissionOptions", "latll"]),
        numpixx: state.MSFControl.getIn(["jobSubmissionOptions", "numpixx"]),
        numpixy: state.MSFControl.getIn(["jobSubmissionOptions", "numpixy"]),
        numpar: state.MSFControl.getIn(["jobSubmissionOptions", "numpar"]),
        nhrs: state.MSFControl.getIn(["jobSubmissionOptions", "nhrs"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeOwner: bindActionCreators(MSFControlActions.changeJobSubmissionOwner, dispatch),
        changeTag: bindActionCreators(MSFControlActions.changeJobSubmissionTag, dispatch),
        changeLonRes: bindActionCreators(MSFControlActions.changeJobSubmissionLonRes, dispatch),
        changeLatRes: bindActionCreators(MSFControlActions.changeJobSubmissionLatRes, dispatch),
        changeLonLL: bindActionCreators(MSFControlActions.changeJobSubmissionLonLL, dispatch),
        changeLatLL: bindActionCreators(MSFControlActions.changeJobSubmissionLatLL, dispatch),
        changeNumPixX: bindActionCreators(MSFControlActions.changeJobSubmissionNumPixX, dispatch),
        changeNumPixY: bindActionCreators(MSFControlActions.changeJobSubmissionNumPixY, dispatch),
        changeNumPar: bindActionCreators(MSFControlActions.changeJobSubmissionNumPar, dispatch),
        changeNhrs: bindActionCreators(MSFControlActions.changeJobSubmissionNhrs, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PleiadesJobSubmissionForm);
