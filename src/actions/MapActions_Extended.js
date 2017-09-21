import appConfig from "constants/appConfig";
import * as types from "_core/constants/actionTypes";
import * as types_extended from "constants/actionTypes_Extended";
import MiscUtil from "_core/utils/MiscUtil";
import MapUtil_Extended from "utils/MapUtil_Extended";
import * as appStrings_Extended from "constants/appStrings_Extended";
import * as AlertActions from "_core/actions/AlertActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStrings from "_core/constants/appStrings";

const miscUtil = new MiscUtil();
const mapUtil = new MapUtil_Extended();

export function getAvailableLayers(extent) {
    return (dispatch, getState) => {
        // First check if there are any active layers we need to grab data for
        const layerSidebarState = getState().layerSidebar;
        if (!mapUtil.activeInfrastructureCategories(layerSidebarState)) {
            dispatch(updateAvailableFeatures([]));
            dispatch(
                availableLayerListLoaded(
                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                )
            );
            return;
        }
        dispatch(availableLayerListLoading());

        return miscUtil
            .asyncFetch({
                url: mapUtil.buildAvailableLayerQueryString(
                    extent,
                    layerSidebarState
                ),
                handleAs: "json"
            })
            .then(
                data => {
                    // update available features for bbox
                    dispatch(updateAvailableFeatures(data.features));
                    // signal loading complete
                    dispatch(
                        availableLayerListLoaded(
                            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                        )
                    );
                },
                err => {
                    console.warn(
                        "Error getting available layer list for current view bbox:",
                        err
                    );
                    // signal loading complete
                    dispatch(
                        availableLayerListLoaded(
                            layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                        )
                    );

                    // display alert
                    dispatch(
                        AlertActions.addAlert({
                            title:
                                appStrings_Extended.ALERTS
                                    .LAYER_AVAILABILITY_LIST_LOAD_FAILED.title,
                            body:
                                appStrings_Extended.ALERTS
                                    .LAYER_AVAILABILITY_LIST_LOAD_FAILED,
                            severity:
                                appStrings_Extended.ALERTS
                                    .LAYER_AVAILABILITY_LIST_LOAD_FAILED
                                    .severity,
                            time: new Date()
                        })
                    );
                }
            );
    };
}

export function availableLayerListLoading() {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADING };
}

export function availableLayerListLoaded(category) {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADED, category };
}

export function updateAvailableFeatures(layerList) {
    return { type: types_extended.UPDATE_AVAILABLE_FEATURE_LIST, layerList };
}
