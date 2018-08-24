import Immutable from "immutable";

export default class MSFAnalyticsReducer {
    static changeAnalyticsMode(state, action) {
        return state.set("analyticsMode", action.mode);
    }

    static changeFilterSelectedArea(state, action) {
        return state.setIn(["filterOptions", "selectedArea"], action.areaName);
    }

    static changeFilterSector(state, action) {
        return state
            .setIn(["filterOptions", "selectedSector"], action.sector)
            .setIn(
                ["filterOptions", "selectedSubsector"],
                action.sector !== state.getIn(["filterOptions", "selectedSector"])
                    ? null
                    : state.getIn(["filterOptions", "selectedSector"])
            );
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

    static updateEmissionsChartsData(state, action) {
        return state.set("emissionsChartsData", Immutable.fromJS(action.data));
    }

    static analyticsEmissionsChartsDataLoading(state, action) {
        return state.set("emissionsChartsDataIsLoading", action.isLoading);
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

    static updateSectorOptionsList(state, action) {
        return state.set("sectorOptionsList", Immutable.fromJS(action.data));
    }

    static sectorOptionsListLoading(state, action) {
        return state.set("sectorOptionsLoading", action.isLoading);
    }

    static changeAnalyticsDate(state, action) {
        return state.setIn(
            ["filterOptions", action.isStart ? "startDate" : "endDate"],
            action.date
        );
    }
}
