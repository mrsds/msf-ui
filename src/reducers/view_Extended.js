import * as actionTypesMSF from "constants/actionTypes";
import { viewState_Extended } from "reducers/models/view_Extended";
import ViewReducer_Extended from "reducers/reducerFunctions/ViewReducer_Extended";
import view from "_core/reducers/view";

export default function view_Extended(
    state = viewState_Extended,
    action,
    opt_reducer = ViewReducer_Extended
) {
    switch (action.type) {
        case actionTypesMSF.CHANGE_APP_MODE:
            return opt_reducer.changeAppMode(state, action);
        case actionTypesMSF.COMPLETE_LANDING_PAGE_LOAD:
            return opt_reducer.completeLandingPageLoad(state, action);
        default:
            return view.call(this, state, action, opt_reducer);
    }
}
