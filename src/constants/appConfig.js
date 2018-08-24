/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";

import * as coreConfig from "_core/constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
    URLS: {
        vistaEndpoint:
            "http://100.64.114.187:9090/vista?maxLat={latMax}&maxLon={lonMax}&minLat={latMin}&minLon={lonMin}&category={category}",
        vistaDetailEndpoint: "http://100.64.114.187:9090/vista?vistaId={vista_id}",
        avirisEndpoint:
            "http://100.64.114.187:9090/aviris/plumes?maxObjects=10000&minLon={lonMin}&minLat={latMin}&maxLon={lonMax}&maxLat={latMax}",
        layerConfig: [
            {
                url: "default-data/msf-data/capabilities.xml",
                type: "wmts/xml"
            },
            {
                url: "default-data/msf-data/layers.json",
                type: "json"
            }
        ],
        paletteConfig: "default-data/msf-data/palettes.json",
        availableGriddedDates: "http://100.64.114.187/data/gridded/gridded_date_list.json",
        griddedVectorEndpoint: "http://100.64.114.187/data/gridded/v2/Fluxes_{date}.geojson",
        plumeListQueryEndpoint:
            "http://100.64.114.187:9090/flyoversOfPlumeSource?source={source_id}",
        plumeDownloadEndpoint: "http://100.64.114.187:8666/get_plume?id={source_id}",
        detectionStatsEndpoint: "http://100.64.114.187:9090/detectionBySector?county={county}",
        areaSearchOptionsListEndpoint: "http://100.64.114.187:9090/list/counties",
        plumeSourceEndpoint:
            "http://100.64.114.187:9090/methanePlumeSources?county={county}&sector_level_1={sector_level_1}&sector_level_2={sector_level_2}",
        sectorOptionsListEndpoint: "http://100.64.114.187:9090/list/sectors",
        plumeSourceSummaryEndpoint:
            "http://100.64.114.187:9090/methanePlumeSourcesSummary?county={county}&sector_level_1={sector_level_1}&sector_level_2={sector_level_2}"
    },
    DEFAULT_BBOX_EXTENT: [-120, 33, -116, 35],
    PLUME_START_DATE: new Date(2000, 0, 1),
    PLUME_END_DATE: new Date(2030, 0, 1),
    PLUME_DEFAULT_SORT_BY: layerSidebarTypes.PLUME_FILTER_SORT_OPTIONS[0],
    INFRASTRUCTURE_DEFAULT_SORT_BY: layerSidebarTypes.INFRASTRUCTURE_FILTER_SORT_OPTIONS[0],
    MAX_ZOOM: 25,
    DEFAULT_MAP_EXTENT: [-20026376.39, -20048966.1, 20026376.39, 20048966.1],
    DEFAULT_PROJECTION: appStrings.PROJECTIONS.webmercator,
    MAX_RESOLUTION: undefined,
    DATE_SLIDER_RESOLUTIONS: [
        {
            label: appStrings.SECONDS,
            resolution: appStrings.SECONDS,
            format: "MMM Do, YYYY, HH:mm:ss",
            visMajorFormat: "D MMMM HH:mm"
        },
        {
            label: appStrings.MINUTES,
            resolution: appStrings.MINUTES,
            format: "MMM Do, YYYY, HH:mm:ss",
            visMajorFormat: "ddd D MMMM"
        },
        {
            label: appStrings.HOURS,
            resolution: appStrings.HOURS,
            format: "MMM Do, YYYY, HH:mm:ss",
            visMajorFormat: "ddd D MMMM"
        },
        {
            label: appStrings.DAYS,
            resolution: appStrings.DAYS,
            format: "MMM Do, YYYY",
            visMajorFormat: "MMMM YYYY"
        },
        {
            label: appStrings.MONTHS,
            resolution: appStrings.MONTHS,
            format: "MMM YYYY",
            visMajorFormat: "YYYY"
        },
        {
            label: appStrings.YEARS,
            resolution: appStrings.YEARS,
            format: "YYYY",
            visMajorFormat: "YYYY"
        }
    ],
    OIL_WELLS_MIN_ZOOM: 15
});

// define and export the final config
const appConfig = CORE_CONFIG.mergeDeep(APP_CONFIG)
    .mergeDeep(OPS_CONFIG)
    .toJS();
export default appConfig;

export const SEARCH_OPTIONS = Immutable.fromJS({
    [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["name"]
    },
    [layerSidebarTypes.CATEGORY_PLUMES]: {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["name"]
    }
});
