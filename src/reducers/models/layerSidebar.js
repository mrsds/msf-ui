import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import appConfig from "constants/appConfig";

export const layerSidebarState = Immutable.fromJS({
    activeFeatureCategory: layerSidebarTypes.CATEGORY_PLUMES,
    availableFeatures: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: [],
        [layerSidebarTypes.CATEGORY_PLUMES]: []
    },
    activeInfrastructureSubCategories: {
        [layerSidebarTypes.VISTA_2017_OILGAS_WELLS]: false,
        [layerSidebarTypes.VISTA_2017_LIVESTOCK_DAIRIES]: true,
        [layerSidebarTypes.VISTA_2017_ANAEROBIC_LAGOONS]: true,
        [layerSidebarTypes.VISTA_2017_CNG_FUELING_STATIONS]: true,
        [layerSidebarTypes.VISTA_2017_LNG_FUELING_STATIONS]: true,
        [layerSidebarTypes.VISTA_2017_NAT_GAS_STORE_FIELDS]: true,
        [layerSidebarTypes.VISTA_2017_NAT_GAS_PROC_PLANT]: true,
        [layerSidebarTypes.VISTA_2017_PETRO_REFINE]: true,
        [layerSidebarTypes.VISTA_2017_WASTEWTR_TREAT_PLNT]: true,
        [layerSidebarTypes.VISTA_2017_POWER_PLANT]: true,
        [layerSidebarTypes.VISTA_2017_LANDFILL]: true,
        [layerSidebarTypes.VISTA_2017_SOCAB_BOUND]: false
    },
    searchState: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: {
            searchString: "",
            searchResults: {},
            filters: {
                [layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME]: {
                    selectedValue: {
                        value: "",
                        label: ""
                    },
                    selectableValues: []
                }
            },
            pageIndex: 0
        },
        [layerSidebarTypes.CATEGORY_PLUMES]: {
            searchResults: {},
            pageIndex: 0,
            filters: {
                [layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN]: {
                    selectedValue: {
                        value: "",
                        label: ""
                    },
                    selectableValues: []
                },
                [layerSidebarTypes.PLUME_FILTER_PLUME_IME]: {
                    selectedValue: {
                        value: "",
                        label: ""
                    },
                    selectableValues: []
                },
                [layerSidebarTypes.PLUME_FILTER_PLUME_ID]: {
                    selectedValue: {
                        value: "",
                        label: ""
                    },
                    selectableValues: []
                },
                [layerSidebarTypes.PLUME_FILTER_PLUME_START_DATE]: {
                    selectedValue: {
                        value: appConfig.PLUME_START_DATE,
                        label: appConfig.PLUME_START_DATE
                    },
                    selectableValues: []
                },
                [layerSidebarTypes.PLUME_FILTER_PLUME_END_DATE]: {
                    selectedValue: {
                        value: appConfig.PLUME_END_DATE,
                        label: appConfig.PLUME_END_DATE
                    },
                    selectableValues: []
                }
            }
        }
    },
    activeFeature: {
        category: null,
        feature: null
    }
});
