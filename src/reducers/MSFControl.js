import * as actionTypesMSF from "constants/actionTypes";
import { MSFControlState } from "reducers/models/MSFControl";
import MSFControlReducer from "reducers/reducerFunctions/MSFControlReducer";

export default function MSFControl(
    state = MSFControlState,
    action,
    opt_reducer = MSFControlReducer
) {
    switch (action.type) {
        case actionTypesMSF.CHANGE_CONTROL_MODE:
            return opt_reducer.changeControlMode(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_JOB_OWNER:
            return opt_reducer.changeJobSubmissionOwner(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_JOB_TAG:
            return opt_reducer.changeJobSubmissionTag(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_LONRES:
            return opt_reducer.changeJobSubmissionLonRes(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_LATRES:
            return opt_reducer.changeJobSubmissionLatRes(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_LONLL:
            return opt_reducer.changeJobSubmissionLonLL(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_LATLL:
            return opt_reducer.changeJobSubmissionLatLL(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_NUMPIXX:
            return opt_reducer.changeJobSubmissionNumPixX(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_NUMPIXY:
            return opt_reducer.changeJobSubmissionNumPixY(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_NUMPAR:
            return opt_reducer.changeJobSubmissionNumPar(state, action);
        case actionTypesMSF.CHANGE_CONTROL_SUBMISSION_NHRS:
            return opt_reducer.changeJobSubmissionNhrs(state, action);
        default:
            return state;
    }
}
