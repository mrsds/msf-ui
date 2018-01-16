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
}
