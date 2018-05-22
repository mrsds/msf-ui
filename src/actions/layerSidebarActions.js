import * as types from "constants/actionTypes";
import * as mapActions from "actions/mapActions";
import * as coreMapActions from "_core/actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import * as alertActions from "_core/actions/alertActions";
import Immutable from "immutable";
import MetadataUtil from "utils/MetadataUtil";

export function pageForward(category) {
    return { type: types.FEATURE_SIDEBAR_PAGE_FORWARD, category };
}

export function pageBackward(category) {
    return { type: types.FEATURE_SIDEBAR_PAGE_BACKWARD, category };
}

export function changeSidebarCategory(category) {
    return { type: types.CHANGE_LAYER_SIDEBAR_CATEGORY, category };
}

export function setLayerSidebarCollapsed(collapsed) {
    return dispatch => {
        dispatch({ type: types.SET_LAYER_SIDEBAR_COLLAPSED, collapsed });
        dispatch(mapActions.resizeMap());
    };
}

export function setFeatureDetail(category, feature) {
    return dispatch => {
        dispatch({ type: types.FEATURE_DETAIL_PLUME_LIST_LOADING });
        dispatch({ type: types.UPDATE_FEATURE_DETAIL, category, feature });
        const plumeRequestUrl = appConfig.URLS.plumeListQueryEndpoint.replace(
            "{source_id}",
            MetadataUtil.getSourceID(feature)
        );
        return MiscUtil.asyncFetch({
            url: plumeRequestUrl,
            handleAs: "json"
        }).then(
            data => {
                console.log(data);
                dispatch({
                    type: types.UPDATE_FEATURE_DETAIL_PLUME_LIST,
                    data
                });
            },
            err => {
                console.warn(
                    `Error getting available layer list for feature: ${feature.get("name")}`,
                    err
                );
                dispatch({ type: types.UPDATE_FEATURE_DETAIL_PLUME_LIST, data: [] });
                dispatch(
                    alertActions.addAlert({
                        title: appStringsMSF.ALERTS.FEATURE_DETAIL_PLUME_LIST_LOAD_FAILED.title,
                        body: appStringsMSF.ALERTS.FEATURE_DETAIL_PLUME_LIST_LOAD_FAILED,
                        severity:
                            appStringsMSF.ALERTS.FEATURE_DETAIL_PLUME_LIST_LOAD_FAILED.severity,
                        time: new Date()
                    })
                );
            }
        );
    };
}

export function hideFeatureDetail() {
    return { type: types.HIDE_FEATURE_DETAIL };
}

function updateFeatureSearchTextState(category, value) {
    return { type: types.UPDATE_FEATURE_SEARCH_TEXT, category, value };
}

function updateFeatureSearchResults(category) {
    return { type: types.UPDATE_FEATURE_SEARCH_RESULTS, category };
}

export function updateInfrastructureCategoryFilter(layerName, active) {
    return (dispatch, getState) => {
        const layer = getState().map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA, layerName]);
        dispatch(setGroupLayerActive(layer, active));
        if (
            getState()
                .map.get("groups")
                .find(group => group.get("id") === layer.get("group"))
                .get("isActive")
        ) {
            dispatch(coreMapActions.setLayerActive(layer.get("id"), active));
        }
        dispatch(setActiveFeatureCategories(layerName, active));
        dispatch(mapActions.updateFeatureList_Map(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    };
}

export function toggleInfrastructureCategoryFilters(active) {
    return (dispatch, getState) => {
        const layers = getState()
            .map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA])
            .filter(layer =>
                layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES.hasOwnProperty(layer.get("id"))
            );
        let mapGroups = getState().map.get("groups");
        layers.forEach(layer => {
            dispatch(setGroupLayerActive(layer, active));
            if (mapGroups.find(group => group.get("id") === layer.get("group"))) {
                dispatch(coreMapActions.setLayerActive(layer.get("id"), active));
            }
            dispatch(setActiveFeatureCategories(layer.get("id"), active));
        });
        dispatch(mapActions.updateFeatureList_Map(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    };
}

function setActiveFeatureCategories(layer, active) {
    return { type: types.UPDATE_ACTIVE_SUBCATEGORIES, layer, active };
}

function setGroupLayerActive(layer, active) {
    return { type: types.SET_GROUP_LAYER_ACTIVE, layer, active };
}

export function setPlumeFilter(key, selectedValue) {
    return dispatch => {
        dispatch({ type: types.SET_PLUME_FILTER, key, selectedValue });
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
    };
}

export function setInfrastructureFilter(key, selectedValue) {
    return dispatch => {
        dispatch({ type: types.SET_INFRASTRUCTURE_FILTER, key, selectedValue });
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    };
}
