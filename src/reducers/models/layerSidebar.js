import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import appConfig from "constants/appConfig";

export const layerSidebarState = Immutable.fromJS({
    activeFeatureCategory: layerSidebarTypes.CATEGORY_PLUMES,
    layerSidebarCollapsed: false,
    availableFeatures: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: [],
        [layerSidebarTypes.CATEGORY_PLUMES]: []
    },
    activeInfrastructureSubCategories: {
        [layerSidebarTypes.VISTA_2017_OILGAS_FIELDS]: true,
        [layerSidebarTypes.VISTA_2017_LIVESTOCK_DAIRIES]: true,
        // [layerSidebarTypes.VISTA_2017_ANAEROBIC_LAGOONS]: true,
        [layerSidebarTypes.VISTA_2017_CNG_FUELING_STATIONS]: true,
        [layerSidebarTypes.VISTA_2017_LNG_FUELING_STATIONS]: true,
        [layerSidebarTypes.VISTA_2017_NAT_GAS_STORE_FIELDS]: true,
        [layerSidebarTypes.VISTA_2017_NAT_GAS_PROC_PLANT]: true,
        [layerSidebarTypes.VISTA_2017_PETRO_REFINE]: true,
        [layerSidebarTypes.VISTA_2017_WASTEWTR_TREAT_PLNT]: true,
        [layerSidebarTypes.VISTA_2017_POWER_PLANT]: true,
        [layerSidebarTypes.VISTA_2017_LANDFILL]: true,
        // [layerSidebarTypes.VISTA_2017_CEC_PIPELINES]: true,
        [layerSidebarTypes.VISTA_2017_DIGESTER]: true,
        [layerSidebarTypes.VISTA_2017_COMPRESSOR]: true,
        [layerSidebarTypes.VISTA_2017_COMPOSTING_SITES]: true,
        [layerSidebarTypes.VISTA_2017_OILGAS_FACILITY_BOUNDARIES]: true,
        [layerSidebarTypes.VISTA_2017_FEED_LOTS]: true
    },
    searchState: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: {
            searchResults: {},
            globalSearchResults: {},
            filters: {
                [layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME]: {
                    selectedValue: "",
                    selectableValues: []
                },
                [layerSidebarTypes.INFRASTRUCTURE_FILTER_SORT_BY]: {
                    selectedValue: appConfig.INFRASTRUCTURE_DEFAULT_SORT_BY,
                    selectableValues: layerSidebarTypes.INFRASTRUCTURE_FILTER_SORT_OPTIONS
                }
            },
            pageIndex: 0
        },
        [layerSidebarTypes.CATEGORY_PLUMES]: {
            searchResults: {},
            globalSearchResults: {},
            pageIndex: 0,
            filters: {
                [layerSidebarTypes.PLUME_FILTER_SORT_BY]: {
                    selectedValue: appConfig.PLUME_DEFAULT_SORT_BY,
                    selectableValues: layerSidebarTypes.PLUME_FILTER_SORT_OPTIONS
                },
                [layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN]: {
                    selectedValue: {
                        value: "",
                        label: ""
                    },
                    selectableValues: []
                },
                [layerSidebarTypes.PLUME_FILTER_PLUME_FLUX]: {
                    selectedValue: null,
                    selectableValues: []
                },
                [layerSidebarTypes.PLUME_FILTER_PLUME_ID]: {
                    selectedValue: ""
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
