import MapReducer from "_core/reducers/reducerFunctions/MapReducer";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import appConfig from "constants/appConfig";
import { layerModel_Extended as layerModel } from "reducers/models/map_Extended";
import { alert } from "_core/reducers/models/alert";
import moment from "moment";

export default class MapReducer_Extended extends MapReducer {
    static updateAvailableLayers(state, action) {
        return state;
    }

    static setGroupLayerActive(state, action) {
        const layer = action.layer;
        const newLayer = layer.set("visibleInGroup", action.active);
        return state.setIn(["layers", layer.get("type"), layer.get("id")], newLayer);
    }

    static setGroupActive(state, action) {
        const updatedGroups = state
            .get("groups")
            .map(
                group =>
                    group.get("id") === action.group.get("id")
                        ? group.set("isActive", action.active)
                        : group
            );
        return state.set("groups", updatedGroups);
    }

    static centerMapOnPoint(state, action) {
        state.get("maps").map(map => {
            map.setCenter(action.coords);
        });
        return state;
    }

    static centerMapOnFeature(state, action) {
        state.get("maps").map(map => {
            map.centerMapOnFeature(action.feature, action.featureType);
        });
        return state;
    }

    static clearFeatureLabels(state, action) {
        state.get("maps").map(map => map.clearFeatureLabels());
        return state
            .setIn(["activeFeature", "feature"], null)
            .setIn(["activeFeature", "category"], null);
    }

    static toggleFeatureLabel(state, action) {
        // const previousFeature = state.getIn(["activeFeature", "feature"]);
        // const previousCategory = state.getIn(["activeFeature", "category"]);
        // const toggleOn = !previousFeature || previousFeature.get("id") !== action.feature.get("id");

        // Turn off old feature label if there was a previously selected one
        // if (previousFeature) {
        //     state
        //         .get("maps")
        //         .map(map =>
        //             map.setFeatureLabel(previousCategory, previousFeature, () => {}, false)
        //         );
        // }
        // if (toggleOn) {
        state.get("maps").map(map => {
            map.setFeatureLabel(action.category, action.feature);
        });
        return state
            .setIn(["activeFeature", "feature"], action.feature)
            .setIn(["activeFeature", "category"], action.category);
    }

    static setHoverPlume(state, action) {
        return state.set("hoverPlume", action.feature);
    }

    static setLayerOpacity(state, action) {
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
        }
        if (actionLayer && actionLayer.get("type") === appStringsMSF.LAYER_GROUP_TYPE_GROUP) {
            const updatedGroups = state
                .get("groups")
                .map(
                    group =>
                        group.get("id") === actionLayer.get("id")
                            ? group.set("opacity", parseFloat(action.opacity))
                            : group
                );
            state = state.set("groups", updatedGroups);
        }
        return MapReducer.setLayerOpacity(state, action);
    }

    static updateAvailableGriddedDates(state, action) {
        const sortedDateList = action.dateList
            .map(date => moment(date, "YYYY-MM-DD"))
            .sort((a, b) => (a.isBefore(b) ? -1 : a.isAfter(b) ? 1 : 0));
        return state
            .setIn(["griddedSettings", "availableDates"], sortedDateList)
            .setIn(["griddedSettings", "currentDate"], sortedDateList[sortedDateList.length - 1]);
    }

    static updateGriddedDate(state, action) {
        const snap = state.getIn(["griddedSettings", "availableDates"]).reduce((acc, date) => {
            if (acc.snapped) return acc;
            if (date.isSame(action.date)) {
                acc.snapped = date;
            } else if (date.isBefore(action.date)) {
                acc.previous = date;
            }
            return acc;
        }, {});
        const newDate = snap.snapped || snap.previous;

        state.get("maps").map(map => map.changeGriddedVectorLayerDate(newDate));
        return state.setIn(["griddedSettings", "currentDate"], newDate);
    }

    static resizeMap(state, action) {
        state.get("maps").map(map => {
            map.resize();
        });
        return state;
    }

    static updateFeaturePicker(state, action) {
        return state
            .setIn(["featurePicker", "clickEvt"], action.clickEvt)
            .setIn(["featurePicker", "infrastructure"], action.infrastructure)
            .setIn(["featurePicker", "plumes"], action.plumes);
    }

    static closeFeaturePicker(state, action) {
        return state
            .setIn(["featurePicker", "clickEvt"], null)
            .setIn(["featurePicker", "infrastructure"], null)
            .setIn(["featurePicker", "plumes"], null);
    }

    static setActivePickerFeature(state, action) {
        state.get("maps").map(map => {
            map.soloFeature(action.feature, action.category);
        });
        return state
            .setIn(["featurePicker", "activeFeature"], action.feature)
            .setIn(["featurePicker", "activeFeatureCategory"], action.category);
    }

    static setMapView(state, action) {
        const updatedState = this.closeFeaturePicker(state, action);
        return MapReducer.setMapView(updatedState, action);
    }

    static setLayerActive(state, action) {
        let alerts = state.get("alerts");

        // resolve layer from id if necessary
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
            if (typeof actionLayer === "undefined") {
                alerts = alerts.push(
                    alert.merge({
                        title: appStrings.ALERTS.LAYER_ACTIVATION_FAILED.title,
                        body: appStrings.ALERTS.LAYER_ACTIVATION_FAILED.formatString
                            .replace("{LAYER}", action.layer)
                            .replace("{MAP}", "the"),
                        severity: appStrings.ALERTS.LAYER_ACTIVATION_FAILED.severity,
                        time: new Date()
                    })
                );
            }
        }

        if (typeof actionLayer !== "undefined" && actionLayer.get("isActive") !== action.active) {
            let anySucceed = state.get("maps").reduce((acc, map) => {
                if (map.setLayerActive(actionLayer, action.active)) {
                    return true;
                } else {
                    let contextStr = map.is3D ? "3D" : "2D";
                    alerts = alerts.push(
                        alert.merge({
                            title: appStrings.ALERTS.LAYER_ACTIVATION_FAILED.title,
                            body: appStrings.ALERTS.LAYER_ACTIVATION_FAILED.formatString
                                .replace("{LAYER}", actionLayer.get("title"))
                                .replace("{MAP}", contextStr),
                            severity: appStrings.ALERTS.LAYER_ACTIVATION_FAILED.severity,
                            time: new Date()
                        })
                    );
                }
                return acc;
            }, false);

            if (anySucceed) {
                let newLayer = actionLayer.set("isActive", action.active);
                state = state.setIn(
                    ["layers", actionLayer.get("type"), actionLayer.get("id")],
                    newLayer
                );
            }

            state = this.updateLayerOrder(state, {});
        }

        return state.set("alerts", alerts);
    }
}
