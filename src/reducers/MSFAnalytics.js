import * as actionTypesMSF from "constants/actionTypes";
import { MSFAnalyticsState } from "reducers/models/MSFAnalytics";
import MSFAnalyticsReducer from "reducers/reducerFunctions/MSFAnalyticsReducer";

export default function MSFAnalytics(
    state = MSFAnalyticsState,
    action,
    opt_reducer = MSFAnalyticsReducer
) {
    switch (action.type) {
        case actionTypesMSF.CHANGE_ANALYTICS_MODE:
            return opt_reducer.changeAnalyticsMode(state, action);
        case actionTypesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_AREA:
            return opt_reducer.changeFilterSelectedArea(state, action);
        case actionTypesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SECTOR:
            return opt_reducer.changeFilterSector(state, action);
        case actionTypesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SUBSECTOR:
            return opt_reducer.changeFilterSubsector(state, action);
        case actionTypesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_UNITS:
            return opt_reducer.changeFilterUnits(state, action);
        case actionTypesMSF.UPDATE_ANALYTICS_SUMMMARY_DATA:
            return opt_reducer.updateAnalyticsSummaryData(state, action);
        case actionTypesMSF.ANALYTICS_SUMMARY_DATA_LOADING:
            return opt_reducer.analyticsSummaryDataLoading(state, action);
        case actionTypesMSF.UPDATE_ANALYTICS_DETECTION_STATS:
            return opt_reducer.updateAnalyticsDetectionStats(state, action);
        case actionTypesMSF.ANALYTICS_DETECTION_STATS_LOADING:
            return opt_reducer.analyticsDetectionStatsLoading(state, action);
        default:
            return state;
    }
}
