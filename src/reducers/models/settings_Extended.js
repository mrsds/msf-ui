import Immutable from "immutable";
import { settingsState } from "_core/reducers/models/settings";
import * as MSFTypes from "constants/MSFTypes";

export const settingsState_Extended = settingsState.mergeDeep(
    Immutable.fromJS({
        homeSelectMenuOpen: false,
        homeArea: {
            location: MSFTypes.HOME_AREA_LOS_ANGELES,
            extent: MSFTypes.EXTENTS_LOS_ANGELES
        }
    })
);
