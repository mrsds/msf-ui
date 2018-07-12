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
import * as asyncActions from "_core/actions/asyncActions";
import Immutable from "immutable";

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
                if (inGroup && shouldSwitch) {
                    dispatch(mapActions.setLayerActive(layer.get("id"), active));
                }
            });
    };
}

function setGroupActiveState(group, active) {
    return { type: typesMSF.SET_GROUP_ACTIVE, group, active };
}

export function resizeMap() {
    return { type: typesMSF.RESIZE_MAP };
}

export function updateVistaFeatureList() {
    return (dispatch, getState) => {
        const map = getState().map.getIn(["maps", "openlayers"]);
        const vistaFeatures = map.getVisibleVistaFeatures();

        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, vistaFeatures));
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    };
}

export function updateFeatureList_Map(category) {
    return (dispatch, getState) => {
        const mapState = getState().map;
        const layerSidebarState = getState().layerSidebar;

        const map = getState().map.getIn(["maps", "openlayers"]);
        const extent = mapState.getIn(["view", "extent"]);

        const vistaFeatures = map.getVisibleVistaFeatures();
        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, vistaFeatures));
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));

        // updateInfrastructure(dispatch, mapState, layerSidebarState, extent);
        updatePlumes(dispatch, mapState, layerSidebarState, extent, category);
    };
}

function updatePlumes(dispatch, mapState, layerSidebarState, extent, category) {
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
                MapUtilExtended.buildAvirisFeatureQueryString(extent),
                dispatch
            );
        }
    }
}

function updateInfrastructure(dispatch, mapState, layerSidebarState, extent) {
    const infrastructureLayerActive = mapState
        .get("groups")
        .find(group => group.get("id") === "VISTA")
        .get("isActive");

    // If VISTA isn't active or there are no sub-categories selected, clear out the features list.
    if (
        !infrastructureLayerActive ||
        layerSidebarState.get("activeInfrastructureSubCategories").every(val => !val)
    ) {
        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, null));
        dispatch(updateAvailableOilWells(null));
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
        return;
    }

    requestAvailableFeatures(
        layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
        MapUtilExtended.buildVistaFeatureQueryString(
            extent,
            layerSidebarState.get("activeInfrastructureSubCategories")
        ),
        dispatch
    );

    // If wells are active, handle those separately.
    const wellsSelected = layerSidebarState.getIn([
        "activeInfrastructureSubCategories",
        layerSidebarTypes.VISTA_2017_OILGAS_FIELDS
    ]);

    console.log(
        mapState
            .getIn(["maps", "openlayers"])
            .map.getView()
            .getZoom()
    );
    const wellsVisible =
        mapState
            .getIn(["maps", "openlayers"])
            .map.getView()
            .getZoom() >= appConfig.OIL_WELLS_MIN_ZOOM;

    if (wellsSelected && wellsVisible) {
        getWells(dispatch, mapState);
    } else {
        dispatch(updateAvailableOilWells(null));
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    }
}

