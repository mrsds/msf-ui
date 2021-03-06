export const CATEGORY_PLUMES = "CATEGORY_PLUMES";
export const CATEGORY_INFRASTRUCTURE = "CATEGORY_INFRASTRUCTURE";

export const FEATURES_PER_PAGE = 50;

export const VISTA_2017_OILGAS_WELLS = "VISTA_2017_OILGAS_WELLS";
export const VISTA_2017_LIVESTOCK_DAIRIES = "VISTA_2017_LIVESTOCK_DAIRIES";
// export const VISTA_2017_ANAEROBIC_LAGOONS = "VISTA_2017_ANAEROBIC_LAGOONS";
export const VISTA_2017_CNG_FUELING_STATIONS = "VISTA_2017_CNG_FUELING_STATIONS";
export const VISTA_2017_LNG_FUELING_STATIONS = "VISTA_2017_LNG_FUELING_STATIONS";
export const VISTA_2017_NAT_GAS_STORE_FIELDS = "VISTA_2017_NAT_GAS_STORE_FIELDS";
export const VISTA_2017_NAT_GAS_PROC_PLANT = "VISTA_2017_NAT_GAS_PROC_PLANT";
export const VISTA_2017_PETRO_REFINE = "VISTA_2017_PETRO_REFINE";
export const VISTA_2017_WASTEWTR_TREAT_PLNT = "VISTA_2017_WASTEWTR_TREAT_PLNT";
export const VISTA_2017_POWER_PLANT = "VISTA_2017_POWER_PLANT";
export const VISTA_2017_LANDFILL = "VISTA_2017_LANDFILL";
// export const VISTA_2017_SOCAB_BOUND = "VISTA_2017_SOCAB_BOUND";
// export const VISTA_2017_CEC_PIPELINES = "VISTA_2017_CEC_PIPELINES";
export const VISTA_2017_OILGAS_FIELDS = "VISTA_2017_OILGAS_FIELDS";
export const VISTA_2017_DIGESTER = "VISTA_2017_DIGESTER";
export const VISTA_2017_COMPRESSOR = "VISTA_2017_COMPRESSOR";
export const VISTA_2017_COMPOSTING_SITES = "VISTA_2017_COMPOSTING_SITES";
export const VISTA_2017_OILGAS_FACILITY_BOUNDARIES = "VISTA_2017_OILGAS_FACILITY_BOUNDARIES";
export const VISTA_2017_FEED_LOTS = "VISTA_2017_FEED_LOTS";

export const SHAPE_CIRCLE = "SHAPE_CIRCLE";
export const SHAPE_SQUARE = "SHAPE_SQUARE";
export const SHAPE_TRIANGLE_DOWN = "SHAPE_TRIANGLE_DOWN";

export const PLUME_FILTER_FLIGHT_CAMPAIGN = "Flight Campaigns";
export const PLUME_FILTER_PLUME_IME = "Plume IME";
export const PLUME_FILTER_PLUME_FLUX = "Plume Emissions";
export const PLUME_FILTER_PLUME_ID = "Plume ID";
export const PLUME_FILTER_PLUME_START_DATE = "Plume Start Date";
export const PLUME_FILTER_PLUME_END_DATE = "Plume End Date";
export const PLUME_FILTER_PLUME_OBSERVATION_DATE = "Plume Observation Date";
export const PLUME_FILTER_SORT_BY = "Plume Sort By";
export const PLUME_FILTER_SORT_OPTIONS = [
    {
        value: PLUME_FILTER_PLUME_OBSERVATION_DATE,
        label: "Plume Observation Date"
    },
    {
        value: PLUME_FILTER_PLUME_FLUX,
        label: "Plume Emissions"
    }
];

