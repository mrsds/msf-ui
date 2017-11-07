import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import appConfig from "constants/appConfig";

export const layerSidebarState = Immutable.fromJS({
    activeFeatureCategory: layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
    availableFeatures: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: [],
        [layerSidebarTypes.CATEGORY_PLUMES]: []
    },
    activeInfrastructureSubCategories: {
        [layerSidebarTypes.VISTA_2017_OILGAS_WELLS]: false,
        [layerSidebarTypes.VISTA_2017_LIVESTOCK_DAIRIES]: false,
        [layerSidebarTypes.VISTA_2017_ANAEROBIC_LAGOONS]: false,
        [layerSidebarTypes.VISTA_2017_CNG_FUELING_STATIONS]: false,
        [layerSidebarTypes.VISTA_2017_LNG_FUELING_STATIONS]: false,
        [layerSidebarTypes.VISTA_2017_NAT_GAS_STORE_FIELDS]: false,
        [layerSidebarTypes.VISTA_2017_NAT_GAS_PROC_PLANT]: false,
        [layerSidebarTypes.VISTA_2017_PETRO_REFINE]: false,
        [layerSidebarTypes.VISTA_2017_WASTEWTR_TREAT_PLNT]: false,
        [layerSidebarTypes.VISTA_2017_POWER_PLANT]: false,
        [layerSidebarTypes.VISTA_2017_LANDFILL]: false,
        [layerSidebarTypes.VISTA_2017_SOCAB_BOUND]: false
    },
    searchState: {
        [layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: {
            searchString: "",
            searchResults: {},
            facilityFilterOptionsVisible: false,
            pageIndex: 0
        },
        [layerSidebarTypes.CATEGORY_PLUMES]: {
            searchString: "",
            searchResults: {},
            filterOptionsVisible: false,
            pageIndex: 0,
            startDate: appConfig.PLUME_START_DATE,
            endDate: appConfig.PLUME_END_DATE,
            selectedFlightCampaign: null
        }
    },
    activeFeature: {
        category: null,
        feature: null
    }
});
