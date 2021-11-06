import Cookies from "universal-cookie";
import Immutable from "immutable";
import Ol_Extent from "ol/extent";

import * as MSFTypes from "constants/MSFTypes";
import MiscUtil from "_core/utils/MiscUtil";
import * as alertActions from "_core/actions/alertActions";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import * as asyncActions from "_core/actions/asyncActions";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as mapActions from "_core/actions/mapActions";
import * as types from "_core/constants/actionTypes";
import * as typesMSF from "constants/actionTypes";

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
            .forEach((layer) => {
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

export function updatingVistaLayer() {
    return availableFeatureListLoading(layerSidebarTypes.CATEGORY_INFRASTRUCTURE);
}

export function updateVistaFeatureList() {
    return (dispatch, getState) => {
        const map = getState().map.getIn(["maps", "openlayers"]);
        const vistaFeatures = map.getVisibleVistaFeatures();
        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, vistaFeatures));
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    };
}

export function updatingAvirisLayer() {
    return availableFeatureListLoading(layerSidebarTypes.CATEGORY_PLUMES);
}

export function updateAvirisFeatureList() {
    return (dispatch, getState) => {
        const map = getState().map.getIn(["maps", "openlayers"]);
        const avirisFeatures = map.getVisibleAvirisFeatures();
        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_PLUMES, avirisFeatures));
    };
}

export function avirisLayerLoaded() {
    return (dispatch) => {
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_PLUMES));
        return updateFeatureList_Map(layerSidebarTypes.CATEGORY_PLUMES);
    };
}

export function vistaLayersLoaded() {
    return (dispatch, getState) => {
        dispatch(availableFeatureListLoaded(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
        return updateFeatureList_Map(layerSidebarTypes.CATEGORY_INFRASTRUCTURE);
    };
}

export function updateFeatureList_Map() {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.START_FEATURE_LOADING });
        dispatch(updateVistaFeatures());
        dispatch(updateAvirisFeatures());
    };
}

export function updateVistaFeatures() {
    return (dispatch, getState) => {
        const map = getState().map.getIn(["maps", "openlayers"]);
        const currentRes = map.map.getView().getResolution();

        const vistaFeatures = map
            .getVisibleVistaFeatures()
            .filter(
                (f) =>
                    currentRes <= appConfig.OIL_WELL_MAX_RESOLUTION ||
                    f.getProperties().category_id !==
                        layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[
                            layerSidebarTypes.VISTA_2017_OILGAS_WELLS
                        ]
            );
        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_INFRASTRUCTURE, vistaFeatures));
    };
}

export function updateAvirisFeatures() {
    return (dispatch, getState) => {
        const map = getState().map.getIn(["maps", "openlayers"]);
        const avirisFeatures = map.getVisibleAvirisFeatures();
        dispatch(updateAvailableFeatures(layerSidebarTypes.CATEGORY_PLUMES, avirisFeatures));
    };
}

function availableLayerListLoading() {
    return { type: typesMSF.AVAILABLE_LAYER_LIST_LOADING };
}

function availableFeatureListLoading(category) {
    return { type: typesMSF.AVAILABLE_LAYER_LIST_LOADING, category };
}

// function setSdapLoading(sdapLoaded) {
//     return { type: typesMSF.UPDATE_SDAP_CHART_DATA, sdapLoaded };
// }

function setSdapChartLoading(loading, failed) {
    return asyncActions.setAsyncLoadingState("sdapChartAsync", {
        loading: loading,
        failed: failed,
    });
}

function updateSdapChartData(data) {
    return { type: typesMSF.UPDATE_SDAP_CHART_DATA, data };
}

function updateSdapChartOptions(options) {
    return { type: typesMSF.UPDATE_SDAP_CHART_OPTIONS, options };
}

export function getSdapChartData(url) {
    return (dispatch, getState) => {
        dispatch(setSdapChartLoading(true, false));
        // const sdapChartData = getState().map.getIn(["sdapChart", "data"]);
        // const sdapChartOptions = getState().map.getIn(["sdapChart", "options"]);
        return MiscUtil.asyncFetch({
            url: url,
            handleAs: "json",
            options: { credentials: "same-origin" }
        }).then(
            (sdapData) => {
            console.log(sdapData);
            let chartData = sdapData.data.map(coord => {
                console.log(coord);
                return {
                    x: coord[0].time,
                    y: coord[0].mean
                };
            });
            const data = {
                datasets: [{
                data: chartData,
                backgroundColor: 'rgb(255, 99, 132)'
                }],
            };
            const options = {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                quarter: 'MMM YYYY'
                            }
                        }
                    }
                }
            };
            dispatch(updateSdapChartData(data));
            dispatch(updateSdapChartOptions(options));
            dispatch(setSdapChartLoading(false, false));
        },
        (err) => {
            console.warn("Error getting SDAP data for plot:", err);
            dispatch(setSdapChartLoading(false, true));
        });
    }
}

