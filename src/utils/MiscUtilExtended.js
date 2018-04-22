import MiscUtil from "_core/utils/MiscUtil";
import * as references from "constants/references";
import moment from "moment";
import Immutable from "immutable";

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

    static processFeatureGeojson(featureList) {
        return featureList.reduce((keys, feature) => {
            let ime = feature.metadata.find(x => x.name === "IME20 (kg)");
            let imeValue = ime ? parseFloat(ime.value) : null;
            let sourceId = feature.metadata.find(x => x.name === "Source id");
            let sourceIdValue = sourceId ? parseFloat(sourceId.value) : null;
            keys.push(
                Immutable.fromJS({
                    name: feature.name,
                    flight_id: feature.flight_id,
                    id: feature.id,
                    datetime: feature.data_date_dt,
                    flight_campaign: "Unknown",
                    ime: imeValue,
                    sourceId: sourceId,
                    metadata: feature.metadata.concat([
                        {
                            name: "latitude",
                            value: feature.location[0]
                        },
                        {
                            name: "longitude",
                            value: feature.location[1]
                        }
                    ]),
                    png_url: feature.png_url,
                    rgbqlctr_url: feature.rgbqlctr_url,
                    thumbnail: feature.rgbqlctr_url_thumb
                    //   thumbnail: feature.plume_url_thumb
                })
            );
            return keys;
        }, []);
    }
}
