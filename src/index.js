/**
 * Copyright 2017 California Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*eslint-disable import/default*/
import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import configureStore from "store/configureStore";
import App from "components/App/App"; // Replace this with your own non-core version src/components/AppContainer/AppContainer.js
import globalStyles from "styles/globals.scss";
require("_core/styles/resources/img/apple-touch-icon.png");
require("_core/styles/resources/img/favicon-32x32.png");
require("_core/styles/resources/img/favicon-16x16.png");
require("_core/styles/resources/img/safari-pinned-tab.svg");
require("_core/styles/resources/img/favicon.ico");
// require("_core/styles/resources/img/layer_thumbnails/BlueMarble_ShadedRelief_Bathymetry.jpeg");
require("_core/styles/resources/img/layer_thumbnails/OSM_Land_Water_Map.png");
require("_core/styles/resources/img/layer_thumbnails/ASTER_GDEM_Color_Shaded_Relief.jpeg");
require("_core/styles/resources/img/layer_thumbnails/ESRI_World_Imagery.jpeg");
require("styles/resources/img/layer_thumbnails/gridded_methane_v1.png");
require("styles/resources/img/layer_thumbnails/AVIRIS.png");
require("styles/resources/img/layer_thumbnails/permian-thumb.png");
require("styles/resources/img/map_icons/PlumeIcon.png");
require("styles/resources/img/map_icons/PlumeIconActive.png");
require("styles/resources/img/landing_page/logo_nasa_trio_white.png");
require("styles/resources/img/landing_page/logo_nasa_trio_white@2x.png");
require("styles/resources/img/landing_page/hero_image.jpg");
require("styles/resources/img/landing_page/msf_screenshot.jpg");
require("styles/resources/img/landing_page/Methane_tiered_obs_system_small.jpg");
require("styles/resources/img/layer_thumbnails/msf-flightcoverage.png");
require("styles/resources/img/layer_thumbnails/msf-pointsources.png");
require("styles/resources/img/layer_thumbnails/Vista-Infrastructure.png");
import { BrowserRouter } from "react-router-dom";

const store = configureStore();

render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById("app")
);
