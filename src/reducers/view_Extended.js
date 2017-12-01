import * as actionTypes_Extended from "constants/actionTypes_Extended";
import { viewState_Extended } from "reducers/models/view_Extended";
import ViewReducer_Extended from "reducers/reducerFunctions/ViewReducer_Extended";
import view from "_core/reducers/view";

export default function view_Extended(
    state = viewState_Extended,
    action,
    opt_reducer = ViewReducer_Extended
) {
    switch (action.type) {
        // case actionTypes_Extended.UPDATE_FEATURE_DETAIL:
        //     return opt_reducer.hideMapControlContainer(state, action);
        // case actionTypes_Extended.HIDE_FEATURE_DETAIL:
        //     return opt_reducer.showMapControlContainer(state, action);
        default:
            return view.call(this, state, action, opt_reducer);
    }
}
