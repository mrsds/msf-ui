import appConfig from "constants/appConfig";
import * as types from "_core/constants/actionTypes";
import * as types_extended from "constants/actionTypes_Extended";
import * as appStrings from "_core/constants/appStrings";
import * as AlertActions from "_core/actions/AlertActions";
import * as MapActions_Extended from "actions/MapActions_Extended";
import * as LayerActions from "_core/actions/LayerActions";
import MiscUtil from "_core/utils/MiscUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

const miscUtil = new MiscUtil();

export function updateFeatureList(layer, active) {
	return (dispatch, getState) => {
		if (layer === "AVIRIS")
			dispatch(
				MapActions_Extended.updateFeatureList(
					layerSidebarTypes.CATEGORY_PLUMES
				)
			);
	};
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
