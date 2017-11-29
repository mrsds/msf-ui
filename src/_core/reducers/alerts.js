import * as actionTypes from '_core/constants/actionTypes';
import { alertState } from '_core/reducers/models/alert';
import AlertsReducer from '_core/reducers/reducerFunctions/AlertsReducer';

export default function alerts(state = alertState, action, opt_reducer = AlertsReducer) {
    switch (action.type) {
        case actionTypes.ADD_ALERT:
            return opt_reducer.addAlert(state, action);

        case actionTypes.DISMISS_ALERT:
            return opt_reducer.dismissAlert(state, action);

        case actionTypes.DISMISS_ALL_ALERTS:
            return opt_reducer.dismissAllAlerts(state, action);

        default:
            return state;
    }
}
