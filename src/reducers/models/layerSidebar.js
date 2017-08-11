import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export const layerSidebarState = Immutable.fromJS({
    activeFeatureCategory: layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
    pageIndices: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: 0,
        [layerSidebarTypes.CATEGORY_PLUMES]: 0
    },
    availableFeatures: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: [],
        [layerSidebarTypes.CATEGORY_PLUMES]: []
    },
    activeInfrastructureSubCategories: {
        VISTA_2017_OILGAS_WELLS: false,
        VISTA_2017_LIVESTOCK_DAIRIES: false,
        VISTA_2017_ANAEROBIC_LAGOONS: false,
        VISTA_2017_CNG_FUELING_STATIONS: false,
        VISTA_2017_LNG_FUELING_STATIONS: false,
        VISTA_2017_NAT_GAS_STORE_FIELDS: false,
        VISTA_2017_NAT_GAS_PROC_PLANT: false,
        VISTA_2017_NAT_GAS_COMP_STAT: false,
        VISTA_2017_PETRO_REFINE: false,
        VISTA_2017_WASTEWTR_TREAT_PLNT: false,
        VISTA_2017_POWER_PLANT: false,
        VISTA_2017_LANDFILL: false,
        VISTA_2017_NATGAS_PIPES: false,
        VISTA_2017_SOCAB_BOUND: false
    }
});

export const featuresModel = Immutable.fromJS({
    id: ""
});
