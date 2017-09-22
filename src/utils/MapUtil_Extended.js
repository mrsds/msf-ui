import appConfig from "constants/appConfig";
import MapUtil from "_core/utils/MapUtil";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appStrings from "constants/appStrings_Extended.js";

export default class MapUtil_Extended extends MapUtil {
	buildVistaFeatureQueryString(extent, sidebarState) {
		const [lonMax, latMax] = this.constrainCoordinates([
			parseFloat(extent.get(2)),
			parseFloat(extent.get(3))
		]);
		const [lonMin, latMin] = this.constrainCoordinates([
			parseFloat(extent.get(0)),
			parseFloat(extent.get(1))
		]);
		const categoryString = this.getActiveInfrastructureCategories(
			sidebarState
		).join(",");
		return appConfig.URLS.vistaEndpoint
			.replace("{latMax}", latMax)
			.replace("{lonMax}", lonMax)
			.replace("{latMin}", latMin)
			.replace("{lonMin}", lonMin)
			.replace("{category}", categoryString);
	}

	getActiveInfrastructureCategories(sidebarState) {
		return sidebarState
			.get("activeInfrastructureSubCategories")
			.filter(state => state)
			.map(
				(val, key) =>
					layerSidebarTypes.INFRASTRUCTURE_SUBCATEGORIES[key]
			);
	}

	getInfrastructureCategoryHumanName(category) {
		return appStrings.INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[category];
	}
}
