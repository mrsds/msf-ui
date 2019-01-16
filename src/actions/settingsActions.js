import * as typesMSF from "constants/actionTypes";

export function setCookieAccept(accept) {
    return dispatch => {
        dispatch({ type: typesMSF.SET_COOKIE_ACCEPT, accept });
        dispatch({ type: typesMSF.SHOW_COOKIE_MODAL, visible: false });
        dispatch({ type: typesMSF.TOGGLE_HOME_SELECT_MENU_OPEN, open: accept });
    };
}
