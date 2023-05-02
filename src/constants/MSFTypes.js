export const PLUME_SOURCES_LIST = 0;
export const PLUME_SOURCES_THUMB = 1;
export const PLUME_SOURCES_CHART = 2;

export const INFRASTRUCTURE_SOURCES_LIST = 0;
export const INFRASTRUCTURE_SOURCES_THUMB = 1;
export const INFRASTRUCTURE_SOURCES_CHART = 2;

export const APP_MODE_MAP = 0;
export const APP_MODE_ANALYTICS = 1;
export const APP_MODE_CONTROL = 2;

export const ANALYTICS_MODE_PLUME_DETECTION_STATS = "ANALYTICS_MODE_PLUME_DETECTION_STATS";
export const ANALYTICS_MODE_EMISSIONS_CHARTS = "ANALYTICS_MODE_EMISSIONS_CHARTS";
export const ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO = "ANALYTICS_MODE_EMISSIONS_SUMMARY_INFO";
export const ANALYTICS_MODE_DISTRIBUTION_BY_SECTOR = "ANALYTICS_MODE_DISTRIBUTION_BY_SECTOR";

export const HOME_AREA_LOS_ANGELES = 0;
export const HOME_AREA_SF_BAY = 1;
export const HOME_AREA_PERMIAN_BASIN = 2;
export const HOME_AREA_CUSTOM = 3;

export const EXTENTS_LOS_ANGELES = [-120, 33, -116, 35];
export const EXTENTS_SF_BAY = [-124, 38, -121, 36];
export const EXTENTS_PERMIAN_BASIN = [-107, 29, -98, 36];

export const HOME_AREAS = [
    { title: "Los Angeles", homeArea: HOME_AREA_LOS_ANGELES, extents: EXTENTS_LOS_ANGELES },
    { title: "San Francisco Bay Area", homeArea: HOME_AREA_SF_BAY, extents: EXTENTS_SF_BAY },
//    { title: "Permian Basin", homeArea: HOME_AREA_PERMIAN_BASIN, extents: EXTENTS_PERMIAN_BASIN }
];

export const CONTROL_MODE_JOB_SUBMISSION = "CONTROL_MODE_JOB_SUBMISSION";

export const SECTOR_DISTRIBUTION_MODE_EMISSIONS = "SECTOR_DISTRIBUTION_MODE_EMISSIONS";
export const SECTOR_DISTRIBUTION_MODE_OCCURRENCE = "SECTOR_DISTRIBUTION_MODE_OCCURRENCE";
export const SECTOR_DISTRIBUTION_MODES = [
    { key: SECTOR_DISTRIBUTION_MODE_EMISSIONS, title: "Bin by Emissions" },
    { key: SECTOR_DISTRIBUTION_MODE_OCCURRENCE, title: "Bin by Occurrence" }
];
