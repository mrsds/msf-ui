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
