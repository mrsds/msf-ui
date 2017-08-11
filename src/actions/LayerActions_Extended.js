import appConfig from "constants/appConfig";
import * as types from "_core/constants/actionTypes";
import * as types_extended from "constants/actionTypes_Extended";
import * as appStrings from "_core/constants/appStrings";
import * as AlertActions from "_core/actions/AlertActions";
import * as MapActions_Extended from "actions/MapActions_Extended";
import MiscUtil from "_core/utils/MiscUtil";

const miscUtil = new MiscUtil();

export function updateActiveFeatureCategories(layer, active) {
    return (dispatch, getState) => {
        dispatch(setActiveFeatureCategories(layer, active));
        dispatch(
            MapActions_Extended.getAvailableLayers(
                getState().map.getIn(["view", "extent"])
            )
        );
    };
}

export function setActiveFeatureCategories(layer, active) {
    return { type: types_extended.UPDATE_ACTIVE_SUBCATEGORIES, layer, active };
}
