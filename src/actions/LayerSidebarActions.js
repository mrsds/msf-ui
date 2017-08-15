import * as types from "constants/actionTypes_Extended";

export function pageForward(category) {
	return { type: types.FEATURE_SIDEBAR_PAGE_FORWARD, category };
}

export function pageBackward(category) {
	return { type: types.FEATURE_SIDEBAR_PAGE_BACKWARD, category };
}

export function changeSidebarCategory(category) {
	return { type: types.CHANGE_LAYER_SIDEBAR_CATEGORY, category };
}

export function pickFeatureFocus(argument) {
	return dispatch => {
		dispatch(featureFocusInfoLoading());

		// Do async stuff to get feature info
		const testFeature = {};
		dispatch(updateFeatureFocusInfo(testFeature));
		dispatch(featureFocusInfoLoaded());
	};
}

function featureFocusInfoLoading() {
	return { type: types.FEATURE_FOCUS_INFO_LOADING };
}

function featureFocusInfoLoaded() {
	return { type: types.FEATURE_FOCUS_INFO_LOADED };
}
function updateFeatureFocusInfo(feature) {
	return { type: types.UPDATE_FEATURE_FOCUS_INFO, feature };
}
