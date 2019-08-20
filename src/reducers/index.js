/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { combineReducers } from "redux";
import map_Extended from "reducers/map_Extended";
import help from "_core/reducers/help";
import layerInfo from "_core/reducers/layerInfo";
import share from "_core/reducers/share";
import dateSlider from "_core/reducers/dateSlider";
import asynchronous_Extended from "reducers/async_Extended";
import analytics from "_core/reducers/analytics";
import alerts from "_core/reducers/alerts";
import webWorker from "_core/reducers/webWorker";
import layerSidebar from "reducers/layerSidebar";
import featureDetail from "reducers/featureDetail";
import view_Extended from "reducers/view_Extended";
import MSFAnalytics from "reducers/MSFAnalytics";
import settings_Extended from "reducers/settings_Extended";
import analytics_Extended from "reducers/analytics_Extended";

const rootReducer = combineReducers({
    view: view_Extended,
    map: map_Extended,
    settings: settings_Extended,
    help,
    layerInfo: layerInfo,
    share,
    dateSlider,
    asynchronous: asynchronous_Extended,
    analytics: analytics_Extended,
    alerts,
    layerSidebar,
    featureDetail,
    webWorker,
    MSFAnalytics
});

export default rootReducer;
