import * as types from "_core/constants/actionTypes";
import * as typesMSF from "constants/actionTypes";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import MetadataUtil from "utils/MetadataUtil";
import Immutable from "immutable";
import * as MSFTypes from "constants/MSFTypes";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStringsMSF from "constants/appStrings";
import * as alertActions from "_core/actions/alertActions";
import * as mapActions from "actions/mapActions";

export function changeAnalyticsMode(mode) {
    return { type: typesMSF.CHANGE_ANALYTICS_MODE, mode };
}

export function changeFilterSelectedArea(areaName) {
    return (dispatch, getState) => {
        dispatch(updateFilterSelectedArea(areaName));
        dispatch(updateActiveAnalyticsTab());
    };
}

function updateFilterSelectedArea(areaName) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_AREA, areaName };
}

export function changeFilterSector(sector) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SECTOR, sector });
        dispatch(updateActiveAnalyticsTab(getState));
    };
}

export function changeFilterSubsector(subsector) {
    return (dispatch, getState) => {
        if (subsector) {
            dispatch({
                type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SECTOR,
                sector: getState()
                    .MSFAnalytics.get("sectorOptionsList")
                    .find(sector => sector.get("sector_level_2") === subsector)
                    .get("sector_level_1")
            });
        }
        dispatch({ type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SUBSECTOR, subsector });
        dispatch(updateActiveAnalyticsTab(getState));
    };
}

export function changeFilterUnits(units) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_UNITS, units };
}

export function fetchDetectionStats() {
    return (dispatch, getState) => {
        dispatch(detectionStatsLoading(true));
        const startDate = getState().MSFAnalytics.getIn(["filterOptions", "startDate"]);
        const endDate = getState().MSFAnalytics.getIn(["filterOptions", "endDate"]);
        let url = appConfig.URLS.detectionStatsEndpoint
            .replace(
                "{county}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedArea"]) || ""
            )
            .replace(
                "{sector_level_1}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedSector"]) || ""
            )
            .replace(
                "{sector_level_2}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]) || ""
            );
        url += startDate ? `&from_date=${startDate.unix()}` : "";
        url += endDate ? `&to_date=${endDate.unix()}` : "";
        return fetch(url)
            .then(res => res.json())
            .then(
                data => {
                    dispatch(updateDetectionStats(data));
                    dispatch(detectionStatsLoading(false));
                },
                err => {
                    dispatch(updateDetectionStats());
                    dispatch(detectionStatsLoading(false));
                    dispatch(
                        alertActions.addAlert({
                            title: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.title,
                            body: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED,
                            severity:
                                appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.severity,
                            time: new Date()
                        })
                    );
                }
            );
    };
}

function updateDetectionStats(data) {
    return { type: typesMSF.UPDATE_ANALYTICS_DETECTION_STATS, data };
}

function detectionStatsLoading(isLoading) {
    return { type: typesMSF.ANALYTICS_DETECTION_STATS_LOADING, isLoading };
}

export function fetchAreaSearchOptionsList() {
    return dispatch => {
        dispatch(areaSearchListOptionsLoading(true));
        fetch(appConfig.URLS.areaSearchOptionsListEndpoint)
            .then(res => res.json())
            .then(json => {
                dispatch(updateAreaSearchOptionsList(json));
                dispatch(areaSearchListOptionsLoading(false));
            })
            .catch(err => console.warn(`Error getting available county list.`, err));
    };
}

function updateAreaSearchOptionsList(data) {
    return { type: typesMSF.UPDATE_AREA_SEARCH_LIST, data };
}

function areaSearchListOptionsLoading(isLoading) {
    return { type: typesMSF.AREA_SEARCH_LIST_LOADING, isLoading };
}

export function fetchSectorOptionsList() {
    return dispatch => {
        dispatch(sectorOptionsListLoading(true));
        fetch(appConfig.URLS.sectorOptionsListEndpoint)
            .then(res => res.json())
            .then(json => {
                dispatch(updateSectorOptionsList(json));
                dispatch(sectorOptionsListLoading(false));
            })
            .catch(err => console.warn(`Error getting available sectors list.`, err));
    };
}

function updateSectorOptionsList(data) {
    return { type: typesMSF.UPDATE_SECTOR_OPTIONS_LIST, data };
}

function sectorOptionsListLoading(isLoading) {
    return { type: typesMSF.SECTOR_OPTIONS_LIST_LOADING, isLoading };
}