let loadTimer;
function availableFeatureListLoaded(category) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.AVAILABLE_LAYER_LIST_LOADED, category });
        if (
            getState()
                .asynchronous.get("loadingFeatures")
                .every((v) => !v)
        ) {
            window.clearTimeout(loadTimer);
            loadTimer = setTimeout((_) => {
                const timeElapsed = Date.now() - getState().asynchronous.get("loadStart") - 1000;
                dispatch({
                    type: typesMSF.LOAD_TIME_ON_MOVE,
                    analyticsValue: timeElapsed,
                    isAnalyticsTiming: true,
                });
            }, 1000);
        }
    };
}

function updateAvailableFeatures(category, featureList) {
    return {
        type: typesMSF.UPDATE_AVAILABLE_FEATURES,
        category,
        featureList,
    };
}

export function centerMapOnPoint(coords) {
    return { type: typesMSF.CENTER_MAP_ON_POINT, coords };
}

export function centerMapOnFeature(feature, featureType) {
    return { type: typesMSF.CENTER_MAP_ON_FEATURE, feature, featureType };
}

export function toggleFeatureLabel(category, feature) {
    return (dispatch, getState) => {
        const clickEvt = {};
        clickEvt.pixel = getState()
            .map.getIn(["maps", "openlayers"])
            .map.getPixelFromCoordinate(Ol_Extent.getCenter(feature.get("geometry").getExtent()));

        dispatch({
            type: typesMSF.UPDATE_FEATURE_PICKER,
            clickEvt,
            infrastructure: Immutable.List(
                category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE ? [feature] : []
            ),
            plumes: Immutable.List(category === layerSidebarTypes.CATEGORY_PLUMES ? [feature] : []),
        });
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
            "searchResults",
        ]);
        // If active feature and it's a plume, incr/decr
        const activePlume =
            layerSidebarState.getIn(["activeFeature", "category"]) ===
            layerSidebarTypes.CATEGORY_PLUMES
                ? layerSidebarState.getIn(["activeFeature", "feature"])
                : null;
        if (activePlume) {
            let activePlumeIndex = searchResults.findIndex(
                (x) => x.get("id") === activePlume.get("id")
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
            plumes: Immutable.List(avirisFeatures),
        });
        updateHighlightedPlumes(getState);
        return { type: types.PIXEL_CLICK, clickEvt };
    };
}

function getVistaFeaturesAtPixel(clickEvt, mapState, layerSidebarState) {
    let features = [];
    mapState.forEachFeatureAtPixel(
        clickEvt.pixel,
        (feature) => {
            const featureInfo = layerSidebarState
                .getIn(["searchState", layerSidebarTypes.CATEGORY_INFRASTRUCTURE, "searchResults"])
                .find((f) => f.get("id") === feature.get("id"));
            if (featureInfo) features.push(featureInfo);
        },
        {
            hitTolerance: 3,
            layerFilter: function (l) {
                return l.get("_layerGroup") === "VISTA";
            },
        }
    );
    return features;
}

function getAvirisFeaturesAtPixel(clickEvt, mapState, layerSidebarState) {
    const features = [];
    mapState.forEachFeatureAtPixel(
        clickEvt.pixel,
        (feature) => {
            const featureInfo = layerSidebarState
                .getIn(["searchState", layerSidebarTypes.CATEGORY_PLUMES, "searchResults"])
                .find((f) => f.get("id") === feature.get("id"));
            if (featureInfo) features.push(featureInfo);
        },
        {
            hitTolerance: 3,
            layerFilter: function (l) {
                return l.get("_layerId") === "AVIRIS";
            },
        }
    );
    return features;
}

function updateFeatureLabel(category, feature) {
    return {
        type: typesMSF.TOGGLE_FEATURE_LABEL,
        category,
        feature,
    };
}

function clearFeatureLabels() {
    return (dispatch, getState) => {
        dispatch({
            type: typesMSF.CLEAR_FEATURE_LABELS,
            feature: getState().map.get("activeFeature"),
        });
    };
}

