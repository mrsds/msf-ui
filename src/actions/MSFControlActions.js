import Immutable from "immutable";

import * as MSFTypes from "constants/MSFTypes";
import MetadataUtil from "utils/MetadataUtil";
import * as alertActions from "_core/actions/alertActions";
import appConfig from "constants/appConfig";
import * as appStringsMSF from "constants/appStrings";
import * as typesMSF from "constants/actionTypes";

export function changeControlMode(mode) {
    return { type: typesMSF.CHANGE_CONTROL_MODE, mode };
}

export function changeJobSubmissionOwner(jobowner) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_JOB_OWNER, jobowner });
    };
}

export function changeJobSubmissionTag(jobtag) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_JOB_TAG, jobtag });
    };
}

export function changeJobSubmissionLonRes(lonres) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_LONRES, lonres });
    };
}

export function changeJobSubmissionLatRes(latres) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_LATRES, latres });
    };
}

export function changeJobSubmissionLonLL(lonll) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_LONLL, lonll });
    };
}

export function changeJobSubmissionLatLL(latll) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_LATLL, latll });
    };
}

export function changeJobSubmissionNumPixX(numpixx) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_NUMPIXX, numpixx });
    };
}

export function changeJobSubmissionNumPixY(numpixy) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_NUMPIXY, numpixy });
    };
}

export function changeJobSubmissionNumPar(numpar) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_NUMPAR, numpar });
    };
}

export function changeJobSubmissionNhrs(nhrs) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_CONTROL_SUBMISSION_NHRS, nhrs });
    };
}

function _buildPleiadesJobUrl(getState) {
    return appConfig.URLS.pleiadesJobSubmitEndpoint
        .replace("{jobowner}", getState().MSFControl.getIn(["jobSubmissionOptions", "jobowner"]))
        .replace("{jobtag}", getState().MSFControl.getIn(["jobSubmissionOptions", "jobtag"]))
        .replace("{lonres}", getState().MSFControl.getIn(["jobSubmissionOptions", "lonres"]))
        .replace("{latres}", getState().MSFControl.getIn(["jobSubmissionOptions", "latres"]))
        .replace("{lonll}", getState().MSFControl.getIn(["jobSubmissionOptions", "lonll"]))
        .replace("{latll}", getState().MSFControl.getIn(["jobSubmissionOptions", "latll"]))
        .replace("{numpixx}", getState().MSFControl.getIn(["jobSubmissionOptions", "numpixx"]))
        .replace("{numpixy}", getState().MSFControl.getIn(["jobSubmissionOptions", "numpixy"]))
        .replace("{numpar}", getState().MSFControl.getIn(["jobSubmissionOptions", "numpar"]))
        .replace("{nhrs}", getState().MSFControl.getIn(["jobSubmissionOptions", "nhrs"]));
}

export function submitPleiadesJob() {
    return (dispatch, getState) => {
        const url = _buildPleiadesJobUrl(getState);

        fetch(url, { credentials: "same-origin" })
            .then(res => res.json())
            .then(json => {
                console.info(json);
                if (json.code && json.code !== 200) {
                    dispatch(
                        alertActions.addAlert({
                            title: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_FAILED.title,
                            body:
                                appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_FAILED.formatString +
                                ": " +
                                json.error,
                            severity: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_FAILED.severity,
                            time: new Date()
                        })
                    );
                } else {
                    dispatch(
                        alertActions.addAlert({
                            title: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_SUCCEEDED.title,
                            body: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_SUCCEEDED.formatString,
                            severity: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_SUCCEEDED.severity,
                            time: new Date()
                        })
                    );
                }
            })
            .catch(err => {
                console.warn(`Error submitting pleiades job request`, err);
                console.info(err);
                dispatch(
                    alertActions.addAlert({
                        title: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_FAILED.title,
                        body: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_FAILED.formatString,
                        severity: appStringsMSF.ALERTS.PLEIADES_JOB_SUBMIT_FAILED.severity,
                        time: new Date()
                    })
                );
            });
    };
}