export function fetchSummaryData() {
    return (dispatch, getState) => {
        dispatch(summaryDataLoading(true));
        const startDate = getState().MSFAnalytics.getIn(["filterOptions", "startDate"]);
        const endDate = getState().MSFAnalytics.getIn(["filterOptions", "endDate"]);
        let url = appConfig.URLS.plumeSourceSummaryEndpoint
            .replace(
                "{county}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedArea"]) || ""
            )
            .replace(
                "{sector_level_1}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedSector"]) || ""
            )
            .replace(
                "{sector_level_2}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]) || ""
            );
        url += startDate ? `&from_date=${startDate.unix()}` : "";
        url += endDate ? `&to_date=${endDate.unix()}` : "";
        fetch(url)
            .then(res => res.json())
            .then(json => {
                dispatch(updateSummaryData(json));
                dispatch(summaryDataLoading(false));
            })
            .catch(err => {
                console.warn(`Error getting emissions summary data.`, err);
            });
    };
}

function summaryDataLoading(isLoading) {
    return { type: typesMSF.ANALYTICS_SUMMARY_DATA_LOADING, isLoading };
}
function updateSummaryData(data) {
    return { type: typesMSF.UPDATE_ANALYTICS_SUMMARY_DATA, data };
}

export function fetchEmissionsChartsData() {
    return (dispatch, getState) => {
        dispatch(emissionsChartsDataLoading(true));
        const startDate = getState().MSFAnalytics.getIn(["filterOptions", "startDate"]);
        const endDate = getState().MSFAnalytics.getIn(["filterOptions", "endDate"]);
        let url = appConfig.URLS.plumeSourceEndpoint
            .replace(
                "{county}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedArea"]) || ""
            )
            .replace(
                "{sector_level_1}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedSector"]) || ""
            )
            .replace(
                "{sector_level_2}",
                getState().MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]) || ""
            );
        url += startDate ? `&from_date=${startDate.unix()}` : "";
        url += endDate ? `&to_date=${endDate.unix()}` : "";
        fetch(url)
            .then(res => res.json())
            .then(json => {
                dispatch(updateEmissionsChartsData(json));
                dispatch(emissionsChartsDataLoading(false));
            })
            .catch(err => {
                console.warn(`Error getting emissions charts data.`, err);
            });
    };
}

function getSourceList(data) {
    return data.features.reduce((acc, feature) => {
        MetadataUtil.getSourceList(Immutable.fromJS(feature.properties)).forEach(source => {
            const result = {
                id: source.get("id"),
                nearestFacility: source.get("nearest_facility")
            };
            if (!acc.includes(result)) acc.push(result);
        });
        return acc;
    }, []);
}

function getImeList({ id, nearestFacility }) {
    return new Promise((resolve, reject) =>
        fetch(appConfig.URLS.plumeListQueryEndpoint.replace("{source_id}", id))
            .then(data => data.json())
            .then(data => {
                resolve({
                    id,
                    imeList: data.reduce((acc, flyover) => {
                        if (flyover.plumes.length) {
                            flyover.plumes.forEach(plume => acc.push(plume.ime_20));
                        }
                        return acc;
                    }, []),
                    nearestFacility
                });
            })
    );
}

function getSubcategoryList(getState) {
    const sector = getState().MSFAnalytics.getIn(["filterOptions", "selectedSector"]);

    if (!sector)
        return Object.keys(layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES).map(key => {
            return { name: key, id: layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[key] };
        });

    const subsector = getState().MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]);

    if (!subsector)
        return layerSidebarTypes.INFRASTRUCTURE_GROUPS[sector.toLowerCase()].categories.map(cat => {
            return { name: cat, id: layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[cat] };
        });

    return { name: subsector, id: layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[subsector] };
}

function emissionsChartsDataLoading(isLoading) {
    return { type: typesMSF.ANALYTICS_EMISSIONS_CHARTS_DATA_LOADING, isLoading };
}

function updateEmissionsChartsData(data) {
    return { type: typesMSF.UPDATE_ANALYTICS_EMISSIONS_CHARTS_DATA, data };
}

export function changeDate(isStart, date) {
    return dispatch => {
        dispatch({ type: typesMSF.CHANGE_ANALYTICS_DATE, isStart, date });
    };
}

export function updateActiveAnalyticsTab() {
    return (dispatch, getState) => {
        switch (getState().MSFAnalytics.get("analyticsMode")) {
            case MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS:
                return dispatch(fetchDetectionStats());
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO:
                return dispatch(fetchSummaryData());
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_CHARTS:
                return dispatch(fetchEmissionsChartsData());
        }
    };
}

export function openMapToInfrastructure(featureName) {
    return (dispatch, getState) => {
        const feature = getState()
            .map.getIn(["maps", "openlayers"])
            .getFeatureByName(featureName, "VISTA");
        if (!feature) return { type: types.NO_ACTION };
        dispatch({ type: typesMSF.CHANGE_APP_MODE, mode: MSFTypes.APP_MODE_MAP });
        dispatch(mapActions.centerMapOnFeature(feature, "VISTA"));
    };
}