export const INFRASTRUCTURE_FILTER_NAME = "Infrastructure Name";
export const INFRASTRUCTURE_FILTER_SUBCATEGORY = "Infrastructure Subcategory";
export const INFRASTRUCTURE_FILTER_FLYOVER_COUNT = "Number of Flyovers";
export const INFRASTRUCTURE_FILTER_SORT_BY = "Infrastructure Sort By";
export const INFRASTRUCTURE_FILTER_SORT_OPTIONS = [
    {
        value: INFRASTRUCTURE_FILTER_NAME,
        label: "Infrastructure Name"
    },
    {
        value: INFRASTRUCTURE_FILTER_SUBCATEGORY,
        label: "Infrastructure Type"
    },
    {
        value: INFRASTRUCTURE_FILTER_FLYOVER_COUNT,
        label: "Number of Flyovers"
    }
];

export const INFRASTRUCTURE_SUBCATEGORIES = {
    [VISTA_2017_OILGAS_WELLS]: 1008,
    [VISTA_2017_LIVESTOCK_DAIRIES]: 1002,
    // [VISTA_2017_ANAEROBIC_LAGOONS]: 2,
    [VISTA_2017_CNG_FUELING_STATIONS]: 1000,
    [VISTA_2017_LNG_FUELING_STATIONS]: 1004,
    [VISTA_2017_NAT_GAS_STORE_FIELDS]: 1006,
    [VISTA_2017_NAT_GAS_PROC_PLANT]: 1005,
    [VISTA_2017_PETRO_REFINE]: 1011,
    [VISTA_2017_WASTEWTR_TREAT_PLNT]: 1013,
    [VISTA_2017_POWER_PLANT]: 1010,
    [VISTA_2017_LANDFILL]: 1012,
    // [VISTA_2017_SOCAB_BOUND]: 13,
    // [VISTA_2017_CEC_PIPELINES]: 1009,
    [VISTA_2017_OILGAS_FIELDS]: 1015,
    [VISTA_2017_DIGESTER]: 1003,
    [VISTA_2017_COMPRESSOR]: 1001,
    [VISTA_2017_COMPOSTING_SITES]: 1014,
    [VISTA_2017_OILGAS_FACILITY_BOUNDARIES]: 1007,
    [VISTA_2017_FEED_LOTS]: 1016
};

export const INFRASTRUCTURE_FACILITY_TYPE_TO_NAME = {
    [VISTA_2017_OILGAS_WELLS]: "Oil and Natural Gas Wells",
    [VISTA_2017_LIVESTOCK_DAIRIES]: "Dairies",
    // [VISTA_2017_ANAEROBIC_LAGOONS]: "Anaerobic Lagoons",
    [VISTA_2017_CNG_FUELING_STATIONS]: "CNG Fueling Stations",
    [VISTA_2017_LNG_FUELING_STATIONS]: "LNG Fueling Stations",
    [VISTA_2017_NAT_GAS_STORE_FIELDS]: "Natural Gas Storage Fields",
    [VISTA_2017_NAT_GAS_PROC_PLANT]: "Processing Plants",
    [VISTA_2017_PETRO_REFINE]: "Petroleum Refineries",
    [VISTA_2017_WASTEWTR_TREAT_PLNT]: "Wastewater Treatment Plants",
    [VISTA_2017_POWER_PLANT]: "Power Plants",
    [VISTA_2017_LANDFILL]: "Landfills",
    // [VISTA_2017_SOCAB_BOUND]: "SOCAB Bound",
    // [VISTA_2017_CEC_PIPELINES]: "Natural Gas Pipelines (CEC)",
    [VISTA_2017_OILGAS_FIELDS]: "Oil and Natural Gas Fields",
    [VISTA_2017_DIGESTER]: "Digester",
    [VISTA_2017_COMPRESSOR]: "Compressor Stations",
    [VISTA_2017_COMPOSTING_SITES]: "Composting Sites",
    [VISTA_2017_OILGAS_FACILITY_BOUNDARIES]: "Oil and Natural Gas Facilities",
    [VISTA_2017_FEED_LOTS]: "Feed Lots"
};

export const INFRASTRUCTURE_NAME_TO_TYPE = Object.keys(INFRASTRUCTURE_FACILITY_TYPE_TO_NAME).reduce(
    (acc, key) => {
        acc[INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[key].toLowerCase()] = key;
        return acc;
    },
    {}
);

