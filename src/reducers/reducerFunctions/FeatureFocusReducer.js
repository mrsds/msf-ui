import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export default class FeatureFocusReducer {
	static updateFeatureFocusInfo(state, action) {
		return state.set("activeFeature", action.feature).set("isOpen", true);
	}

	static hideFeatureFocusContainer(state, action) {
		return state.set("isOpen", false).set("activeFeature", null);
	}
}
