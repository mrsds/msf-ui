import * as typesMSF from "constants/actionTypes";

export function setAppMode(mode) {
    return { type: typesMSF.CHANGE_APP_MODE, mode };
}
