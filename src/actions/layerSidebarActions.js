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

        const sourceList = getSourceList(category, feature);
        if (!sourceList.size) {
            dispatch({ type: types.UPDATE_FEATURE_DETAIL_PLUME_LIST, data: [] });
            return;
        }

        const sourceRequests = sourceList.map(
            src =>
                new Promise((resolve, reject) =>
                    fetch(appConfig.URLS.plumeListQueryEndpoint.replace("{source_id}", src))
                        .then(res => res.json())
                        .then(data => resolve({ src, data }))
                        .catch(err => {
                            console.warn(
                                `Error getting available layer list for feature: ${feature.get(
                                    "name"
                                )}`,
                                err
                            );
                            reject();
                        })
                )
        );

        Promise.all(sourceRequests)
            .then(responses => {
                dispatch({
                    type: types.UPDATE_FEATURE_DETAIL_PLUME_LIST,
                    data: responses
                        .filter(res => res.data.length)
                        .map(res =>
                            res.data.map(feature => {
                                feature.sourceId = res.src;
                                return feature;
                            })
                        )
                        .reduce((acc, item) => acc.concat(item), [])
                });
            })
            .catch(err => {
                console.log(err);
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
            });
    };
}

function getSourceList(category, feature) {
    switch (category) {
        case layerSidebarTypes.CATEGORY_PLUMES:
            return Immutable.fromJS([feature.get("source_id")]);
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            return MetadataUtil.getSourceList(feature).map(src => src.get("id"));
    }
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
        if (layer.get("id") === layerSidebarTypes.VISTA_2017_OILGAS_FIELDS)
            updateOilWells(dispatch, getState, active);

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

function updateOilWells(dispatch, getState, active) {
    const mapState = getState().map;
    const wellsVisible =
        mapState
            .getIn(["maps", "openlayers"])
            .map.getView()
            .getZoom() > appConfig.OIL_WELLS_MIN_ZOOM;
    dispatch(
        updateInfrastructureCategoryFilter,
        layerSidebarTypes.VISTA_2017_OILGAS_WELLS,
        wellsVisible && active
    );
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
    return (dispatch, getState) => {
        dispatch({ type: types.SET_PLUME_FILTER, key, selectedValue });
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
        getState()
            .map.getIn(["maps", "openlayers"])
            .setVisiblePlumes(getState().layerSidebar);
    };
}

export function setInfrastructureFilter(key, selectedValue) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_INFRASTRUCTURE_FILTER, key, selectedValue });
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
        getState()
            .map.getIn(["maps", "openlayers"])
            .setVisibleInfrastructure(getState().layerSidebar);
    };
}
