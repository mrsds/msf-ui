import * as actionTypes from "constants/actionTypes";
import * as MSFTypes from "constants/MSFTypes";

export function setAppMode(mode) {
    return dispatch => {
        dispatch({ type: actionTypes.CHANGE_APP_MODE, mode });

        if (mode === MSFTypes.APP_MODE_ANALYTICS)
            // Metrics tracking
            dispatch({ type: actionTypes.TOGGLE_ANALYTICS_MODE });
    };
}
