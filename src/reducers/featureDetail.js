import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypesMSF from "constants/actionTypes";
import { featureDetailState } from "reducers/models/featureDetail";
import FeatureDetailReducer from "reducers/reducerFunctions/FeatureDetailReducer";

export default function layerSidebar(
    state = featureDetailState,
    action,
    opt_reducer = FeatureDetailReducer
) {
    switch (action.type) {
        case actionTypesMSF.UPDATE_FEATURE_DETAIL:
            return opt_reducer.updateFeatureDetail(state, action);
        case actionTypesMSF.HIDE_FEATURE_DETAIL:
            return opt_reducer.hideFeatureDetail(state, action);
        case actionTypesMSF.CHANGE_PLUME_CHART_MODE:
            return opt_reducer.changePlumeChartMode(state, action);
        case actionTypesMSF.TOGGLE_PLUMES_WITH_OBSERVATIONS_ONLY:
            return opt_reducer.togglePlumesWithObservationsOnly(state, action);
        case actionTypesMSF.CHANGE_INFRASTRUCTURE_CHART_MODE:
            return opt_reducer.changeInfrastructureChartMode(state, action);
        case actionTypesMSF.SET_PLUME_SOURCE_FILTER:
            return opt_reducer.setPlumeSourceFilter(state, action);
        case actionTypesMSF.SET_FLYOVER_FILTER:
            return opt_reducer.setFlyoverFilter(state, action);
        case actionTypesMSF.FEATURE_DETAIL_PLUME_LIST_LOADING:
            return opt_reducer.featureDetailPlumeListLoading(state, action);
        case actionTypesMSF.UPDATE_FEATURE_DETAIL_PLUME_LIST:
            return opt_reducer.updateFeatureDetailPlumeList(state, action);
        case actionTypesMSF.SET_PLUME_FILTER_DATE:
            return opt_reducer.updatePlumeFilterDate(state, action);
        case actionTypesMSF.VISTA_METADATA_LOADING:
            return opt_reducer.vistaMetadataLoading(state, action);
        case actionTypesMSF.UPDATE_VISTA_METADATA:
            return opt_reducer.updateVistaMetadata(state, action);
        default:
            return state;
    }
}
