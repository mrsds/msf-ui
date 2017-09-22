import appConfig from "constants/appConfig";
import * as types from "_core/constants/actionTypes";
import * as types_extended from "constants/actionTypes_Extended";
import * as appStrings from "_core/constants/appStrings";
import * as AlertActions from "_core/actions/AlertActions";
import * as MapActions_Extended from "actions/MapActions_Extended";
import * as LayerActions from "_core/actions/LayerActions";
import MiscUtil from "_core/utils/MiscUtil";

const miscUtil = new MiscUtil();

// export function updateActiveFeatureCategories(layer, active) {
// 	return (dispatch, getState) => {
// 		dispatch(setActiveFeatureCategories(layer, active));
// 		dispatch(
// 			MapActions_Extended.getAvailableLayers(
// 				getState().map.getIn(["view", "extent"])
// 			)
// 		);
// 	};
// }

export function setActiveFeatureCategories(layer, active) {
	return { type: types_extended.UPDATE_ACTIVE_SUBCATEGORIES, layer, active };
}

export function setGroupVisible(group, active) {
	return (dispatch, getState) => {
		dispatch(setGroupActiveState(group, active));
		getState()
			.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA])
			.forEach(layer => {
				const inGroup = layer.get("group") === group.get("id");
				const shouldSwitch = active
					? layer.get("visibleInGroup")
					: true;
				if (inGroup && shouldSwitch) {
					dispatch(
						LayerActions.setLayerActive(layer.get("id"), active)
					);
				}
			});
	};
}

function setGroupActiveState(group, active) {
	return { type: types_extended.SET_GROUP_ACTIVE, group, active };
}
