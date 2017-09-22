import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypes_Extended from "constants/actionTypes_Extended";
import { layerSidebarState } from "reducers/models/layerSidebar";
import LayerSidebarReducer from "reducers/reducerFunctions/LayerSidebarReducer";

export default function layerSidebar(
    state = layerSidebarState,
    action,
    opt_reducer = LayerSidebarReducer
) {
    switch (action.type) {
        case actionTypes_Extended.SET_LAYER_SIDEBAR_CATEGORY:
            return opt_reducer.updateActiveCategory(state, action);
        case actionTypes_Extended.UPDATE_AVAILABLE_FEATURES:
            return opt_reducer.updateAvailableFeatures(state, action);
        case actionTypes_Extended.FEATURE_SIDEBAR_PAGE_FORWARD:
            return opt_reducer.pageForward(state, action);
        case actionTypes_Extended.FEATURE_SIDEBAR_PAGE_BACKWARD:
            return opt_reducer.pageBackward(state, action);
        case actionTypes_Extended.CHANGE_LAYER_SIDEBAR_CATEGORY:
            return opt_reducer.changeSidebarCategory(state, action);
        case actionTypes_Extended.UPDATE_ACTIVE_SUBCATEGORIES:
            return opt_reducer.updateActiveSubcategories(state, action);
        case actionTypes_Extended.UPDATE_FEATURE_SEARCH_TEXT:
            return opt_reducer.updateFeatureSearchText(state, action);
        case actionTypes_Extended.UPDATE_FEATURE_SEARCH_RESULTS:
            return opt_reducer.updateSearchResults(state, action);
        case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADED:
            return opt_reducer.updateSearchResults(state, action);
        case actionTypes_Extended.TOGGLE_INFRASTRUCTURE_FACILITY_FILTER_OPTIONS_VISIBLE:
            return opt_reducer.setActiveFeatureCategories(state, action);
        default:
            return state;
    }
}
