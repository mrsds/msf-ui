import { combineReducers } from 'redux';
import view from '_core/reducers/view';
import map_Extended from 'reducers/map_Extended';
import settings from '_core/reducers/settings';
import help from '_core/reducers/help';
import layerInfo_Extended from 'reducers/layerInfo_Extended';
import share from '_core/reducers/share';
import dateSlider from '_core/reducers/dateSlider';
import asynchronous_Extended from 'reducers/async_Extended';
import analytics from '_core/reducers/analytics';
import alerts from '_core/reducers/alerts';
import layerSidebar from 'reducers/layerSidebar';

const rootReducer = combineReducers({
    view,
    map: map_Extended,
    settings,
    help,
    layerInfo: layerInfo_Extended,
    share,
    dateSlider,
    asynchronous: asynchronous_Extended,
    analytics,
    alerts,
    layerSidebar
});

export default rootReducer;