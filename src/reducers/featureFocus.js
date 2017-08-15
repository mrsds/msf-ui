import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypes_Extended from "constants/actionTypes_Extended";
import { featureFocusState } from "reducers/models/featureFocus";
// import LayerSidebarReducer from "reducers/reducerFunctions/LayerSidebarReducer";

export default function layerSidebar(
    state = featureFocusState,
    action
    // opt_reducer = LayerSidebarReducer
) {
    switch (action.type) {
        default:
            return state;
    }
}
