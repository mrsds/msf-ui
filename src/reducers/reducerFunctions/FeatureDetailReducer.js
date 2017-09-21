import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export default class FeatureDetailReducer {
	static updateFeatureDetail(state, action) {
		if (
			action.category === state.get("category") &&
			action.feature.get("id") === state.getIn(["feature", "id"])
		) {
			return state
				.set("category", "")
				.set("feature", Immutable.fromJS({}));
		}
		return state
			.set("category", action.category)
			.set("feature", action.feature);
	}

	static updateFeatureFocusInfo(state, action) {
		return state.set("activeFeature", action.feature).set("isOpen", true);
	}

	static hideFeatureFocusContainer(state, action) {
		return state.set("isOpen", false).set("activeFeature", null);
	}
}
