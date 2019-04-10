import Immutable from "immutable";
import { mapState, layerModel } from "_core/reducers/models/map";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import moment from "moment";
import * as typesMSF from "constants/actionTypes";
import * as MSFTypes from "constants/MSFTypes";
import appConfig from "constants/appConfig";

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
            },
            {
                id: "GRIDDED",
                isActive: false,
                title: "Gridded Emission Map",
                opacity: 0.3,
                type: "group",
                displayIndex: 1,
                layerOrder: 2
            }
        ],
        activeFeature: {
            feature: null,
            category: null
        },
        hoverPlume: null,
        griddedSettings: {
            activeLayer: appConfig.GRIDDED_LAYER_TYPES[0].name,
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
