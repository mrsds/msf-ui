import appConfig from "constants/appConfig";
import MapUtil from "_core/utils/MapUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStrings from "constants/appStrings";
import { MapWrapper_openlayers_Extended as MapWrapper_openlayers } from "utils/MapWrapper_openlayers_Extended";

export default class MapUtil_Extended extends MapUtil {
    static parseCapabilities(capabilitiesString) {
        return MapWrapper_openlayers.parseCapabilities(capabilitiesString);
    }

    // generates a set of wmts options for a layer
    // NOTE: uses openlayers to do the actual info gathering
    static getWmtsOptions(options) {
        MapWrapper_openlayers.prepProjection();
        return MapWrapper_openlayers.getWmtsOptions(options);
    }

    static buildVistaFeatureQueryString(extent, sidebarState) {
        const [lonMax, latMax] = this.constrainCoordinates([
            parseFloat(extent.get(2)),
            parseFloat(extent.get(3))
        ]);
        const [lonMin, latMin] = this.constrainCoordinates([
            parseFloat(extent.get(0)),
            parseFloat(extent.get(1))
        ]);
        const categoryString = this.getActiveInfrastructureCategories(sidebarState).join(",");
        return appConfig.URLS.vistaEndpoint
            .replace("{latMax}", latMax)
            .replace("{lonMax}", lonMax)
            .replace("{latMin}", latMin)
            .replace("{lonMin}", lonMin)
            .replace("{category}", categoryString);
    }

    static getActiveInfrastructureCategories(sidebarState) {
        return sidebarState
            .get("activeInfrastructureSubCategories")
            .filter(state => state)
            .map((val, key) => layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[key]);
    }

    static getInfrastructureCategoryHumanName(category) {
        return appStrings.INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[category];
    }

    static buildAvirisFeatureQueryString(extent) {
        const [lonMax, latMax] = this.constrainCoordinates([
            parseFloat(extent.get(2)),
            parseFloat(extent.get(3))
        ]);
        const [lonMin, latMin] = this.constrainCoordinates([
            parseFloat(extent.get(0)),
            parseFloat(extent.get(1))
        ]);
        return appConfig.URLS.avirisEndpoint
            .replace("{latMax}", latMax)
            .replace("{lonMax}", lonMax)
            .replace("{latMin}", latMin)
            .replace("{lonMin}", lonMin);
    }
}
