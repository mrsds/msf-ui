import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypesMSF from "constants/actionTypes";
import { layerSidebarState } from "reducers/models/layerSidebar";
import LayerSidebarReducer from "reducers/reducerFunctions/LayerSidebarReducer";

export default function layerSidebar(
    state = layerSidebarState,
    action,
    opt_reducer = LayerSidebarReducer
) {
    switch (action.type) {
        case actionTypesMSF.SET_LAYER_SIDEBAR_CATEGORY:
            return opt_reducer.updateActiveCategory(state, action);
        case actionTypesMSF.UPDATE_AVAILABLE_FEATURES:
            return opt_reducer.updateAvailableFeatures(state, action);
        case actionTypesMSF.FEATURE_SIDEBAR_PAGE_FORWARD:
            return opt_reducer.pageForward(state, action);
        case actionTypesMSF.FEATURE_SIDEBAR_PAGE_BACKWARD:
            return opt_reducer.pageBackward(state, action);
        case actionTypesMSF.CHANGE_LAYER_SIDEBAR_CATEGORY:
            return opt_reducer.changeSidebarCategory(state, action);
        case actionTypesMSF.UPDATE_ACTIVE_SUBCATEGORIES:
            return opt_reducer.updateActiveSubcategories(state, action);
        case actionTypesMSF.UPDATE_FEATURE_SEARCH_RESULTS:
            return opt_reducer.updateSearchResults(state, action);
        case actionTypesMSF.AVAILABLE_LAYER_LIST_LOADED:
            return opt_reducer.updateSearchResults(state, action);
        case actionTypesMSF.SET_PLUME_FILTER:
            return opt_reducer.setPlumeFilter(state, action);
        case actionTypesMSF.SET_INFRASTRUCTURE_FILTER:
            return opt_reducer.setInfrastructureFilter(state, action);
        case actionTypesMSF.TOGGLE_FEATURE_LABEL:
            return opt_reducer.selectFeatureInSidebar(state, action);
        default:
            return state;
    }
}
