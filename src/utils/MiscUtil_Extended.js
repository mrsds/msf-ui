import MiscUtil from "_core/utils/MiscUtil";
import * as references from "constants/references";

export default class MiscUtil_Extended extends MiscUtil {
	getCountyFromFeature(feature, errStr) {
		try {
			const countyCode = feature
				.get("metadata")
				.find(item => item.get("name").toLowerCase() === "countyid")
				.get("value");
			return this.getCaCountyNameFromCode(countyCode) || errStr;
		} catch (e) {
			return errStr;
		}
	}
	getCaCountyNameFromCode(code) {
		return references.CA_COUNTY_LOOKUP.get(code, null);
	}
}
