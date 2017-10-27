import AsyncReducer from "_core/reducers/reducerFunctions/AsyncReducer";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export default class AsyncReducer_Extended extends AsyncReducer {
	static availableFeatureListLoading(state, action) {
		return state
			.set("loadingLayerAvailabilityData", true)
			.setIn(["loadingFeatures", action.category], true);
	}

	static availableFeatureListLoaded(state, action) {
		return state
			.set("loadingLayerAvailabilityData", false)
			.setIn(["loadingFeatures", action.category], false);
	}

	static featureFocusListLoading(state, action) {
		return state.set("featureFocusListLoading", true);
	}

	static featureFocusListLoaded(state, action) {
		return state.set("featureFocusListLoading", false);
	}
}
