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

function getVistaPlumesList(feature) {
    return dispatch =>
        fetch(appConfig.URLS.plumeListQueryEndpoint.replace("{vista_id}", feature.get("id")))
            .then(res => res.json())
            .then(data => dispatch({ type: types.UPDATE_FEATURE_DETAIL_PLUME_LIST, data }))
            .catch(err => {
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
            });
}

function getPlumesSourcesList(feature) {
    return dispatch =>
        fetch(
            appConfig.URLS.sourceListQueryEndpoint.replace("{source_id}", feature.get("source_id"))
        )
            .then(res => res.json())
            .then(data => dispatch({ type: types.UPDATE_FEATURE_DETAIL_PLUME_LIST, data }))
            .catch(err => {
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
            });
}

export function setFeatureDetail(category, feature) {
    return dispatch => {
        // Fetch metadata from backend if this is an VISTA feature
        if (category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE) {
            dispatch({ type: types.VISTA_METADATA_LOADING });
            getVistaMetadata(feature, dispatch);
        }

        dispatch({ type: types.FEATURE_DETAIL_PLUME_LIST_LOADING });
        dispatch({ type: types.UPDATE_FEATURE_DETAIL, category, feature });

        // Send analytics info
        dispatch({
            type:
                category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                    ? types.OPEN_PLUME_DETAIL
                    : types.OPEN_INFRASTRUCTURE_DETAIL
        });

        switch (category) {
            case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
                dispatch(getVistaPlumesList(feature));
                break;
            case layerSidebarTypes.CATEGORY_PLUMES:
                dispatch(getPlumesSourcesList(feature));
                break;
        }
    };
}

function getVistaMetadata(feature, dispatch) {
    fetch(appConfig.URLS.vistaDetailEndpoint.replace("{vista_id}", feature.get("id")))
        .then(res => res.json())
        .then(json =>
            dispatch({
                type: types.UPDATE_VISTA_METADATA,
                data: json.features[0].properties.metadata
            })
        );
}

function vistaGlobalSearch(dispatch) {
    return (dispatch, getState) => {
        const searchString = getState().layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
            "filters",
            layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME,
            "selectedValue"
        ]);

        if (searchString === "")
            return dispatch({ type: types.UPDATE_INFRA_GLOBAL_RESULTS, data: null });

        fetch(appConfig.URLS.vistaDetailEndpoint.replace("{vista_id}", searchString))
            .then(res => res.json())
            .then(json => dispatch({ type: types.UPDATE_INFRA_GLOBAL_RESULTS, data: json }));
    };
}

function getSourceList(category, feature) {
    switch (category) {
        case layerSidebarTypes.CATEGORY_PLUMES:
            return [feature.get("sourceId")];
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            return feature
                .get("sources")
                .map(src => src.get("id"))
                .toArray()
                .reduce((acc, src) => {
                    if (!acc.includes(src)) acc.push(src);
                    return acc;
                }, []);
    }
}

export function hideFeatureDetail() {
    return { type: types.HIDE_FEATURE_DETAIL };
}

function updateFeatureSearchResults(category) {
    return { type: types.UPDATE_FEATURE_SEARCH_RESULTS, category };
}

export function updateInfrastructureCategoryFilter(layerName, active) {
    return (dispatch, getState) => {
        const map = getState().map.getIn(["maps", "openlayers"]);
        const initialFeaturesLength = map.getVisibleVistaFeatures().length;
        const layer = getState().map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA, layerName]);

        const layersToAdd = [layer];
        if (layer.get("id") === layerSidebarTypes.VISTA_2017_OILGAS_FIELDS)
            layersToAdd.push(
                getState().map.getIn([
                    "layers",
                    appStrings.LAYER_GROUP_TYPE_DATA,
                    layerSidebarTypes.VISTA_2017_OILGAS_WELLS
                ])
            );

        layersToAdd.forEach(layer => {
            dispatch(setGroupLayerActive(layer, active));
            if (
                getState()
                    .map.get("groups")
                    .find(group => group.get("id") === layer.get("group"))
                    .get("isActive")
            ) {
                dispatch(coreMapActions.setLayerActive(layer.get("id"), active));
            }
        });

        dispatch(setActiveFeatureCategories(layerName, active));

        // This is kind of grody, but there's no other good way I can find to know exactly when the
        // Oil Wells layer has been made visible and its data available to the sidebar.
        let counter = 0;
        let checkForUpdatedList = setInterval(_ => {
            const featuresLength = map.getVisibleVistaFeatures().length;
            counter++;
            if (counter <= 8 && featuresLength === initialFeaturesLength) return;
            dispatch(mapActions.updateVistaFeatures());
            clearInterval(checkForUpdatedList);
        }, 250);
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

function updatePlumes(dispatch, getState) {
    dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
    const visiblePlumes = getState().layerSidebar.getIn([
        "searchState",
        layerSidebarTypes.CATEGORY_PLUMES,
        "searchResults"
    ]);
    getState()
        .map.getIn(["maps", "openlayers"])
        .setVisiblePlumes(visiblePlumes);
}

export function setPlumeFilter(key, selectedValue) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_PLUME_FILTER, key, selectedValue });
        updatePlumes(dispatch, getState);

        if (selectedValue && selectedValue.get("value") === "Plume Emissions") {
            dispatch({ type: types.SORT_PLUMES_BY_EMISSIONS });
        }
    };
}

export function setPlumeDateFilter(startDate, endDate) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_PLUME_DATE_FILTER, startDate, endDate });
        updatePlumes(dispatch, getState);
    };
}

export function setPlumeTextFilter(selectedValue) {
    return {
        type: types.SET_PLUME_FILTER,
        key: layerSidebarTypes.PLUME_FILTER_PLUME_ID,
        selectedValue
    };
}

export function applyPlumeTextFilter() {
    return (dispatch, getState) => {
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
        const visiblePlumes = getState().layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "searchResults"
        ]);
        getState()
            .map.getIn(["maps", "openlayers"])
            .setVisiblePlumes(visiblePlumes);
        // Trigger global search
        dispatch(plumesGlobalSearch());
    };
}

function plumesGlobalSearch(dispatch) {
    return (dispatch, getState) => {
        const searchString = getState().layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "filters",
            layerSidebarTypes.PLUME_FILTER_PLUME_ID,
            "selectedValue"
        ]);

        if (searchString === "")
            return dispatch({ type: types.UPDATE_PLUME_GLOBAL_RESULTS, data: [] });

        fetch(appConfig.URLS.avirisGlobalSearchEndpoint.replace("{source_id}", searchString))
            .then(res => res.json())
            .then(json => dispatch({ type: types.UPDATE_PLUME_GLOBAL_RESULTS, data: json }));
    };
}

export function setInfraTextFilter(selectedValue) {
    return {
        type: types.SET_INFRASTRUCTURE_FILTER,
        key: layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME,
        selectedValue
    };
}

export function applyInfraTextFilter() {
    return (dispatch, getState) => {
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
        getState()
            .map.getIn(["maps", "openlayers"])
            .setVisibleInfrastructure(getState().layerSidebar);
        // Trigger global search
        dispatch(vistaGlobalSearch());
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
