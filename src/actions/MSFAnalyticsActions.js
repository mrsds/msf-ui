import Immutable from "immutable";

import * as MSFTypes from "constants/MSFTypes";
import MetadataUtil from "utils/MetadataUtil";
import * as alertActions from "_core/actions/alertActions";
import appConfig from "constants/appConfig";
import * as appStringsMSF from "constants/appStrings";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as typesMSF from "constants/actionTypes";

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

export function fetchVistaCategoryOptionsList() {
    return dispatch => {
        dispatch(vistaCategoryOptionsListLoading(true));
        fetch(appConfig.URLS.vistaCategoryOptionsListEndpoint)
            .then(res => res.json())
            .then(json => {
                dispatch(updateVistaCategoryOptionsList(json));
                dispatch(vistaCategoryOptionsListLoading(false));
            })
            .catch(err => console.warn(`Error getting available sectors list.`, err));
    };
}

function updateVistaCategoryOptionsList(data) {
    return { type: typesMSF.UPDATE_VISTA_CATEGORY_OPTIONS_LIST, data };
}

function vistaCategoryOptionsListLoading(isLoading) {
    return { type: typesMSF.VISTA_CATEGORY_OPTIONS_LIST_LOADING, isLoading };
}

export function fetchIpccSectorOptionsList() {
    return dispatch => {
        dispatch(ipccSectorOptionsListLoading(true));
        fetch(appConfig.URLS.ipccSectorOptionsListEndpoint)
            .then(res => res.json())
            .then(json => {
                dispatch(updateIpccSectorOptionsList(json));
                dispatch(ipccSectorOptionsListLoading(false));
            })
            .catch(err => console.warn(`Error getting available sectors list.`, err));
    };
}

function ipccSectorOptionsListLoading(isLoading) {
    return { type: typesMSF.IPCC_SECTOR_OPTIONS_LIST_LOADING, isLoading };
}

function updateIpccSectorOptionsList(data) {
    return { type: typesMSF.UPDATE_IPCC_SECTOR_OPTIONS_LIST, data };
}

function formatUrlWithSectorsAndDates(base_url, getState) {
    const startDate = getState().MSFAnalytics.getIn(["filterOptions", "startDate"]);
    const endDate = getState().MSFAnalytics.getIn(["filterOptions", "endDate"]);
    let url = base_url
        .replace("{county}", getState().MSFAnalytics.getIn(["filterOptions", "selectedArea"]) || "")
        .replace(
            "{vista_category}",
            getState().MSFAnalytics.getIn(["filterOptions", "selectedSector"]) || ""
        )
        .replace(
            "{sector_level_3}",
            getState().MSFAnalytics.getIn(["filterOptions", "selectedSubsector"]) || ""
        );
    url += startDate ? `&from_date=${startDate.unix()}` : "";
    url += endDate ? `&to_date=${endDate.unix()}` : "";
    return url;
}

function fetchSummaryData(dispatch, getState) {
    dispatch(summaryDataLoading(true));
    const summaryUrl = formatUrlWithSectorsAndDates(
        appConfig.URLS.plumeSourceSummaryEndpoint,
        getState
    );
    fetch(summaryUrl)
        .then(res => res.json())
        .then(json => {
            dispatch(updateSummaryData(json));
            dispatch(summaryDataLoading(false));
        })
        .catch(err => {
            console.warn(`Error getting emissions summary data.`, err);
        });
}

export function updateSummaryPageData() {
    return (dispatch, getState) => {
        fetchSummaryData(dispatch, getState);
        fetchEmissionsSourceData(dispatch, getState);
        dispatch(resetSummarySourcesPageIndex());
    };
}

function summaryDataLoading(isLoading) {
    return { type: typesMSF.ANALYTICS_SUMMARY_DATA_LOADING, isLoading };
}
function updateSummaryData(data) {
    return { type: typesMSF.UPDATE_ANALYTICS_SUMMARY_DATA, data };
}

function resetSummarySourcesPageIndex() {
    return { type: typesMSF.UPDATE_SUMMARY_PAGE_SOURCE_INDEX, index: 0 };
}

export function updateEmissionsCharts() {
    return (dispatch, getState) => {
        fetchEmissionsSourceData(dispatch, getState);
    };
}

function fetchEmissionsSourceData(dispatch, getState) {
    dispatch(emissionsSourceDataLoading(true));
    const url = formatUrlWithSectorsAndDates(appConfig.URLS.plumeSourceEndpoint, getState);
    fetch(url)
        .then(res => res.json())
        .then(json => {
            dispatch(updateEmissionsSourceData(json));
            dispatch(emissionsSourceDataLoading(false));
        })
        .catch(err => {
            console.warn(`Error getting emissions charts data.`, err);
        });
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

function emissionsSourceDataLoading(isLoading) {
    return { type: typesMSF.ANALYTICS_EMISSIONS_SOURCE_DATA_LOADING, isLoading };
}

function updateEmissionsSourceData(data) {
    return { type: typesMSF.UPDATE_ANALYTICS_EMISSIONS_SOURCE_DATA, data };
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
                return dispatch(updateSummaryPageData());
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_CHARTS:
            case MSFTypes.ANALYTICS_MODE_DISTRIBUTION_BY_SECTOR:
                return dispatch(updateEmissionsCharts());
        }
    };
}

export function openMapToInfrastructure(featureInfo) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_APP_MODE, mode: MSFTypes.APP_MODE_MAP });
        getState()
            .map.getIn(["maps", "openlayers"])
            .zoomToCoords([featureInfo.long, featureInfo.lat]);
    };
}

export function updateSummaryPageSourceIndex(index) {
    return { type: typesMSF.UPDATE_SUMMARY_PAGE_SOURCE_INDEX, index };
}
