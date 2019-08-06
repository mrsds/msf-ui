import * as actionTypesMSF from "constants/actionTypes";
import { analyticsState_Extended } from "reducers/models/analytics_Extended";
import analytics from "_core/reducers/analytics";
import AnalyticsReducer_Extended from "reducers/reducerFunctions/AnalyticsReducer_Extended";

export default function analytics_Extended(
    state = analyticsState_Extended,
    action,
    opt_reducer = AnalyticsReducer_Extended
) {
    switch (action.type) {
        default:
            return analytics.call(this, state, action, opt_reducer);
    }
}
