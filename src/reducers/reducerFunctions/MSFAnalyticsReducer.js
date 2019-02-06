import Immutable from "immutable";

export default class MSFAnalyticsReducer {
    static changeAnalyticsMode(state, action) {
        return state.set("analyticsMode", action.mode);
    }

    static changeFilterSelectedArea(state, action) {
        return state.setIn(["filterOptions", "selectedArea"], action.areaName);
    }

    static changeFilterSector(state, action) {
        return state.setIn(["filterOptions", "selectedSector"], action.sector);
    }

    static changeFilterSubsector(state, action) {
        return state.setIn(["filterOptions", "selectedSubsector"], action.subsector);
    }

    static changeFilterUnits(state, action) {
        return state.setIn(["filterOptions", "selectedUnits"], action.units);
    }

    static updateAnalyticsSummaryData(state, action) {
        return state.set("summaryData", Immutable.fromJS(action.data));
    }

    static analyticsSummaryDataLoading(state, action) {
        return state.set("summaryDataIsLoading", action.isLoading);
    }

    static updateEmissionsSourceData(state, action) {
        return state.set("emissionsSourceData", Immutable.fromJS(action.data));
    }

    static analyticsEmissionsSourceDataLoading(state, action) {
        return state.set("emissionsSourceDataIsLoading", action.isLoading);
    }

    static updateAnalyticsDetectionStats(state, action) {
        return state.set("detectionStats", action.data);
    }

    static analyticsDetectionStatsLoading(state, action) {
        return state.set("detectionStatsAreLoading", action.isLoading);
    }

    static updateAreaSearchList(state, action) {
        return state.set("areaSearchOptionsList", Immutable.fromJS(action.data));
    }

    static areaSearchListLoading(state, action) {
        return state.set("areaSearchOptionsLoading", action.isLoading);
    }

    static updateVistaCategoryOptionsList(state, action) {
        return state.set("vistaCategoryOptionsList", Immutable.fromJS(action.data));
    }

    static vistaCategoryOptionsListLoading(state, action) {
        return state.set("vistaCategoryOptionsLoading", action.isLoading);
    }

    static updateIpccSectorOptionsList(state, action) {
        return state.set("ipccSectorOptionsList", Immutable.fromJS(action.data));
    }

    static ipccSectorOptionsListLoading(state, action) {
        return state.set("ipccSectorOptionsLoading", action.isLoading);
    }

    static changeAnalyticsDate(state, action) {
        return state.setIn(
            ["filterOptions", action.isStart ? "startDate" : "endDate"],
            action.date
        );
    }

    static updateSummaryPageSourceIndex(state, action) {
        return state.set("emissionsSummarySourceStartIndex", action.index);
    }
}
