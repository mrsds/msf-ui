import appConfig from "constants/appConfig";
import MapUtil from "_core/utils/MapUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStrings from "constants/appStrings";
import { MapWrapperOpenlayersExtended as MapWrapperOpenlayers } from "utils/MapWrapperOpenlayersExtended";

export default class MapUtilExtended extends MapUtil {
    static parseCapabilities(capabilitiesString) {
        return MapWrapperOpenlayers.parseCapabilities(capabilitiesString);
    }

    // generates a set of wmts options for a layer
    // NOTE: uses openlayers to do the actual info gathering
    static getWmtsOptions(options) {
        MapWrapperOpenlayers.prepProjection();
        return MapWrapperOpenlayers.getWmtsOptions(options);
    }

    static buildVistaFeatureQueryString(extent, subCategoryState) {
        const [lonMax, latMax] = this.constrainCoordinates([
            parseFloat(extent.get(2)),
            parseFloat(extent.get(3))
        ]);
        const [lonMin, latMin] = this.constrainCoordinates([
            parseFloat(extent.get(0)),
            parseFloat(extent.get(1))
        ]);
        const categoryString = subCategoryState
            .filter(val => val)
            .map((val, key) => layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[key])
            .join(",");
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
        return layerSidebarTypes.INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[category];
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
