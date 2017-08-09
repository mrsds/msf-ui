import AsyncReducer from '_core/reducers/reducerFunctions/AsyncReducer';
import * as appStrings from '_core/constants/appStrings';
import appConfig from 'constants/appConfig';

export default class AsyncReducer_Extended extends AsyncReducer {
    static availableLayerListLoading(state, action) {
        return state.set("loadingLayerAvailabilityData", true);
    }

    static availableLayerListLoaded(state, action) {
        return state.set("loadingLayerAvailabilityData", false);
    }
}