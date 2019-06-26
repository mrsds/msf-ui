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

let be_endpoint = "methane.jpl.nasa.gov/server";
let be_port = "9090";
let layer_file = "layers.json";

if (process.env.REACT_APP_BE_ENDPOINT != undefined) {
    be_endpoint = process.env.REACT_APP_BE_ENDPOINT.toLowerCase();
}

if (process.env.hasOwnProperty("REACT_APP_BE_PORT")) {
    be_endpoint = process.env.REACT_APP_BE_PORT.toLowerCase();
}

if (process.env.REACT_APP_LAYER_FILE != undefined) {
    layer_file = process.env.REACT_APP_LAYER_FILE;
}

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
    URLS: {
        vistaEndpoint:
            "https://" +
            be_endpoint +
            "/vista?maxLat={latMax}&maxLon={lonMax}&minLat={latMin}&minLon={lonMin}&category={category}",
        vistaDetailEndpoint: "https://" + be_endpoint + "/vista?vistaId={vista_id}",
        avirisEndpoint:
            "https://" +
            be_endpoint +
            "/aviris/plumes?maxObjects=10000&minLon={lonMin}&minLat={latMin}&maxLon={lonMax}&maxLat={latMax}",
        avirisGlobalSearchEndpoint: "https://" + be_endpoint + "/aviris/plumes?source={source_id}",
        layerConfig: [
            {
                url: "default-data/msf-data/capabilities.xml",
                type: "wmts/xml"
            },
            {
                url: "default-data/msf-data/" + layer_file,
                type: "json"
            }
        ],
        paletteConfig: "default-data/msf-data/palettes.json",
        plumeListQueryEndpoint:
            "https://" + be_endpoint + "/flyoversOfFacility?vista_id={vista_id}",
        sourceListQueryEndpoint:
            "https://" + be_endpoint + "/flyoversOfPlumeSource?source={source_id}",
        detectionStatsEndpoint: "https://" + be_endpoint + "/detectionBySector?county={county}",
        areaSearchOptionsListEndpoint: "https://" + be_endpoint + "/list/counties",
        plumeSourceEndpoint:
            "https://" +
            be_endpoint +
            "/methanePlumeSources?county={county}&vista_category={vista_category}&sector_level_3={sector_level_3}",
        ipccSectorOptionsListEndpoint: "https://" + be_endpoint + "/list/sectors",
        vistaCategoryOptionsListEndpoint: "https://" + be_endpoint + "/list/categories",
        plumeSourceSummaryEndpoint:
            "https://" +
            be_endpoint +
            "/methanePlumeSourcesSummary?county={county}&vista_category={vista_category}&sector_level_3={sector_level_3}"
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
    ZOOM_TO_LEVEL: 15,
    OIL_WELL_MAX_RESOLUTION: 25,
    GRIDDED_LAYER_TYPES: [
        {
            name: "GRIDDED_EMISSIONS_EPA",
            dateEndpoint: "https://" + be_endpoint + "/data/epa_gridded_total_date_list.json",
            endpoint: "https://" + be_endpoint + "/data/epa_gridded_total_{date}.geojson",
            period: "yearly"
        },
        {
            name: "GRIDDED_EMISSIONS_V2",
            dateEndpoint: "https://" + be_endpoint + "/data/gridded/gridded_date_list.json",
            endpoint: "https://" + be_endpoint + "/data/gridded/v2/Fluxes_{date}.geojson",
            period: "daily"
        }
    ]
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
        keys: ["id", "name"]
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
