import * as actionTypes_Extended from "constants/actionTypes_Extended";
import { asyncState_Extended } from "reducers/models/async_Extended";
import async from "_core/reducers/async";
import AsyncReducer_Extended from "reducers/reducerFunctions/AsyncReducer_Extended";

export default function asynchronous_Extended(
	state = asyncState_Extended,
	action,
	opt_reducer = AsyncReducer_Extended
) {
	switch (action.type) {
		case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADING:
			return opt_reducer.availableFeatureListLoading(state, action);
		case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADED:
			return opt_reducer.availableFeatureListLoaded(state, action);
		case actionTypes_Extended.FEATURE_FOCUS_INFO_LOADING:
			return opt_reducer.featureFocusListLoading(state, action);
		case actionTypes_Extended.UPDATE_FEATURE_FOCUS_INFO:
			return opt_reducer.featureFocusListLoaded(state, action);
		default:
			return async.call(this, state, action, opt_reducer);
	}
}
