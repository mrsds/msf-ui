import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypes_Extended from "constants/actionTypes_Extended";
import { featureDetailState } from "reducers/models/featureDetail";
import FeatureDetailReducer from "reducers/reducerFunctions/FeatureDetailReducer";

export default function layerSidebar(
	state = featureDetailState,
	action,
	opt_reducer = FeatureDetailReducer
) {
	switch (action.type) {
		case actionTypes_Extended.UPDATE_FEATURE_DETAIL:
			return opt_reducer.updateFeatureDetail(state, action);
		case actionTypes_Extended.HIDE_FEATURE_DETAIL:
			return opt_reducer.hideFeatureDetail(state, action);
		default:
			return state;
	}
}