function getFeatureById(sidebarState, category, id) {
    return sidebarState
        .getIn(["searchState", category, "searchResults"])
        .find((feature) => feature.get("id") === id);
}

function updateHighlightedPlumes(getState) {
    const selectedPlume =
        getState().layerSidebar.getIn(["activeFeature", "category"]) ===
        layerSidebarTypes.CATEGORY_PLUMES
            ? getState().layerSidebar.getIn(["activeFeature", "feature"])
            : null;
}

export function setHoverPlume(feature) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.SET_HOVER_PLUME, feature });
        dispatch({
            type: typesMSF.UPDATE_VISIBLE_PLUMES,
            features: feature
                ? [feature]
                : getState().layerSidebar.getIn([
                      "searchState",
                      layerSidebarTypes.CATEGORY_PLUMES,
                      "searchResults",
                  ]),
        });
    };
}

export function updateGriddedDate(date) {
    return (dispatch) => {
        dispatch({ type: typesMSF.UPDATE_GRIDDED_DATE, date });
        dispatch({ type: typesMSF.CHANGE_GRIDDED_DATE });
    };
}

export function incrementGriddedDate(period, goBack) {
    return (dispatch) => {
        dispatch({ type: typesMSF.INCREMENT_GRIDDED_DATE, period, goBack });
        dispatch({ type: typesMSF.CHANGE_GRIDDED_DATE });
    };
}

export function getAvailableGriddedDates() {
    return (dispatch, getState) => {
        dispatch(setGriddedDateAvailabilityLoadingAsync(true, false));
        const activeGriddedLayer = getState().map.getIn(["griddedSettings", "activeLayer"]);

        return MiscUtil.asyncFetch({
            url: appConfig.GRIDDED_LAYER_TYPES.find((l) => l.name === activeGriddedLayer)
                .dateEndpoint,
            handleAs: "json",
            options: { credentials: "same-origin" },
        }).then(
            (data) => {
                dispatch(updateAvailableGriddedDates(data));
                dispatch(setGriddedDateAvailabilityLoadingAsync(false, false));
            },
            (err) => {
                console.warn("Error getting available gridded layer dates:", err);
                dispatch(setGriddedDateAvailabilityLoadingAsync(false, true));
                dispatch(
                    alertActions.addAlert({
                        title: appStringsMSF.ALERTS.AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED.title,
                        body: appStringsMSF.ALERTS.AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED,
                        severity:
                            appStringsMSF.ALERTS.AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED.severity,
                        time: new Date(),
                    })
                );
            }
        );
    };
}

function updateAvailableGriddedDates(dateList) {
    return { type: typesMSF.UPDATE_AVAILABLE_GRIDDED_DATES, dateList };
}

export function changeActiveGriddedLayer(name, active) {
    return (dispatch, getState) => {
        const paletteName = getState()
            .map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA])
            .find((l) => l.get("id") === name)
            .getIn(["palette", "name"]);
        const palette = getState()
            .map.get("palettes")
            .find((p) => p.get("id") === paletteName);

        dispatch({
            type: typesMSF.CHANGE_ACTIVE_GRIDDED_LAYER,
            name,
            palette,
            analyticsLabel: name,
            analyticsIgnore: active,
        });
        dispatch(getAvailableGriddedDates());
    };
}

