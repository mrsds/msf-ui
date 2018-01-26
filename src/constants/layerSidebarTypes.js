export const CATEGORY_PLUMES = "CATEGORY_PLUMES";
export const CATEGORY_INFRASTRUCTURE = "CATEGORY_INFRASTRUCTURE";

export const FEATURES_PER_PAGE = 25;

export const VISTA_2017_OILGAS_WELLS = "VISTA_2017_OILGAS_WELLS";
export const VISTA_2017_LIVESTOCK_DAIRIES = "VISTA_2017_LIVESTOCK_DAIRIES";
export const VISTA_2017_ANAEROBIC_LAGOONS = "VISTA_2017_ANAEROBIC_LAGOONS";
export const VISTA_2017_CNG_FUELING_STATIONS = "VISTA_2017_CNG_FUELING_STATIONS";
export const VISTA_2017_LNG_FUELING_STATIONS = "VISTA_2017_LNG_FUELING_STATIONS";
export const VISTA_2017_NAT_GAS_STORE_FIELDS = "VISTA_2017_NAT_GAS_STORE_FIELDS";
export const VISTA_2017_NAT_GAS_PROC_PLANT = "VISTA_2017_NAT_GAS_PROC_PLANT";
export const VISTA_2017_PETRO_REFINE = "VISTA_2017_PETRO_REFINE";
export const VISTA_2017_WASTEWTR_TREAT_PLNT = "VISTA_2017_WASTEWTR_TREAT_PLNT";
export const VISTA_2017_POWER_PLANT = "VISTA_2017_POWER_PLANT";
export const VISTA_2017_LANDFILL = "VISTA_2017_LANDFILL";
export const VISTA_2017_SOCAB_BOUND = "VISTA_2017_SOCAB_BOUND";

export const SHAPE_CIRCLE = "SHAPE_CIRCLE";
export const SHAPE_SQUARE = "SHAPE_SQUARE";
export const SHAPE_TRIANGLE_DOWN = "SHAPE_TRIANGLE_DOWN";

export const PLUME_FILTER_FLIGHT_CAMPAIGN = "Flight Campaigns";
export const PLUME_FILTER_PLUME_IME = "Plume IME";
export const PLUME_FILTER_PLUME_ID = "Plume ID";
export const PLUME_FILTER_PLUME_START_DATE = "Plume Start Date";
export const PLUME_FILTER_PLUME_END_DATE = "Plume End Date";

export const INFRASTRUCTURE_FILTER_NAME = "Infrastructure Name";

export const INFRASTRUCTURE_SUBCATEGORIES = {
    [VISTA_2017_OILGAS_WELLS]: 0,
    [VISTA_2017_LIVESTOCK_DAIRIES]: 1,
    [VISTA_2017_ANAEROBIC_LAGOONS]: 2,
    [VISTA_2017_CNG_FUELING_STATIONS]: 3,
    [VISTA_2017_LNG_FUELING_STATIONS]: 4,
    [VISTA_2017_NAT_GAS_STORE_FIELDS]: 5,
    [VISTA_2017_NAT_GAS_PROC_PLANT]: 6,
    [VISTA_2017_PETRO_REFINE]: 8,
    [VISTA_2017_WASTEWTR_TREAT_PLNT]: 9,
    [VISTA_2017_POWER_PLANT]: 10,
    [VISTA_2017_LANDFILL]: 11,
    [VISTA_2017_SOCAB_BOUND]: 13
};

export const SECTORS = {
    AGRICULTURE: "agriculture",
    ENERGY: "energy",
    WASTE: "waste"
};

let agricultureCategories = [VISTA_2017_LIVESTOCK_DAIRIES, VISTA_2017_ANAEROBIC_LAGOONS];
let energyCategories = [
    VISTA_2017_POWER_PLANT,
    VISTA_2017_PETRO_REFINE,
    VISTA_2017_OILGAS_WELLS,
    VISTA_2017_NAT_GAS_STORE_FIELDS,
    VISTA_2017_CNG_FUELING_STATIONS,
    VISTA_2017_LNG_FUELING_STATIONS,
    VISTA_2017_NAT_GAS_PROC_PLANT
];
let wasteCategories = [VISTA_2017_WASTEWTR_TREAT_PLNT, VISTA_2017_LANDFILL, VISTA_2017_SOCAB_BOUND];
export const INFRASTRUCTURE_GROUPS = {
    [SECTORS.AGRICULTURE]: {
        categories: agricultureCategories,
        categoryIds: agricultureCategories.map(x => INFRASTRUCTURE_SUBCATEGORIES[x]),
        colors: {
            fill: "rgba(212,125,39,0.3)",
            stroke: "rgba(212,125,39,1)",
            fillNoTransparency: "rgb(242, 216, 192)"
        }
    },
    [SECTORS.ENERGY]: {
        categories: energyCategories,
        categoryIds: energyCategories.map(x => INFRASTRUCTURE_SUBCATEGORIES[x]),
        colors: {
            fill: "rgba(181,181,54,0.3)",
            stroke: "rgba(181,181,54,1)",
            fillNoTransparency: "rgb(233, 233, 197)"
        }
    },
    [SECTORS.WASTE]: {
        categories: [VISTA_2017_WASTEWTR_TREAT_PLNT, VISTA_2017_LANDFILL, VISTA_2017_SOCAB_BOUND],
        categoryIds: wasteCategories.map(x => INFRASTRUCTURE_SUBCATEGORIES[x]),
        colors: {
            fill: "rgba(129,230,27,0.3)",
            stroke: "rgba(129,230,27,1)",
            fillNoTransparency: "rgb(218, 248, 192)"
        }
    }
};

export const INFRASTRUCTURE_INFO_BY_CATEGORY_ID = {};
Object.keys(INFRASTRUCTURE_GROUPS).map(key => {
    let value = INFRASTRUCTURE_GROUPS[key];
    value.categoryIds.map(x => {
        INFRASTRUCTURE_INFO_BY_CATEGORY_ID[x] = {
            fillNoTransparency: value.colors.fillNoTransparency,
            sector: key
        };
    });
});

// export const INFRASTRUCTURE_SUBCATEGORY_SHAPES = {
// 	[VISTA_2017_OILGAS_WELLS]: null,
// 	[VISTA_2017_LIVESTOCK_DAIRIES]: 1,
// 	[VISTA_2017_ANAEROBIC_LAGOONS]: 2,
// 	[VISTA_2017_CNG_FUELING_STATIONS]: 3,
// 	[VISTA_2017_LNG_FUELING_STATIONS]: 4,
// 	[VISTA_2017_NAT_GAS_STORE_FIELDS]: 5,
// 	[VISTA_2017_NAT_GAS_PROC_PLANT]: 6,
// 	[VISTA_2017_PETRO_REFINE]: 8,
// 	[VISTA_2017_WASTEWTR_TREAT_PLNT]: 9,
// 	[VISTA_2017_POWER_PLANT]: 10,
// 	[VISTA_2017_LANDFILL]: 11,
// 	[VISTA_2017_SOCAB_BOUND]: 13
// };
