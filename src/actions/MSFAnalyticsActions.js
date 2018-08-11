import * as types from "_core/constants/actionTypes";
import * as typesMSF from "constants/actionTypes";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import MetadataUtil from "utils/MetadataUtil";
import Immutable from "immutable";
import * as MSFTypes from "constants/MSFTypes";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export function changeAnalyticsMode(mode) {
    return { type: typesMSF.CHANGE_ANALYTICS_MODE, mode };
}

export function changeFilterSelectedArea(areaName) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_AREA, areaName };
}

export function changeFilterSector(sector) {
    return (dispatch, getState) => {
        dispatch({ type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SECTOR, sector });
        dispatch(updateActiveAnalyticsTab(getState));
    };
}

export function changeFilterSubsector(subsector) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SUBSECTOR, subsector };
}

export function changeFilterUnits(units) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_UNITS, units };
}

export function fetchDetectionStats() {
    return dispatch => {
        dispatch(detectionStatsLoading(true));
        return MiscUtil.asyncFetch({
            url: appConfig.URLS.detectionStatsEndpoint,
            handleAs: "json"
        }).then(
            data => {
                dispatch(updateDetectionStats(data));
                dispatch(detectionStatsLoading(false));
            },
            err => {
                dispatch(updateDetectionStats());
                dispatch(detectionStatsLoading(false));
                // dispatch(
                //     alertActions.addAlert({
                //         title: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.title,
                //         body: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED,
                //         severity: appStringsMSF.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.severity,
                //         time: new Date()
                //     })
                // );
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

export function fetchSummaryData() {
    return (dispatch, getState) => {
        const filters = null;
        dispatch(summaryDataLoading(true));

        const subcategoryList = getSubcategoryList(getState);

        // Get all the available infrastructure
        const subcatDataList = subcategoryList.map(
            cat =>
                new Promise((resolve, reject) =>
                    fetch(`http://100.64.114.187:9090/vista?&category=${cat.id}`)
                        .then(data => data.json())
                        .then(data => {
                            const sourceList = getSourceList(data).map(sourceId =>
                                getImeList(sourceId)
                            );
                            Promise.all(sourceList).then(sourceData => {
                                resolve({
                                    cat: cat.name,
                                    data: sourceData.reduce((acc, data) => {
                                        acc.push(data);
                                        return acc;
                                    }, [])
                                });
                            });
                        })
                )
        );

        Promise.all(subcatDataList).then(subcatData => {
            dispatch(updateSummaryData(subcatData));
            dispatch(summaryDataLoading(false));
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

function summaryDataLoading(isLoading) {
    return { type: typesMSF.ANALYTICS_SUMMARY_DATA_LOADING, isLoading };
}

function updateSummaryData(data) {
    return { type: typesMSF.UPDATE_ANALYTICS_SUMMMARY_DATA, data };
}

function updateActiveAnalyticsTab() {
    return (dispatch, getState) => {
        switch (getState().MSFAnalytics.get("analyticsMode")) {
            case MSFTypes.ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO:
                dispatch(fetchSummaryData());
        }
    };
}
