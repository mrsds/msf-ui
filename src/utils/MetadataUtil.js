import * as references from "constants/references";
import Immutable from "immutable";

export default class MetadataUtil {
    static getMetadata(feature) {
        return feature.get("metadata") ? feature.get("metadata") : Immutable.fromJS({});
    }

    static getValueForField(field, metadata) {
        const result = metadata.find(
            pair =>
                pair.get("name") ? pair.get("name").toLowerCase() === field.toLowerCase() : false
        );
        return result ? result.get("value") : null;
    }

    static tryFields(fields, metadata) {
        // console.log(metadata.toJS());
        return fields.reduce((res, field) => {
            return res ? res : this.getValueForField(field, metadata);
        }, null);
    }

    static getCounty(feature, errTxt) {
        const fields = ["COUNTYNAME", "county"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getCity(feature, errTxt) {
        const fields = ["site", "city", "city_1", "placename"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getState(feature, errTxt) {
        const fields = ["state", "statename"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getLat(feature, errTxt) {
        const fields = ["latitude", "latitude_1"];
        const res = this.tryFields(fields, this.getMetadata(feature));
        if (res) {
            return typeof res === "number" ? res.toString() : res;
        }
        return errTxt;
    }

    static getLong(feature, errTxt) {
        const fields = ["longitude", "longitude_1"];
        const res = this.tryFields(fields, this.getMetadata(feature));
        if (res) {
            return typeof res === "number" ? res.toString() : res;
        }
        return errTxt;
    }

    static getAddress(feature, errTxt) {
        const fields = ["address", "Street_Add", "Station_Add", "F_Address", "location"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getAreaSqMi(feature, errTxt) {
        const fields = ["Shape_Area", "AREA_SQ_MI"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getAreaAcres(feature, errTxt) {
        const fields = ["AREA_ACRE"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getPlumeDatetime(feature, errTxt = null) {
        const fields = ["datetime"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getPlumeIME(feature, errTxt = null) {
        const fields = ["IME20 (kg)"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }
}
