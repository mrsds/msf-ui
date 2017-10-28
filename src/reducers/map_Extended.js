import { mapState_Extended } from "reducers/models/map_Extended";
import map from "_core/reducers/map";
import MapReducer_Extended from "reducers/reducerFunctions/MapReducer_Extended";
import * as actionTypes_Extended from "constants/actionTypes_Extended";

export default function map_Extended(
	state = mapState_Extended,
	action,
	opt_reducer = MapReducer_Extended
) {
	switch (action.type) {
		case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADED:
			return opt_reducer.updateAvailableLayers(state, action);
		case actionTypes_Extended.SET_GROUP_LAYER_ACTIVE:
			return opt_reducer.setGroupLayerActive(state, action);
		case actionTypes_Extended.SET_GROUP_ACTIVE:
			return opt_reducer.setGroupActive(state, action);
		case actionTypes_Extended.CENTER_MAP_ON_POINT:
			return opt_reducer.centerMapOnPoint(state, action);
		case actionTypes_Extended.TOGGLE_FEATURE_LABEL:
			return opt_reducer.toggleFeatureLabel(state, action);
		default:
			return map.call(this, state, action, opt_reducer);
	}
}
