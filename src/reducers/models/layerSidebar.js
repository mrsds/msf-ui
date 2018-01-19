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
            selectedFlightCampaign: null,
            selectedIME: null
        }
    },
    activeFeature: {
        category: null,
        feature: null
    }
});
