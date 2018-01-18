import MiscUtil from "_core/utils/MiscUtil";
import * as references from "constants/references";
import moment from "moment";

export default class MiscUtilExtended extends MiscUtil {
    static getCountyFromFeature(feature, errStr) {
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
    static getCaCountyNameFromCode(code) {
        return references.CA_COUNTY_LOOKUP.get(code, null);
    }

    static formatPlumeDatetime(datetime) {
        return datetime ? moment(datetime).format("MMMM Do, YYYY, H:mm [UTC]") : "(no date)";
    }

    static roundTo(num, place) {
        if (typeof num !== "number") {
            throw new TypeError(
                "Error in MiscUtil.roundTo: Expected parameter 'num' to be of type number"
            );
        }
        if (typeof place !== "number") {
            throw new TypeError(
                "Error in MiscUtil.roundTo: Expected parameter 'place' to be of type number"
            );
        }
        return +(Math.round(num + "e+" + place) + "e-" + place);
    }
}