export function loadInitialData(callback = null) {
    return (dispatch) => {
        // Set flag that initial layer data has begun loading
        dispatch(setInitialDataLoadingAsync(true, false));
        // Fetch all initial layer data
        return Promise.all([
            dispatch(mapActions.loadLayerData()),
            dispatch(mapActions.loadPaletteData()),
            dispatch(getAvailableGriddedDates()),
        ]).then(
            () => {
                // Set flag that initial layer data has finished loading
                dispatch(setInitialDataLoadingAsync(false, false));
                if (typeof callback === "function") {
                    callback.call(this);
                }
            },
            (err) => {
                console.warn("Error in mapActions.loadInitialData:", err);
                dispatch(
                    alertActions.addAlert({
                        title: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.title,
                        body: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.formatString,
                        severity: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.severity,
                        time: new Date(),
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
        failed: failed,
    });
}

function setInitialDataLoadingAsync(loading, failed) {
    return asyncActions.setAsyncLoadingState("initialDataAsync", {
        loading: loading,
        failed: failed,
    });
}

export function closeFeaturePicker() {
    return {
        type: typesMSF.UPDATE_FEATURE_PICKER,
        clickEvt: null,
        infrastructure: Immutable.List([]),
        plumes: Immutable.List([]),
    };
}

export function setActivePickerFeature(category, feature) {
    return { type: typesMSF.SET_ACTIVE_PICKER_FEATURE, feature, category };
}

function revealAllInfrastructure(mapState) {
    mapState.get("maps").map((map) => map.setActiveInfrastructure([]));
}

export function toggleHomeSelectMenuOpen(open) {
    // if (open && !getCookie()) {
    //     return { type: typesMSF.SHOW_COOKIE_MODAL, visible: true };
    // }
    return { type: typesMSF.TOGGLE_HOME_SELECT_MENU_OPEN, open };
}

function getCookie() {
    const cookies = new Cookies();
    return cookies.get("nasa_methane_source_finder_home_area");
}

function setCookie(params) {
    const cookies = new Cookies();
    return cookies.set("nasa_methane_source_finder_home_area", params);
}

export function setInitialHomeArea() {
    return (dispatch) => {
        const cookie = getCookie();
        const location = cookie ? cookie.location : MSFTypes.HOME_AREA_PERMIAN_BASIN;
        const extent = cookie ? cookie.extent : MSFTypes.EXTENTS_PERMIAN_BASIN;

        if (!cookie || !cookie.extent) dispatch(setHomeAreaPickerVisible(true));
        dispatch({ type: typesMSF.SET_HOME_AREA, location, extent });
        dispatch(mapActions.setMapView({ extent }, true));
    };
}

export function setHomeArea(location, extent) {
    return (dispatch, getState) => {
        if (!extent) {
            switch (location) {
                case MSFTypes.HOME_AREA_LOS_ANGELES:
                    extent = MSFTypes.EXTENTS_LOS_ANGELES;
                    break;
                case MSFTypes.HOME_AREA_SF_BAY:
                    extent = MSFTypes.EXTENTS_SF_BAY;
                    break;
                case MSFTypes.HOME_AREA_PERMIAN_BASIN:
                    extent = MSFTypes.EXTENTS_PERMIAN_BASIN;
                    break;
                case MSFTypes.HOME_AREA_CUSTOM:
                    extent = getState().map.getIn(["maps", "openlayers"]).getCurrentExtent();
                    break;
            }
        }
        dispatch({ type: typesMSF.SET_HOME_AREA, location, extent });
        if (getState().settings.get("acceptCookies")) {
            setCookie({ location, extent });
        }
    };
}

export function goToHome() {
    return (dispatch, getState) => {
        dispatch(
            mapActions.setMapView(
                {
                    extent: getState().settings.getIn(["homeArea", "extent"]).toJS(),
                },
                true
            )
        );
    };
}

export function toggleLocationInputModal(visible) {
    return { type: typesMSF.TOGGLE_LOCATION_INPUT_MODAL, visible };
}

export function openMapToLatLong(lat, long) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_APP_MODE, mode: MSFTypes.APP_MODE_MAP });
        getState().map.getIn(["maps", "openlayers"]).zoomToCoords([long, lat]);
    };
}

export function toggleGriddedLayerForMetrics(active) {
    if (active) {
        return { type: types.NO_ACTION };
    }
    return (dispatch, getState) =>
        dispatch({
            type: typesMSF.TOGGLE_GRIDDED_LAYER_ON,
            analyticsValue: getState().map.get("currentZoom"),
        });
}

export function mapMovedMetrics() {
    return (dispatch, getState) => {
        const map = getState().map;
        const previousZoom = map.get("previousZoom");
        const currentZoom = map.get("currentZoom");
        if (
            previousZoom &&
            previousZoom < currentZoom &&
            map.getIn(["maps", "openlayers"]).getGriddedLayers().length
        ) {
            dispatch({ type: typesMSF.ZOOM_IN_WITH_GRIDDED_LAYER_ON });
        }
        dispatch({ type: typesMSF.SET_PREVIOUS_ZOOM, zoom: currentZoom });
        dispatch({ type: types.NO_ACTION });
    };
}

export function toggleFlightLineLayer(active) {
    if (!active)
        return (dispatch, getState) =>
            dispatch({
                type: typesMSF.TOGGLE_FLIGHT_LINE_LAYER_ON,
                analyticsValue: getState().map.get("currentZoom"),
            });
    return { type: types.NO_ACTION };
}

export function setHomeAreaPickerVisible(visible) {
    return { type: typesMSF.SET_HOME_AREA_PICKER_VISIBLE, visible };
}
