import Immutable from "immutable";

export default class MSFControlReducer {
    static changeControlMode(state, action) {
        return state.set("controlMode", action.mode);
    }
    static changeJobSubmissionOwner(state, action) {
        return state.setIn(["jobSubmissionOptions", "jobowner"], action.jobowner);
    }
    static changeJobSubmissionTag(state, action) {
        return state.setIn(["jobSubmissionOptions", "jobtag"], action.jobtag);
    }
    static changeJobSubmissionLonRes(state, action) {
        return state.setIn(["jobSubmissionOptions", "lonres"], action.lonres);
    }
    static changeJobSubmissionLatRes(state, action) {
        return state.setIn(["jobSubmissionOptions", "latres"], action.latres);
    }
    static changeJobSubmissionLonLL(state, action) {
        return state.setIn(["jobSubmissionOptions", "lonll"], action.lonll);
    }
    static changeJobSubmissionLatLL(state, action) {
        return state.setIn(["jobSubmissionOptions", "latll"], action.latll);
    }
    static changeJobSubmissionNumPixX(state, action) {
        return state.setIn(["jobSubmissionOptions", "numpixx"], action.numpixx);
    }
    static changeJobSubmissionNumPixY(state, action) {
        return state.setIn(["jobSubmissionOptions", "numpixy"], action.numpixy);
    }
    static changeJobSubmissionNumPar(state, action) {
        return state.setIn(["jobSubmissionOptions", "numpar"], action.numpar);
    }
    static changeJobSubmissionNhrs(state, action) {
        return state.setIn(["jobSubmissionOptions", "nhrs"], action.nhrs);
    }
}
