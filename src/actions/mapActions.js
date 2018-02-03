import * as types from "_core/constants/actionTypes";
import * as typesMSF from "constants/actionTypes";
import MiscUtil from "_core/utils/MiscUtil";
import MapUtilExtended from "utils/MapUtilExtended";
import * as appStringsMSF from "constants/appStrings";
import * as alertActions from "_core/actions/alertActions";
import * as mapActions from "_core/actions/mapActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStrings from "_core/constants/appStrings";
import * as featureDetailActions from "actions/featureDetailActions";
import appConfig from "constants/appConfig";

export function updateFeatureList_Layer(layer, active) {
    return (dispatch, getState) => {
        if (layer === "AVIRIS") dispatch(updateFeatureList_Map(layerSidebarTypes.CATEGORY_PLUMES));
    };
}

export function setGroupVisible(group, active) {
    return (dispatch, getState) => {
        dispatch(setGroupActiveState(group, active));
        getState()
            .map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA])
            .forEach(layer => {
                const inGroup = layer.get("group") === group.get("id");
                const shouldSwitch = active ? layer.get("visibleInGroup") : true;
                // if (inGroup && shouldSwitch) {
                if (inGroup && shouldSwitch) {
                    dispatch(mapActions.setLayerActive(layer.get("id"), active));
                }
            });
    };
}

function setGroupActiveState(group, active) {
    return { type: typesMSF.SET_GROUP_ACTIVE, group, active };
}

export function updateFeatureList_Map(category) {
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
        const infrastructureVisible = infrastructureLayerActive && activeInfrastructureCategories;

        if (!category || category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE) {
            dispatch(availableFeatureListLoading(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));

            if (!infrastructureVisible) {
                dispatch(updateAvailableFeatures(category, null));
                dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
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
            dispatch(availableFeatureListLoading(layerSidebarTypes.CATEGORY_PLUMES));

            if (!plumeLayerVisible) {
                dispatch(updateAvailableFeatures(category, null));
                dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_PLUMES));
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
    return { type: typesMSF.AVAILABLE_LAYER_LIST_LOADING };
}

function availableFeatureListLoading(category) {
    return { type: typesMSF.AVAILABLE_LAYER_LIST_LOADING, category };
}

function availableFeatureListLoaded(category) {
    return { type: typesMSF.AVAILABLE_LAYER_LIST_LOADED, category };
}

function updateAvailableFeatures(category, featureList) {
    return {
        type: typesMSF.UPDATE_AVAILABLE_FEATURES,
        category,
        featureList
    };
}

function requestAvailableFeatures(category, extent, layerSidebarState, dispatch) {
    const queryUrl = getQueryString(category, extent, layerSidebarState);
    return MiscUtil.asyncFetch({
        url: queryUrl,
        handleAs: "json"
    }).then(
        data => {
            dispatch(updateAvailableFeatures(category, data));
            dispatch(availableFeatureListLoaded(category));
        },
        err => {
            console.warn("Error getting available layer list for current view bbox:", err);
            dispatch(availableFeatureListLoaded(category));
            dispatch(
                alertActions.addAlert({
                    title: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.title,
                    body: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED,
                    severity: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.severity,
                    time: new Date()
                })
            );
        }
    );
}

function getQueryString(category, extent, layerSidebarState) {
    switch (category) {
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            return MapUtilExtended.buildVistaFeatureQueryString(extent, layerSidebarState);
        case layerSidebarTypes.CATEGORY_PLUMES:
            return MapUtilExtended.buildAvirisFeatureQueryString(extent);
    }
}

export function centerMapOnPoint(coords) {
    return { type: typesMSF.CENTER_MAP_ON_POINT, coords };
}

export function centerMapOnFeature(feature, featureType) {
    return { type: typesMSF.CENTER_MAP_ON_FEATURE, feature, featureType };
}

export function toggleFeatureLabel(category, feature) {
    return dispatch => {
        // dispatch(featureDetailActions.hideFeatureDetailContainer());
        dispatch(clearFeatureLabels());
        dispatch(updateFeatureLabel(category, feature));
    };
}

export function selectFeatureInSidebar(id) {
    return { type: typesMSF.SELECT_FEATURE_IN_SIDEBAR, id };
}

export function pixelClick(clickEvt) {
    return (dispatch, getState) => {
        const category = getState().layerSidebar.get("activeFeatureCategory");
        const selectedFeatureId = getPixelFeatureId(clickEvt, getState().map, category);
        const selectedFeature = getFeatureById(
            getState().layerSidebar,
            category,
            selectedFeatureId
        );
        dispatch(clearFeatureLabels());
        updateHighlightedPlumes(getState);
        if (selectedFeature) {
            dispatch(updateFeatureLabel(category, selectedFeature));
        }
        return { type: types.PIXEL_CLICK, clickEvt };
    };
}

function getPixelFeatureId(clickEvt, mapState, category) {
    if (mapState.getIn(["view", "in3DMode"])) {
        console.log("TODO: setup pixel listener for cesium");
        return;
    }

    let featureId;
    switch (category) {
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            featureId = mapState
                .getIn(["maps", "openlayers"])
                .map.forEachFeatureAtPixel(clickEvt.pixel, feature => {
                    return feature.getProperties().id;
                });
            break;

        case layerSidebarTypes.CATEGORY_PLUMES:
            // First check to see if user has clicked an icon
            featureId = mapState
                .getIn(["maps", "openlayers"])
                .map.forEachFeatureAtPixel(clickEvt.pixel, feature => {
                    if (feature.get("_featureType") === "icon") return feature.get("_featureId");
                });

            // If no icon has been clicked, check to see if a plume has been clicked instead
            featureId =
                featureId ||
                mapState
                    .getIn(["maps", "openlayers"])
                    .map.forEachLayerAtPixel(clickEvt.pixel, layer => {
                        if (layer.get("_featureType") === "plume") {
                            return layer.get("_featureId");
                        }
                    });
            break;
    }
    return featureId;
}

function updateFeatureLabel(category, feature) {
    return {
        type: typesMSF.TOGGLE_FEATURE_LABEL,
        category,
        feature
    };
}

function clearFeatureLabels() {
    return { type: typesMSF.CLEAR_FEATURE_LABELS };
}

function getFeatureById(sidebarState, category, id) {
    return sidebarState
        .getIn(["searchState", category, "searchResults"])
        .find(feature => feature.get("id") === id);
}

function updateHighlightedPlumes(getState) {
    const selectedPlume =
        getState().layerSidebar.getIn(["activeFeature", "category"]) ===
        layerSidebarTypes.CATEGORY_PLUMES
            ? getState().layerSidebar.getIn(["activeFeature", "feature"])
            : null;

    const hoverPlume = getState().map.get("hoverPlume");
    getState()
        .map.get("maps")
        .map(map => map.setActivePlumes([selectedPlume, hoverPlume]));
}

function updateHoverPlume(feature) {
    return { type: typesMSF.SET_HOVER_PLUME, feature: feature };
}

export function setHoverPlume(feature) {
    return (dispatch, getState) => {
        dispatch(updateHoverPlume(feature));
        updateHighlightedPlumes(getState);
    };
}
