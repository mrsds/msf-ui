import * as actionTypes from '../constants/actionTypes';
import * as mapStrings from '../constants/mapStrings';
import * as appStrings from '../constants/appStrings';
import * as mapConfig from '../constants/mapConfig';
import { createStore } from 'redux';
import { expect } from 'chai';
import rootReducer from '../reducers';
import { mapState, layerModel, paletteModel } from '../reducers/models/map';
import { asyncState } from '../reducers/models/async';
import { helpState } from '../reducers/models/help';
import { shareState } from '../reducers/models/share';
import { settingsState } from '../reducers/models/settings';
import { dateSliderState } from '../reducers/models/dateSlider';
import { analyticsState } from '../reducers/models/analytics';
import { viewState } from '../reducers/models/view';
import { layerInfoState } from '../reducers/models/layerInfo';
import moment from 'moment';

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

describe('Store - Date Slider', function() {
    it('sets the map date', function() {
        const store = createStore(rootReducer, initialState);

        const initial = store.getState();
        expect(initial.map.get("date")).to.equal(mapConfig.DEFAULT_DATE);

        let dateFormat = "YYYY-MM-DD";
        let newDate = moment("2003-01-01", dateFormat).toDate();

        const actions = [
            { type: actionTypes.SET_MAP_DATE, date: newDate }
        ];
        actions.forEach(action => store.dispatch(action));

        const actual = store.getState();
        const expected = {
            map: mapState.remove("maps").set("date", newDate),
            view: viewState,
            asyncronous: asyncState,
            help: helpState,
            settings: settingsState,
            share: shareState,
            analytics: analyticsState,
            dateSlider: dateSliderState,
            layerInfo: layerInfoState
        };

        expect(actual.view.toJS()).to.deep.equal(expected.view.toJS());
        expect(actual.asyncronous.toJS()).to.deep.equal(expected.asyncronous.toJS());
        expect(actual.help.toJS()).to.deep.equal(expected.help.toJS());
        expect(actual.settings.toJS()).to.deep.equal(expected.settings.toJS());
        expect(actual.share.toJS()).to.deep.equal(expected.share.toJS());
        expect(actual.analytics.remove("currentBatch").remove("timeLastSent").toJS()).to.deep.equal(expected.analytics.remove("currentBatch").remove("timeLastSent").toJS());
        expect(actual.map.remove("maps").toJS()).to.deep.equal(expected.map.toJS());
        expect(actual.dateSlider.toJS()).to.deep.equal(expected.dateSlider.toJS());
        expect(actual.layerInfo.toJS()).to.deep.equal(expected.layerInfo.toJS());
    });
});