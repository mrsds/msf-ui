import Immutable from "immutable";
import { viewState } from "_core/reducers/models/view";
import * as MSFTypes from "constants/MSFTypes";

export const viewState_Extended = viewState.mergeDeep(
    Immutable.fromJS({
        appMode: MSFTypes.APP_MODE_MAP
    })
);
