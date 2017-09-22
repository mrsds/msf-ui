import * as appStrings from "_core/constants/appStrings";
import MapWrapper_openlayers_Extended from "utils/MapWrapper_openlayers_Extended";
import MapWrapper_cesium_Extended from "utils/MapWrapper_cesium_Extended";

// creates a new object that abstracts a mapping library
export function createMap(type, container, mapOptions) {
	switch (type) {
		case appStrings.MAP_LIB_2D:
			return new MapWrapper_openlayers_Extended(container, mapOptions);
		case appStrings.MAP_LIB_3D:
			return new MapWrapper_cesium_Extended(container, mapOptions);
		default:
			return false;
	}
}
