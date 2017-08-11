import * as types_extended from "constants/actionTypes_Extended";
import * as MapActions_Extended from "actions/MapActions_Extended";

export function updateFeatureList(layerList, extent) {
	return dispatch => {
		dispatch(refreshActiveSubcategories(layerList));
		dispatch(MapActions_Extended.getAvailableLayers(extent));
	};
}

export function refreshActiveSubcategories(layerList) {
	return { type: types_extended.REFRESH_ACTIVE_SUBCATEGORIES, layerList };
}