function getActiveInfrastructureSubCategories(layerSidebarState, mapState) {
    let activeSubCategories = layerSidebarState.get("activeInfrastructureSubCategories");
    const wellsActive = activeSubCategories.some(
        (_, cat) => cat === layerSidebarTypes.VISTA_2017_OILGAS_WELLS
    );
    const wellsVisible =
        mapState
            .getIn(["maps", "openlayers"])
            .map.getView()
            .getZoom() > appConfig.OIL_WELLS_MIN_ZOOM;
    if (wellsActive && !wellsVisible) {
        activeSubCategories = activeSubCategories.filter(
            (_, cat) => cat !== layerSidebarTypes.VISTA_2017_OILGAS_WELLS
        );
    }
    return activeSubCategories;
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

function requestAvailableFeatures(category, queryUrl, dispatch) {
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

function getWells(dispatch, mapState) {
    return MiscUtil.asyncFetch({
        url: MapUtilExtended.buildVistaFeatureQueryString(
            mapState.getIn(["view", "extent"]),
            Immutable.fromJS({ [layerSidebarTypes.VISTA_2017_OILGAS_WELLS]: true })
        ),
        handleAs: appStrings.FILE_TYPE_TEXT
    }).then(
        data => {
            dispatch(updateAvailableOilWells(data));
            dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
        },
        err => {
            console.warn("Error getting oil well features for current view bbox:", err);
            dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
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

function updateAvailableOilWells(data) {
    return {
        type: typesMSF.UPDATE_OIL_WELLS,
        data
    };
}

function getQueryString(category, extent, layerSidebarState, mapState) {
    switch (category) {
        case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
            return MapUtilExtended.buildVistaFeatureQueryString(
                extent,
                layerSidebarState,
                mapState
            );
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
    return (dispatch, getState) => {
        // dispatch(featureDetailActions.hideFeatureDetailContainer());
        dispatch(closeFeaturePicker());
        revealAllPlumes(getState().map);
        revealAllInfrastructure(getState().map);
        dispatch(clearFeatureLabels());
        dispatch(updateFeatureLabel(category, feature));
        updateHighlightedPlumes(getState);
    };
}

export function incrementActivePlume(increment) {
    return (dispatch, getState) => {
        // Using getState here since we'll have to do some actions
        // that fall outside of a single reducer's scope
        const layerSidebarState = getState().layerSidebar;
        const searchResults = layerSidebarState.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "searchResults"
        ]);
        // If active feature and it's a plume, incr/decr
        const activePlume =
            layerSidebarState.getIn(["activeFeature", "category"]) ===
            layerSidebarTypes.CATEGORY_PLUMES
                ? layerSidebarState.getIn(["activeFeature", "feature"])
                : null;
        if (activePlume) {
            let activePlumeIndex = searchResults.findIndex(
                x => x.get("id") === activePlume.get("id")
            );
            if (activePlumeIndex > -1) {
                let nextActivePlume;
                if (increment) {
                    if (activePlumeIndex < searchResults.size) {
                        let idx = activePlumeIndex + 1;
                        nextActivePlume = searchResults.get(idx);
                    }
                } else {
                    if (activePlumeIndex > 0) {
                        let idx = activePlumeIndex - 1;
                        nextActivePlume = searchResults.get(idx);
                    }
                }
                if (nextActivePlume) {
                    dispatch(
                        toggleFeatureLabel(layerSidebarTypes.CATEGORY_PLUMES, nextActivePlume)
                    );
                    updateHighlightedPlumes(getState);
                }
            } else {
                console.warn("Warning: unable to find active plume in search results", activePlume);
            }
        }
        return { type: types.NO_ACTION };
    };
}

export function selectFeatureInSidebar(id) {
    return { type: typesMSF.SELECT_FEATURE_IN_SIDEBAR, id };
}

export function pixelClick(clickEvt) {
    return (dispatch, getState) => {
        const mapState = getState().map.getIn(["maps", "openlayers"]).map;
        const layerSidebarState = getState().layerSidebar;
        const vistaFeatures = getVistaFeaturesAtPixel(clickEvt, mapState, layerSidebarState);
        const avirisFeatures = getAvirisFeaturesAtPixel(clickEvt, mapState, layerSidebarState);
        // Update the layer destacking list
        dispatch({
            type: typesMSF.UPDATE_FEATURE_PICKER,
            clickEvt,
            infrastructure: Immutable.List(vistaFeatures),
            plumes: Immutable.List(avirisFeatures)
        });
        const selectedFeature =
            (!vistaFeatures.length && avirisFeatures.length === 1 && avirisFeatures[0]) ||
            (!avirisFeatures.length && vistaFeatures.length === 1 && vistaFeatures[0]);

        const category =
            (avirisFeatures.length && layerSidebarTypes.CATEGORY_PLUMES) ||
            (vistaFeatures.length && layerSidebarTypes.CATEGORY_INFRASTRUCTURE);

        dispatch(clearFeatureLabels());
        if (selectedFeature) {
            dispatch(updateFeatureLabel(category, selectedFeature));
        }

        updateHighlightedPlumes(getState);
        return { type: types.PIXEL_CLICK, clickEvt };

        // const category = getState().layerSidebar.get("activeFeatureCategory");
        // const selectedFeatureId = getPixelFeatureId(clickEvt, getState().map, category);
        // const selectedFeature = getFeatureById(
        //     getState().layerSidebar,
        //     category,
        //     selectedFeatureId
        // );
        // dispatch(clearFeatureLabels());
        // if (selectedFeature) {
        //     dispatch(updateFeatureLabel(category, selectedFeature));
        // }
        // updateHighlightedPlumes(getState);
        // return { type: types.PIXEL_CLICK, clickEvt };
    };
}

function getVistaFeaturesAtPixel(clickEvt, mapState, layerSidebarState) {
    let features = [];
    mapState.forEachFeatureAtPixel(
        clickEvt.pixel,
        feature => {
            const featureInfo = layerSidebarState
                .getIn(["searchState", layerSidebarTypes.CATEGORY_INFRASTRUCTURE, "searchResults"])
                .find(f => f.get("id") === feature.get("id"));
            if (featureInfo) features.push(featureInfo);
        },
        {
            hitTolerance: 3,
            layerFilter: function(l) {
                return l.get("_layerGroup") === "VISTA";
            }
        }
    );
    return features;
}

function getAvirisFeaturesAtPixel(clickEvt, mapState, layerSidebarState) {
    const featureIds = [];
    // Get aviris images
    mapState.forEachLayerAtPixel(clickEvt.pixel, layer => {
        if (layer.get("_featureType") === "plume") featureIds.push(layer.get("_featureId"));
    });
    // Get aviris icons
    mapState.forEachFeatureAtPixel(clickEvt.pixel, feature => {
        if (feature.get("_featureType") === "icon") {
            const featureId = feature.get("_featureId");
            // Only add if we haven't gotten the id from the image by chance
            if (featureIds.indexOf(featureId) === -1) {
                featureIds.push(featureId);
            }
        }
    });
    return featureIds.map(id =>
        layerSidebarState
            .getIn(["searchState", layerSidebarTypes.CATEGORY_PLUMES, "searchResults"])
            .find(f => f.get("id") === id)
    );
}

function getPixelFeatureId(clickEvt, mapState, category) {
    if (mapState.getIn(["view", "in3DMode"])) {
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

export function updateGriddedDate(date) {
    return { type: typesMSF.UPDATE_GRIDDED_DATE, date };
}

export function incrementGriddedDate(period, goBack) {
    return { type: typesMSF.INCREMENT_GRIDDED_DATE, period, goBack };
}

export function getAvailableGriddedDates() {
    return dispatch => {
        dispatch(setGriddedDateAvailabilityLoadingAsync(true, false));
        return MiscUtil.asyncFetch({
            url: appConfig.URLS.availableGriddedDates,
            handleAs: "json"
        }).then(
            data => {
                dispatch(updateAvailableGriddedDates(data));
                dispatch(setGriddedDateAvailabilityLoadingAsync(false, false));
            },
            err => {
                console.warn("Error getting available gridded layer dates:", err);
                dispatch(setGriddedDateAvailabilityLoadingAsync(false, true));
                dispatch(
                    alertActions.addAlert({
                        title: appStringsMSF.ALERTS.AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED.title,
                        body: appStringsMSF.ALERTS.AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED,
                        severity:
                            appStringsMSF.ALERTS.AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED.severity,
                        time: new Date()
                    })
                );
            }
        );
    };
}

function updateAvailableGriddedDates(dateList) {
    return { type: typesMSF.UPDATE_AVAILABLE_GRIDDED_DATES, dateList };
}

export function loadInitialData(callback = null) {
    return dispatch => {
        // Set flag that initial layer data has begun loading
        dispatch(setInitialDataLoadingAsync(true, false));
        // Fetch all initial layer data
        return Promise.all([
            dispatch(mapActions.loadLayerData()),
            dispatch(mapActions.loadPaletteData()),
            dispatch(getAvailableGriddedDates())
        ]).then(
            () => {
                // Set flag that initial layer data has finished loading
                dispatch(setInitialDataLoadingAsync(false, false));
                if (typeof callback === "function") {
                    callback.call(this);
                }
            },
            err => {
                console.warn("Error in mapActions.loadInitialData:", err);
                dispatch(
                    alertActions.addAlert({
                        title: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.title,
                        body: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.formatString,
                        severity: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.severity,
                        time: new Date()
                    })
                );
                dispatch(setInitialDataLoadingAsync(false, true));
                if (typeof callback === "function") {
                    callback.call(this);
                }
            }
        );
    };
}

function setGriddedDateAvailabilityLoadingAsync(loading, failed) {
    return asyncActions.setAsyncLoadingState("griddedDateAvailabilityAsync", {
        loading: loading,
        failed: failed
    });
}

function setInitialDataLoadingAsync(loading, failed) {
    return asyncActions.setAsyncLoadingState("initialDataAsync", {
        loading: loading,
        failed: failed
    });
}

export function closeFeaturePicker() {
    return {
        type: typesMSF.UPDATE_FEATURE_PICKER,
        clickEvt: null,
        infrastructure: Immutable.List([]),
        plumes: Immutable.List([])
    };
}

export function setActivePickerFeature(category, feature) {
    return { type: typesMSF.SET_ACTIVE_PICKER_FEATURE, feature, category };
}

function revealAllPlumes(mapState) {
    mapState.get("maps").map(map => {
        map.setActivePlumes([]);
        map.togglePlumeIcons();
    });
}

function revealAllInfrastructure(mapState) {
    mapState.get("maps").map(map => map.setActiveInfrastructure([]));
}
