import * as actionTypes from '_core/constants/actionTypes';
import { mapState } from '_core/reducers/models/map';
import { layerInfoState } from '_core/reducers/models/layerInfo';
import layerInfo from '_core/reducers/layerInfo';
import LayerInfoReducer_Extended from 'reducers/reducerFunctions/LayerInfoReducer_Extended';

export default function layer_Extended(state = layerInfoState, action, opt_reducer = LayerInfoReducer_Extended) {
    switch (action.type) {
        default:
            return layerInfo.call(this, state, action, opt_reducer);
    }
}