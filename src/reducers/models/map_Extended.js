import Immutable from "immutable";
import { mapState, layerModel } from "_core/reducers/models/map";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import moment from "moment";

export const mapState_Extended = mapState.mergeDeep(
    Immutable.fromJS({
        groups: [
            {
                id: "VISTA",
                isActive: true,
                title: "Infrastructure",
                opacity: 1,
                type: "group",
                displayIndex: 0,
                layerOrder: 1
            }
        ],
        activeFeature: {
            feature: null,
            category: null
        },
        hoverPlume: null,
        griddedSettings: {
            availableDates: [],
            currentDate: moment()
        },
        featurePicker: {
            clickEvt: null,
            infrastructure: [],
            plumes: [],
            activeFeature: null,
            activeFeatureCategory: null
        },
        currentZoom: null
    })
);

export const layerModel_Extended = layerModel.mergeDeep(
    Immutable.fromJS({
        group: "",
        visibleInGroup: false,
        displayIndex: null
    })
);

export const groupModel = Immutable.fromJS({
    id: "",
    isActive: false,
    opacity: 1,
    displayIndex: 0,
    title: "",
    layerOrder: 0
});
