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
        return datetime ? moment(datetime).format("MMMM Do, YYYY, H:mm") : "(no date)";
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
            let imeValue = ime ? parseFloat(ime.value) : 0;
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
                    thumbnail: feature.rgbqlctr_url_thumb,
                    plume_tiff_url: feature.plume_tiff_url,
                    rgb_tiff_url: feature.rgb_tiff_url
                    //   thumbnail: feature.plume_url_thumb
                })
            );
            return keys;
        }, []);
    }

    static increaseColorSaturation(colorStr, satFactor) {
        const colorAry = colorStr.match(/rgb\((\d*),\s*(\d*),\s*(\d*)\)/).slice(1);
        const hsv = this.rgbToHsv(colorAry);
        hsv[1] *= satFactor;
        return `rgb(${this.hsvToRgb(hsv)
            .map(x => x | 0)
            .join(",")})`;
    }

    static makeEmptyFlyover(flyover) {
        return Immutable.fromJS({
            isEmptyFlyover: true,
            datetime: flyover.data_date_dt,
            sourceId: flyover.sourceId,
            flyoverId: flyover.name
        });
    }

    static processFlyoverPlumes(flyover) {
        return flyover.plumes.map(plume =>
            Immutable.fromJS(plume)
                .set("datetime", plume.data_date_dt)
                .set("sourceId", flyover.sourceId)
                .set("flyoverId", flyover.name)
        );
    }

    static processSourceList(featureList) {
        return featureList.reduce((acc, flyover) => {
            const entry =
                flyover.plumes.length === 0
                    ? [this.makeEmptyFlyover(flyover)]
                    : this.processFlyoverPlumes(flyover);
            return acc.concat(entry);
        }, []);
    }

    // Courtesy https://gist.github.com/mjackson/5311256
    static rgbToHsv([r, g, b]) {
        (r /= 255), (g /= 255), (b /= 255);

        let max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h,
            s,
            v = max;

        let d = max - min;
        s = max == 0 ? 0 : d / max;
        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    static hsvToRgb([h, s, v]) {
        let r, g, b;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                (r = v), (g = t), (b = p);
                break;
            case 1:
                (r = q), (g = v), (b = p);
                break;
            case 2:
                (r = p), (g = v), (b = t);
                break;
            case 3:
                (r = p), (g = q), (b = v);
                break;
            case 4:
                (r = t), (g = p), (b = v);
                break;
            case 5:
                (r = v), (g = p), (b = q);
                break;
        }
        return [r * 255, g * 255, b * 255];
    }
}
