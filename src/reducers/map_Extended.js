import { mapState_Extended } from "reducers/models/map_Extended";
import map from "_core/reducers/map";
import MapReducer_Extended from "reducers/reducerFunctions/MapReducer_Extended";
import * as actionTypesMSF from "constants/actionTypes";

export default function map_Extended(
    state = mapState_Extended,
    action,
    opt_reducer = MapReducer_Extended
) {
    switch (action.type) {
        case actionTypesMSF.AVAILABLE_LAYER_LIST_LOADED:
            return opt_reducer.updateAvailableLayers(state, action);
        case actionTypesMSF.SET_GROUP_LAYER_ACTIVE:
            return opt_reducer.setGroupLayerActive(state, action);
        case actionTypesMSF.SET_GROUP_ACTIVE:
            return opt_reducer.setGroupActive(state, action);
        case actionTypesMSF.CENTER_MAP_ON_POINT:
            return opt_reducer.centerMapOnPoint(state, action);
        case actionTypesMSF.CENTER_MAP_ON_FEATURE:
            return opt_reducer.centerMapOnFeature(state, action);
        case actionTypesMSF.TOGGLE_FEATURE_LABEL:
            return opt_reducer.toggleFeatureLabel(state, action);
        case actionTypesMSF.CLEAR_FEATURE_LABELS:
            return opt_reducer.clearFeatureLabels(state, action);
        case actionTypesMSF.SET_HOVER_PLUME:
            return opt_reducer.setHoverPlume(state, action);
        // case actionTypesMSF.UPDATE_FEATURE_DETAIL:
        //     return opt_reducer.toggleFeatureLabel(state, action);
        case actionTypesMSF.UPDATE_AVAILABLE_GRIDDED_DATES:
            return opt_reducer.updateAvailableGriddedDates(state, action);
        case actionTypesMSF.UPDATE_GRIDDED_DATE:
            return opt_reducer.updateGriddedDate(state, action);
        default:
            return map.call(this, state, action, opt_reducer);
    }
}
