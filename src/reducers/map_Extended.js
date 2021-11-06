import { mapState_Extended } from "reducers/models/map_Extended";
import map from "_core/reducers/map";
import MapReducer_Extended from "reducers/reducerFunctions/MapReducer_Extended";
import * as actionTypes from "_core/constants/actionTypes";
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
        case actionTypesMSF.INCREMENT_GRIDDED_DATE:
            return opt_reducer.incrementGriddedDate(state, action);
        case actionTypesMSF.RESIZE_MAP:
            return opt_reducer.resizeMap(state, action);
        case actionTypesMSF.UPDATE_FEATURE_PICKER:
            return opt_reducer.updateFeaturePicker(state, action);
        case actionTypesMSF.SET_ACTIVE_PICKER_FEATURE:
            return opt_reducer.setActivePickerFeature(state, action);
        case actionTypes.SET_MAP_VIEW:
            return opt_reducer.setMapView(state, action);
        case actionTypes.SET_LAYER_ACTIVE:
            return opt_reducer.setLayerActive(state, action);
        case actionTypesMSF.CHANGE_ACTIVE_GRIDDED_LAYER:
            return opt_reducer.changeActiveGriddedLayer(state, action);
        case actionTypesMSF.TOGGLE_LOCATION_INPUT_MODAL:
            return opt_reducer.toggleLocationInputModal(state, action);
        case actionTypesMSF.UPDATE_VISIBLE_PLUMES:
            return opt_reducer.updateVisiblePlumes(state, action);
        case actionTypesMSF.SET_PREVIOUS_ZOOM:
            return opt_reducer.setPreviousZoom(state, action);
        case actionTypesMSF.SET_JUMP_TO_NEAREST_PENDING:
            return opt_reducer.setJumpToNearestPending(state, action);
        case actionTypesMSF.SET_HOME_AREA_PICKER_VISIBLE:
            return opt_reducer.setHomeAreaPickerModalVisible(state, action);
        case actionTypesMSF.UPDATE_SDAP_CHART_DATA:
            return opt_reducer.updateSdapChartData(state, action);
        case actionTypesMSF.UPDATE_SDAP_CHART_OPTIONS:
            return opt_reducer.updateSdapChartOptions(state, action);
        default:
            return map.call(this, state, action, opt_reducer);
    }
}
