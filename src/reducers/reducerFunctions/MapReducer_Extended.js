import MapReducer from "_core/reducers/reducerFunctions/MapReducer";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import { layerModel_Extended as layerModel } from "reducers/models/map_Extended";
import { alert } from "_core/reducers/models/alert";

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
}
