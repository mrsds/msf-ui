import * as types_extended from "constants/actionTypes_Extended";
import * as MapActions_Extended from "actions/MapActions_Extended";

export function updateFeatureList(layerList, extent) {
	return dispatch => {
		dispatch(MapActions_Extended.updateFeatureList(extent));
	};
}
