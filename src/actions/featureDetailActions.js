import * as types from "constants/actionTypes";

export function hideFeatureDetailContainer() {
    return { type: types.HIDE_FEATURE_DETAIL };
}

export function changePlumeChartMode(value) {
    return { type: types.CHANGE_PLUME_CHART_MODE, value };
}

export function togglePlumesWithObservationsOnly() {
    return { type: types.TOGGLE_PLUMES_WITH_OBSERVATIONS_ONLY };
}

export function changeInfrastructureChartMode(value) {
    return { type: types.CHANGE_INFRASTRUCTURE_CHART_MODE, value };
}

export function setPlumeSourceFilter(value) {
    return { type: types.SET_PLUME_SOURCE_FILTER, value };
}

export function setFlyoverFilter(value) {
    return { type: types.SET_FLYOVER_FILTER, value };
}

export function setPlumeFilterStartDate(date) {
    return { type: types.SET_PLUME_FILTER_DATE, isStart: true, date };
}

export function setPlumeFilterEndDate(date) {
    return { type: types.SET_PLUME_FILTER_DATE, isStart: false, date };
}
