import * as types from "_core/constants/actionTypes";
import * as types_extended from "constants/actionTypes_Extended";
import MiscUtil from "_core/utils/MiscUtil";
import MapUtil_Extended from "utils/MapUtil_Extended";
import * as appStrings_Extended from "constants/appStrings_Extended";
import * as AlertActions from "_core/actions/AlertActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStrings from "_core/constants/appStrings";
import * as FeatureDetailActions from "actions/FeatureDetailActions";

const miscUtil = new MiscUtil();
const mapUtil = new MapUtil_Extended();

export function updateFeatureList(category) {
    return (dispatch, getState) => {
        const mapState = getState().map;
        const layerSidebarState = getState().layerSidebar;
        const extent = mapState.getIn(["view", "extent"]);

        // Routine for getting VISTA (infrastructure) features
        const infrastructureLayerActive = mapState
            .get("groups")
            .find(group => group.get("id") === "VISTA")
            .get("isActive");
        const activeInfrastructureCategories = layerSidebarState
            .get("activeInfrastructureSubCategories")
            .some(cat => cat);
        const infrastructureVisible =
            infrastructureLayerActive && activeInfrastructureCategories;

        if (
            !category ||
            category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE
        ) {
            dispatch(
                availableFeatureListLoading(
                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                )
            );

            if (!infrastructureVisible) {
                dispatch(updateAvailableFeatures(category, null));
                dispatch(
                    availableFeatureListLoaded(
                        layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                    )
                );
            } else {
                requestAvailableFeatures(
                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                    extent,
                    layerSidebarState,
                    dispatch
                );
            }
        }

        // Routine for getting AVIRIS (plume) features
        const plumeLayerVisible = mapState
            .getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA, "AVIRIS"])
            .get("isActive");
        if (!category || category === layerSidebarTypes.CATEGORY_PLUMES) {
            dispatch(
                availableFeatureListLoading(layerSidebarTypes.CATEGORY_PLUMES)
            );

            if (!plumeLayerVisible) {
                dispatch(updateAvailableFeatures(category, null));
                dispatch(
                    availableFeatureListLoaded(
                        layerSidebarTypes.CATEGORY_PLUMES
                    )
                );
            } else {
                requestAvailableFeatures(
                    layerSidebarTypes.CATEGORY_PLUMES,
                    extent,
                    layerSidebarState,
                    dispatch
                );
            }
        }
    };
}

function availableLayerListLoading() {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADING };
}

function availableFeatureListLoading(category) {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADING, category };
}

function availableFeatureListLoaded(category) {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADED, category };
}

function updateAvailableFeatures(category, featureList) {
    return {
        type: types_extended.UPDATE_AVAILABLE_FEATURES,
        category,
        featureList
    };
}

function requestAvailableFeatures(
    category,
    extent,
    layerSidebarState,
    dispatch
) {
    const queryUrl = getQueryString(category, extent, layerSidebarState);
    return miscUtil
        .asyncFetch({
            url: queryUrl,
            handleAs: "json"
        })
        .then(
            data => {
                dispatch(updateAvailableFeatures(category, data));
                dispatch(availableFeatureListLoaded(category));
            },
            err => {
                console.warn(
                    "Error getting available layer list for current view bbox:",
                    err
                );
                dispatch(availableFeatureListLoaded(category));
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
                                .LAYER_AVAILABILITY_LIST_LOAD_FAILED.severity,
                        time: new Date()
                    })
                );
            }
        );
}

function getQueryString(category, extent, layerSidebarState) {
    switch (category) {
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            return mapUtil.buildVistaFeatureQueryString(
                extent,
                layerSidebarState
            );
        case layerSidebarTypes.CATEGORY_PLUMES:
            return mapUtil.buildAvirisFeatureQueryString(extent);
    }
}

export function centerMapOnPoint(coords) {
    return { type: types_extended.CENTER_MAP_ON_POINT, coords };
}

export function toggleFeatureLabel(category, feature) {
    return dispatch => {
        dispatch(FeatureDetailActions.hideFeatureDetailContainer());
        dispatch(updateFeatureLabel(category, feature, false));
    };
}

export function selectFeatureInSidebar(id) {
    return { type: types_extended.SELECT_FEATURE_IN_SIDEBAR, id };
}

export function pixelClick(clickEvt) {
    return (dispatch, getState) => {
        const category = getState().layerSidebar.get("activeFeatureCategory");
        const selectedFeatureId = getPixelFeatureID(
            clickEvt,
            getState().map,
            category
        );
        const selectedFeature = getFeatureById(
            getState().layerSidebar,
            category,
            selectedFeatureId
        );
        if (selectedFeature)
            dispatch(updateFeatureLabel(category, selectedFeature, true));
        return { type: types.PIXEL_CLICK, clickEvt };
    };
}

function getPixelFeatureID(clickEvt, mapState, category) {
    if (mapState.getIn(["view", "in3DMode"])) {
        console.log("TODO: setup pixel listener for cesium");
        return;
    }
    switch (category) {
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            return mapState
                .getIn(["maps", "openlayers"])
                .map.forEachFeatureAtPixel(clickEvt.pixel, feature => {
                    return feature.getProperties().id;
                });

        case layerSidebarTypes.CATEGORY_PLUMES:
            return mapState
                .getIn(["maps", "openlayers"])
                .map.forEachLayerAtPixel(clickEvt.pixel, layer => {
                    return layer.get("_featureId");
                });
    }
}

function updateFeatureLabel(category, feature, shuffleList) {
    return {
        type: types_extended.TOGGLE_FEATURE_LABEL,
        category,
        feature,
        shuffleList
    };
}

function getFeatureById(sidebarState, category, id) {
    return sidebarState
        .getIn(["searchState", category, "searchResults"])
        .find(feature => feature.get("id") === id);
}
