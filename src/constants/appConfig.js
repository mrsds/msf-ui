import Immutable from "immutable";
import * as coreConfig from "_core/constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import Ol_Style from "ol/style/style";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style_Stroke from "ol/style/stroke";

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
	URLS: {
		vistaEndpoint:
			"http://100.64.114.155:9090/vista?maxLat={latMax}&maxLon={lonMax}&minLat={latMin}&minLon={lonMin}&category={category}",
		avirisEndpoint:
			"http://100.64.114.155:9090/aviris?maxObjects=1000&minLon={lonMin}&minLat={latMin}&maxLon={lonMax}&maxLat={latMax}"
	},
	DEFAULT_BBOX_EXTENT: [-120, 33, -116, 35],
	PLUME_START_DATE: new Date(2010, 0, 1),
  PLUME_END_DATE: new Date(Date.now()),
  MAX_ZOOM: 25
});

// define and export the final config
const appConfig = CORE_CONFIG.mergeDeep(APP_CONFIG)
	.mergeDeep(OPS_CONFIG)
	.toJS();
export default appConfig;

export const SEARCH_OPTIONS = Immutable.fromJS({
	[layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: {
		shouldSort: true,
		threshold: 0.6,
		location: 0,
		distance: 100,
		maxPatternLength: 32,
		minMatchCharLength: 1,
		keys: ["name"]
	},
	[layerSidebarTypes.CATEGORY_PLUMES]: {
		shouldSort: true,
		threshold: 0.6,
		location: 0,
		distance: 100,
		maxPatternLength: 32,
		minMatchCharLength: 1,
		keys: ["name"]
	}
});
