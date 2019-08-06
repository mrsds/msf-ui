import Immutable from "immutable";
import AnalyticsReducer from "_core/reducers/reducerFunctions/AnalyticsReducer";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as actionTypes from "constants/actionTypes";
import ReactGA from "react-ga";

const ANALYTICS_ACTION_CATEGORIES = [
    {
        type: "User Settings",
        actions: [actionTypes.SET_HOME_AREA]
    },
    {
        type: "Performance",
        actions: [actionTypes.LOAD_TIME_ON_MOVE]
    },
    {
        type: "User Actions",
        actions: [
            actionTypes.SORT_PLUMES_BY_EMISSIONS,
            actionTypes.UPDATE_FEATURE_DETAIL,
            actionTypes.OPEN_PLUME_DETAIL,
            actionTypes.OPEN_INFRASTRUCTURE_DETAIL,
            actionTypes.INFRASTRUCTURE_LIST_MODE,
            actionTypes.INFRASTRUCTURE_THUMB_MODE,
            actionTypes.INFRASTRUCTURE_CHART_MODE,
            actionTypes.SORT_PLUMES_BY_EMISSIONS,
            actionTypes.TOGGLE_ANALYTICS_MODE,
            actionTypes.SET_ANALYTICS_FILTER,
            actionTypes.EMISSIONS_SUMMARY_DOWNLOAD_REQUESTED,
            actionTypes.TOGGLE_GRIDDED_LAYER_ON,
            actionTypes.CHANGE_GRIDDED_DATE,
            actionTypes.CHANGE_ACTIVE_GRIDDED_LAYER,
            actionTypes.ZOOM_IN_WITH_GRIDDED_LAYER_ON,
            actionTypes.TOGGLE_FLIGHT_LINE_LAYER_ON
        ]
    }
];

const INCLUDED_ACTIONS = new Immutable.List([
    actionTypes.SET_HOME_AREA,
    actionTypes.LOAD_TIME_ON_MOVE,
    actionTypes.OPEN_PLUME_DETAIL,
    actionTypes.OPEN_INFRASTRUCTURE_DETAIL,
    actionTypes.INFRASTRUCTURE_LIST_MODE,
    actionTypes.INFRASTRUCTURE_THUMB_MODE,
    actionTypes.INFRASTRUCTURE_CHART_MODE,
    actionTypes.SORT_PLUMES_BY_EMISSIONS,
    actionTypes.TOGGLE_ANALYTICS_MODE,
    actionTypes.SET_ANALYTICS_FILTER,
    actionTypes.EMISSIONS_SUMMARY_DOWNLOAD_REQUESTED,
    actionTypes.TOGGLE_GRIDDED_LAYER_ON,
    actionTypes.CHANGE_GRIDDED_DATE,
    actionTypes.CHANGE_ACTIVE_GRIDDED_LAYER,
    actionTypes.ZOOM_IN_WITH_GRIDDED_LAYER_ON,
    actionTypes.TOGGLE_FLIGHT_LINE_LAYER_ON
]);

const EXCLUDED_ACTIONS = new Immutable.List([
    // Map Actions
    actionTypes.SET_LAYER_OPACITY,
    actionTypes.INGEST_LAYER_CONFIG,
    actionTypes.MERGE_LAYERS,
    actionTypes.PIXEL_HOVER,
    actionTypes.INVALIDATE_PIXEL_HOVER,
    actionTypes.INGEST_LAYER_PALETTES,

    // Async Actions
    actionTypes.INITIAL_DATA_LOADING,
    actionTypes.INITIAL_DATA_LOADED,
    actionTypes.PALETTE_DATA_LOADING,
    actionTypes.PALETTE_DATA_LOADED,
    actionTypes.LAYER_DATA_LOADING,
    actionTypes.LAYER_DATA_LOADED,

    // Date Slider Actions
    actionTypes.BEGIN_DRAGGING,
    actionTypes.END_DRAGGING,
    actionTypes.HOVER_DATE,
    actionTypes.TIMELINE_MOUSE_OUT,

    // Misc
    actionTypes.NO_ACTION
]);

export default class AnalyticsReducer_Extended extends AnalyticsReducer {
    static processAction(state, action) {
        // skip items we don't care about or if analytics is not enabled
        if (
            !state.get("isEnabled") ||
            (INCLUDED_ACTIONS.size > 0 && !INCLUDED_ACTIONS.contains(action.type)) ||
            (EXCLUDED_ACTIONS.size > 0 && EXCLUDED_ACTIONS.contains(action.type))
        ) {
            return state;
        }

        // iterate over action members converting Immutable data to standard JS objects
        for (let param in action) {
            if (action.hasOwnProperty(param)) {
                let val = action[param];
                if (typeof val.toJS !== "undefined") {
                    action[param] = val.toJS();
                }
            }
        }

        // create and store the analytic
        let analytic = {
            sessionId: appConfig.SESSION_ID,
            sequenceId: state.get("sequenceIndex"),
            time: new Date().toISOString(),
            action: action
        };
        state = state
            .set("currentBatch", state.get("currentBatch").push(analytic))
            .set("sequenceIndex", state.get("sequenceIndex") + 1);

        // send batches when 10 actions are gathered
        if (state.get("currentBatch").size >= appConfig.ANALYTICS_BATCH_SIZE) {
            return this.sendAnalyticsBatch(state, action);
        }
        return state;
    }

    static sendAnalyticsBatch(state, action) {
        if (state.get("currentBatch").size > 0) {
            state.get("currentBatch").forEach(evt => {
                const category = ANALYTICS_ACTION_CATEGORIES.reduce((acc, category) => {
                    if (acc) return acc;
                    if (category.actions.includes(evt.action.type)) return category.type;
                }, null);

                if (evt.action.analyticsIgnore) return;
                console.log({
                    category,
                    action: evt.action.type,
                    label: evt.action.analyticsLabel,
                    value: evt.action.analyticsValue | 0
                });

                ReactGA.initialize(appConfig.GOOGLE_ANALYTICS_ID);
                ReactGA.event({
                    category,
                    action: evt.action.type,
                    label: evt.action.analyticsLabel,
                    value: evt.action.analyticsValue | 0
                });
            });

            // clear the current batch and update the sent time
            state = state.set("currentBatch", Immutable.List()).set("timeLastSent", new Date());
        }
        return state;
    }
}
