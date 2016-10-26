import * as LayerActions from '_core/actions/LayerActions';
import { createStore } from 'redux';
import { expect } from 'chai';
import rootReducer from '_core/reducers';
import { mapState, layerModel, paletteModel } from '_core/reducers/models/map';
import { asyncState } from '_core/reducers/models/async';
import { helpState } from '_core/reducers/models/help';
import { shareState } from '_core/reducers/models/share';
import { settingsState } from '_core/reducers/models/settings';
import { dateSliderState } from '_core/reducers/models/dateSlider';
import { analyticsState } from '_core/reducers/models/analytics';
import { viewState } from '_core/reducers/models/view';
import { layerInfoState } from '_core/reducers/models/layerInfo';
import TestUtil from '_core/tests/TestUtil';

const initialState = {
    map: mapState,
    view: viewState,
    asyncronous: asyncState,
    help: helpState,
    settings: settingsState,
    share: shareState,
    dateSlider: dateSliderState,
    analytics: analyticsState,
    layerInfo: layerInfoState
};

describe('Store - Layer Info', function() {
    it('opens layer info and sets the correct layer object.', function() {
        const store = createStore(rootReducer, initialState);

        const layer = layerModel.merge({
            id: "TEST_LAYER_1"
        });

        const actions = [
            LayerActions.openLayerInfo(layer)
        ];
        actions.forEach(action => store.dispatch(action));

        const state = store.getState();
        const actual = {...state };

        const expected = {...initialState };
        expected.layerInfo = expected.layerInfo
            .set("isOpen", true)
            .set("layer", layer);

        TestUtil.compareFullStates(actual, expected);
    });

    it('closes layer info and maintains the layer object reference.', function() {
        const store = createStore(rootReducer, initialState);

        const layer = layerModel.merge({
            id: "TEST_LAYER_1"
        });

        const actions = [
            LayerActions.openLayerInfo(layer),
            LayerActions.closeLayerInfo()
        ];

        actions.forEach(action => store.dispatch(action));

        const state = store.getState();
        const actual = {...state };

        const expected = {...initialState };
        expected.layerInfo = expected.layerInfo
            .set("isOpen", false)
            .set("layer", layer);

        TestUtil.compareFullStates(actual, expected);
    });
});