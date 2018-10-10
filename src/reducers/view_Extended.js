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
        // case actionTypesMSF.UPDATE_FEATURE_DETAIL:
        //     return opt_reducer.hideMapControlContainer(state, action);
        // case actionTypesMSF.HIDE_FEATURE_DETAIL:
        //     return opt_reducer.showMapControlContainer(state, action);
        default:
            return view.call(this, state, action, opt_reducer);
    }
}
