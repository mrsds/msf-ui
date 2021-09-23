import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import styles from "components/MSFControl/PleiadesJobSubmissionFormStyles.scss";
import * as MSFControlActions from "actions/MSFControlActions";
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

    handleSubmitClicked(e) {
        this.props.submitPleiadesJob();
    }

    render() {
        const {
            jobowner,
            jobtag,
            lonres,
            latres,
            lonll,
            latll,
            numpixx,
            numpixy,
            numpar,
            nhrs
        } = this.props;

        return (
            <div className={styles.jobFormContainer}>
                <h1>Pleiades Job Submission</h1>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_OWNER_ID}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleOwnerChange(evt.target.value)}
                        error={jobowner == null || jobowner.length == 0}
                        value={jobowner}
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_OWNER_ID}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_JOB_TAG}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleTagChange(evt.target.value)}
                        value={jobtag}
                        error={jobtag == null || jobtag.length == 0}
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_JOB_TAG}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LONRES}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLonResChange(evt.target.value)}
                        error={lonres <= 0}
                        value={lonres}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LONRES}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LATRES}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLatResChange(evt.target.value)}
                        error={latres <= 0}
                        value={latres}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LATRES}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LONLL}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLonLLChange(evt.target.value)}
                        error={lonll == null || lonll == "" || lonll < -180.0 || lonll > 180.0}
                        value={lonll}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LONLL}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_LATLL}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleLatLLChange(evt.target.value)}
                        error={latll == null || latll == "" || latll < -90.0 || latll > 90.0}
                        value={latll}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_LATLL}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NUMPIXX}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNumPixXChange(evt.target.value)}
                        error={numpixx <= 0}
                        value={numpixx}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NUMPIXX}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NUMPIXY}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNumPixYChange(evt.target.value)}
                        error={numpixy <= 0}
                        value={numpixy}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NUMPIXY}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NUMPAR}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNumParChange(evt.target.value)}
                        error={numpar <= 0}
                        value={numpar}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NUMPAR}
                    />
                </div>
                <div className={styles.inputRow}>
                    <InputLabel>{appStrings.CONTROL_JOB_SUBMISSION_NHRS}: </InputLabel>
                    <TextField
                        className={styles.inputContainer}
                        onChange={evt => this.handleNhrsChange(evt.target.value)}
                        error={nhrs <= 0}
                        value={nhrs}
                        type="number"
                        placeholder={appStrings.CONTROL_JOB_SUBMISSION_NHRS}
                    />
                </div>
                <div className={styles.inputRow}>
                    <Button
                        className={styles.submitButton}
                        onClick={evt => this.handleSubmitClicked()}
                    >
                        Submit
                    </Button>
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
    changeNhrs: PropTypes.func.isRequired,
    submitPleiadesJob: PropTypes.func.isRequired
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
        changeNhrs: bindActionCreators(MSFControlActions.changeJobSubmissionNhrs, dispatch),
        submitPleiadesJob: bindActionCreators(MSFControlActions.submitPleiadesJob, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PleiadesJobSubmissionForm);
