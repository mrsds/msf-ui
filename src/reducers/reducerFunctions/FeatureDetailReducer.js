import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export default class FeatureDetailReducer {
    static updateFeatureDetail(state, action) {
        return state
            .set("category", action.category)
            .set("feature", action.feature);
    }

    static hideFeatureDetail(state, action) {
        return state.set("category", "").set("feature", Immutable.fromJS({}));
    }
}
