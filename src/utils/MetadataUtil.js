import * as references from "constants/references";
import Immutable from "immutable";

export default class MetadataUtil {
    static getMetadata(feature) {
        return feature.get("metadata") ? feature.get("metadata") : Immutable.fromJS({});
    }

    static getValueForField(field, metadata) {
        return metadata.get("field");
    }

    static tryFields(fields, metadata) {
        return fields.reduce((res, field) => {
            return res ? res : this.getValueForField(field, metadata);
        }, null);
    }

    static getCounty(feature, errTxt) {
        const fields = ["COUNTYNAME", "county"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getCity(feature, errTxt) {
        const fields = ["site", "city", "city_1", "placename", "LCity"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getState(feature, errTxt) {
        const fields = ["state", "statename", "LState"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getLat(feature, errTxt) {
        const fields = ["latitude", "latitude_1", "LLat"];
        const res = this.tryFields(fields, this.getMetadata(feature));
        if (res) {
            return typeof res === "number" ? res.toString() : res;
        }
        return errTxt;
    }

    static getLong(feature, errTxt) {
        const fields = ["longitude", "longitude_1", "LLong"];
        const res = this.tryFields(fields, this.getMetadata(feature));
        if (res) {
            return typeof res === "number" ? res.toString() : res;
        }
        return errTxt;
    }

    static getAddress(feature, errTxt) {
        const fields = [
            "address",
            "Street_Add",
            "Station_Add",
            "F_Address",
            "location",
            "LAddress"
        ];
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

    static getCandidateID(feature, errTxt = null) {
        const fields = ["# Candidate id"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getSourceID(feature, errTxt = null) {
        const fields = ["Source id", "source_identifier_s"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getPlumeID(feature, errTxt = null) {
        const fields = ["Plume id"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getSiteName(feature, errTxt = null) {
        const fields = ["LSiteName"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getFacilityTypeName(feature, errTxt = null) {
        const fields = ["LSector"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getOperatorName(feature, errTxt = null) {
        const fields = ["LOperator"];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getIME(feature, num = 20, errTxt = null) {
        const fields = [`IME${num} (kg)`];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getFetch(feature, num = 20, errTxt = null) {
        const fields = [`Fetch${num} (m)`];
        return this.tryFields(fields, this.getMetadata(feature)) || errTxt;
    }

    static getSourceList(feature) {
        return this.getValueForField("sources", this.getMetadata(feature)) || [];
    }
}
