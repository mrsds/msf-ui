import * as actionTypes from "_core/constants/actionTypes";
import * as actionTypes_Extended from "constants/actionTypes_Extended";
import { featureFocusState } from "reducers/models/featureFocus";
import FeatureFocusReducer from "reducers/reducerFunctions/FeatureFocusReducer";

export default function layerSidebar(
	state = featureFocusState,
	action,
	opt_reducer = FeatureFocusReducer
) {
	switch (action.type) {
		case actionTypes_Extended.UPDATE_FEATURE_FOCUS_INFO:
			return opt_reducer.updateFeatureFocusInfo(state, action);
		case actionTypes_Extended.HIDE_FEATURE_FOCUS_CONTAINER:
			return opt_reducer.hideFeatureFocusContainer(state, action);
		default:
			return state;
	}
}
