import { settingsState_Extended } from "reducers/models/settings_Extended";
import settings from "_core/reducers/settings";
import SettingsReducer_Extended from "reducers/reducerFunctions/SettingsReducer_Extended";
import * as actionTypesMSF from "constants/actionTypes";

export default function settings_Extended(
    state = settingsState_Extended,
    action,
    opt_reducer = SettingsReducer_Extended
) {
    switch (action.type) {
        case actionTypesMSF.TOGGLE_HOME_SELECT_MENU_OPEN:
            return opt_reducer.toggleHomeSelectMenuOpen(state, action);
        case actionTypesMSF.SET_HOME_AREA:
            return opt_reducer.setHomeArea(state, action);
        default:
            return settings.call(this, state, action, opt_reducer);
    }
}