export const SECTORS = {
    AGRICULTURE: "agriculture",
    ENERGY: "energy",
    WASTE: "waste"
};
export const SECTOR_NAME_TO_SECTOR = Object.keys(SECTORS).reduce((acc, key) => {
    acc[SECTORS[key]] = key;
    return acc;
}, {});

export const IPCC_SECTOR_LEVEL_1 = {
    AGRICULTURE: 3,
    ENERGY: 1,
    WASTE: 4
};
export const IPCC_SECTOR_LEVEL_1_TO_SECTOR = Object.keys(IPCC_SECTOR_LEVEL_1).reduce((acc, key) => {
    acc[IPCC_SECTOR_LEVEL_1[key]] = key;
    return acc;
}, {});

let agricultureCategories = [
    VISTA_2017_LIVESTOCK_DAIRIES,
    VISTA_2017_DIGESTER,
    VISTA_2017_FEED_LOTS
];

let energyCategories = [
    VISTA_2017_POWER_PLANT,
    VISTA_2017_PETRO_REFINE,
    VISTA_2017_NAT_GAS_STORE_FIELDS,
    VISTA_2017_CNG_FUELING_STATIONS,
    VISTA_2017_LNG_FUELING_STATIONS,
    VISTA_2017_NAT_GAS_PROC_PLANT,
    // VISTA_2017_CEC_PIPELINES,
    VISTA_2017_OILGAS_FIELDS,
    VISTA_2017_OILGAS_WELLS,
    VISTA_2017_COMPRESSOR,
    VISTA_2017_OILGAS_FACILITY_BOUNDARIES
];
let wasteCategories = [
    VISTA_2017_WASTEWTR_TREAT_PLNT,
    VISTA_2017_LANDFILL,
    VISTA_2017_COMPOSTING_SITES
];

export const INFRASTRUCTURE_ID_TO_SECTOR = {};
agricultureCategories.map(x => (INFRASTRUCTURE_ID_TO_SECTOR[x] = SECTORS.AGRICULTURE));
energyCategories.map(x => (INFRASTRUCTURE_ID_TO_SECTOR[x] = SECTORS.ENERGY));
wasteCategories.map(x => (INFRASTRUCTURE_ID_TO_SECTOR[x] = SECTORS.WASTE));

export const INFRASTRUCTURE_GROUPS = {
    [SECTORS.AGRICULTURE]: {
        categories: agricultureCategories,
        categoryIds: agricultureCategories.map(x => INFRASTRUCTURE_SUBCATEGORIES[x]),
        colors: {
            fill: [129, 230, 27, 0.1],
            stroke: [129, 230, 27, 1],
            fillNoTransparency: "rgb(218, 248, 192)"
        },
        categoryNames: agricultureCategories.map(x => INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[x])
    },
    [SECTORS.ENERGY]: {
        categories: energyCategories,
        categoryIds: energyCategories.map(x => INFRASTRUCTURE_SUBCATEGORIES[x]),
        colors: {
            fill: [255, 235, 0, 0.1],
            stroke: [255, 235, 0, 1],
            fillNoTransparency: "rgb(255, 235, 0)"
        },
        categoryNames: energyCategories.map(x => INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[x])
    },
    [SECTORS.WASTE]: {
        categories: [
            VISTA_2017_WASTEWTR_TREAT_PLNT,
            VISTA_2017_LANDFILL
            // , VISTA_2017_SOCAB_BOUND
        ],
        categoryIds: wasteCategories.map(x => INFRASTRUCTURE_SUBCATEGORIES[x]),
        colors: {
            fill: [64, 220, 255, 0.1],
            stroke: [64, 220, 255, 1],
            fillNoTransparency: "rgb(64, 220, 255)"
        },
        categoryNames: wasteCategories.map(x => INFRASTRUCTURE_FACILITY_TYPE_TO_NAME[x])
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
