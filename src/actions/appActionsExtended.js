import * as appActions from "_core/actions/appActions";
import * as typesMSF from "constants/actionTypes";

export function setSettingsOpen(open) {
    return dispatch => {
        dispatch({ type: typesMSF.TOGGLE_HOME_SELECT_MENU_OPEN, open });
        dispatch(appActions.setSettingsOpen(open));
    };
}

export function completeLandingPageLoad() {
    return { type: typesMSF.COMPLETE_LANDING_PAGE_LOAD };
}
