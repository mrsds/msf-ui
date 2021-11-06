import Immutable from "immutable";
import { asyncModel, asyncState } from "_core/reducers/models/async";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export const asyncState_Extended = asyncState.mergeDeep(
    Immutable.fromJS({
        loadingLayerAvailabilityData: false,
        loadingFeatures: {
            [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: false,
            [layerSidebarTypes.CATEGORY_PLUMES]: false
        },
        loadStart: null,
        griddedDateAvailabilityAsync: asyncModel,
        sdapChartAsync: asyncModel
    })
);
