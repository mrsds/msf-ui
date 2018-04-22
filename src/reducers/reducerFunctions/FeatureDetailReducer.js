import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import MiscUtilExtended from "utils/MiscUtilExtended";

export default class FeatureDetailReducer {
    static updateFeatureDetail(state, action) {
        return state.set("category", action.category).set("feature", action.feature);
    }

    static hideFeatureDetail(state, action) {
        return state.set("category", "").set("feature", Immutable.fromJS({}));
    }

    static changePlumeChartMode(state, action) {
        return state.set("plumeChartMode", action.value);
    }

    static togglePlumesWithObservationsOnly(state, action) {
        return state.set("plumesWithObservationsOnly", !state.get("plumesWithObservationsOnly"));
    }

    static changeInfrastructureChartMode(state, action) {
        return state.set("infrastructureChartMode", action.value);
    }

    static setPlumeSourceFilter(state, action) {
        return state.set("plumeSourceId", action.value);
    }

    static setFlyoverFilter(state, action) {
        return state.set("flyoverId", action.value);
    }

    static updateFeatureDetailPlumeList(state, action) {
        return state
            .set("plumeList", MiscUtilExtended.processFeatureGeojson(action.data))
            .set("plumeListLoading", false);
    }

    static featureDetailPlumeListLoading(state, action) {
        return state.set("plumeList", []).set("plumeListLoading", true);
    }

    static updatePlumeFilterDate(state, action) {
        return state.set(
            action.isStart ? "plumeFilterStartDate" : "plumeFilterEndDate",
            action.date
        );
    }
}
