import * as layerSidebarTypes from "constants/layerSidebarTypes";

export const LAYER_VECTOR_KMZ = "vector_kmz";
export const LAYER_AVIRIS = "aviris_plume";
export const LAYER_VISTA_GEOJSON = "vista_geojson";
export const LAYER_GRIDDED_GEOJSON = "gridded_geojson";
export const LAYER_GROUP_TYPE_GROUP = "group";
export const LAYER_GROUP_TYPE_VISTA_SOURCE = "vista_source";

export const ALERTS = {
    LAYER_AVAILABILITY_LIST_LOAD_FAILED: {
        title: "Layer Availability List Loading Failed",
        formatString: "Failed to load layer availability list for the current viewport.",
        severity: 3
    },
    AVAILABLE_GRIDDED_DATES_LIST_LOAD_FAILED: {
        title: "Availabile Gridded Layer Date List Loading Failed",
        formatString: "Failed to load date availability list for gridded layers.",
        severity: 3
    },
    FEATURE_DETAIL_PLUME_LIST_LOAD_FAILED: {
        title: "Plume List for Feature Failed",
        formatString: "Failed to load plume list for selected feature",
        severity: 3
    }
};

export const VISTA_LAYER_UPDATED = "VISTA_LAYER_UPDATED";
export const UPDATING_VISTA_LAYER = "UPDATING_VISTA_LAYER";
export const AVIRIS_LAYER_UPDATED = "AVIRIS_LAYER_UPDATED";
export const UPDATING_AVIRIS_LAYER = "UPDATING_AVIRIS_LAYER";
