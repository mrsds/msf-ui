/*eslint-disable import/default*/
import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import configureStore from "store/configureStore";
import AppContainer from "components/App/AppContainer"; // Replace this with your own non-core version src/components/AppContainer/AppContainer.js
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
require("styles/resources/img/map_icons/PlumeIcon.png");

const store = configureStore();

render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("app")
);
