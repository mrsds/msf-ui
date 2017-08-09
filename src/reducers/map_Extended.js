import { mapState } from '_core/reducers/models/map';
import map from '_core/reducers/map';
import MapReducer_Extended from 'reducers/reducerFunctions/MapReducer_Extended';
import * as actionTypes_Extended from 'constants/actionTypes_Extended';

export default function map_Extended(state = mapState, action, opt_reducer = MapReducer_Extended) {
    switch (action.type) {
        case actionTypes_Extended.AVAILABLE_LAYER_LIST_LOADED:
            return opt_reducer.updateAvailableLayers(state, action);
        default:
            return map.call(this, state, action, opt_reducer);
    }
}