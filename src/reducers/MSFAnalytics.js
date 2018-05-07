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
        default:
            return state;
    }
}
