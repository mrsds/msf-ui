import Immutable from "immutable";
import * as coreConfig from "_core/constants/appConfig";

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
	URLS: {
		vistaEndpoint:
			"http://100.64.114.155:9090/vista?maxLat={latMax}&maxLon={lonMax}&minLat={latMin}&minLon={lonMin}&category={category}"
	},
	DEFAULT_BBOX_EXTENT: [-120, 33, -116, 35]
});

// define and export the final config
const appConfig = CORE_CONFIG.mergeDeep(APP_CONFIG)
	.mergeDeep(OPS_CONFIG)
	.toJS();
export default appConfig;

export const INFRASTRUCTURE_SEARCH_OPTIONS = Immutable.fromJS({
	shouldSort: true,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: ["name"]
});
