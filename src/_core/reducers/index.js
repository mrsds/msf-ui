import { combineReducers } from 'redux';
import view from '_core/reducers/view';
import map_Extended from 'reducers/map_Extended';
import settings from '_core/reducers/settings';
import help from '_core/reducers/help';
import layerInfo from '_core/reducers/layerInfo';
import share from '_core/reducers/share';
import dateSlider from '_core/reducers/dateSlider';
import asynchronous from '_core/reducers/async';
import analytics from '_core/reducers/analytics';
import alerts from '_core/reducers/alerts';

const rootReducer = combineReducers({
    view,
    map: map_Extended,
    settings,
    help,
    layerInfo,
    share,
    dateSlider,
    asynchronous,
    analytics,
    alerts
});

export default rootReducer;