import * as appStrings from "_core/constants/appStrings";
import MapWrapperOpenlayersExtended from "utils/MapWrapperOpenlayersExtended";

// creates a new object that abstracts a mapping library
/**
 * Creates a object that abstracts a mapping library
 *
 * @export
 * @param {string} type signifying the type of map to create, and thus backing library to use
 * @param {DOMNode|string} container the dom node to render the map to
 * @param {object} mapOptions the set of options to pass to the wrapper
 * @returns a MapWrapper instance
 */
export function createMap(type, container, mapOptions) {
    switch (type) {
        case appStrings.MAP_LIB_2D:
            return new MapWrapperOpenlayersExtended(container, mapOptions);
        default:
            return false;
    }
}
