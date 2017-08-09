import * as actionTypes_Extended from 'constants/actionTypes_Extended';
import { asyncState } from '_core/reducers/models/async';
import async from '_core/reducers/async';
import AsyncReducer_Extended from 'reducers/reducerFunctions/AsyncReducer_Extended';

export default function asynchronous_Extended(state = asyncState, action, opt_reducer = AsyncReducer_Extended) {
    switch (action.type) {
        case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADING:
            return opt_reducer.availableLayerListLoading(state, action);
        case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADED:
            return opt_reducer.availableLayerListLoaded(state, action);
        default:
            return async.call(this, state, action, opt_reducer);
    }
}