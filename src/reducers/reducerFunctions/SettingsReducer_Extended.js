import SettingsReducer from "_core/reducers/reducerFunctions/SettingsReducer";
import Immutable from "immutable";

export default class SettingsReducer_Extended extends SettingsReducer {
    static toggleHomeSelectMenuOpen(state, action) {
        return state.set("homeSelectMenuOpen", action.open);
    }

    static setHomeArea(state, action) {
        return state.set(
            "homeArea",
            Immutable.fromJS({ location: action.location, extent: action.extent })
        );
    }
}
