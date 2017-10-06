import * as layerSidebarTypes from "constants/layerSidebarTypes";

export const LAYER_VECTOR_KMZ = "vector_kmz";
export const LAYER_AVIRIS = "aviris_plume";

export const ALERTS = {
	LAYER_AVAILABILITY_LIST_LOAD_FAILED: {
		title: "Layer Availability List Loading Failed",
		formatString:
			"Failed to load layer availability list for the current viewport.",
		severity: 3
	}
};

export const INFRASTRUCTURE_FACILITY_TYPE_TO_NAME = {
	[layerSidebarTypes.VISTA_2017_OILGAS_WELLS]: "Oil and Natural Gas Wells",
	[layerSidebarTypes.VISTA_2017_LIVESTOCK_DAIRIES]: "Dairies",
	[layerSidebarTypes.VISTA_2017_ANAEROBIC_LAGOONS]: "Anaerobic Lagoons",
	[layerSidebarTypes.VISTA_2017_CNG_FUELING_STATIONS]: "CNG Fueling Stations",
	[layerSidebarTypes.VISTA_2017_LNG_FUELING_STATIONS]: "LNG Fueling Stations",
	[layerSidebarTypes.VISTA_2017_NAT_GAS_STORE_FIELDS]:
		"Natural Gas Storage Fields",
	[layerSidebarTypes.VISTA_2017_NAT_GAS_PROC_PLANT]:
		"Natural Gas Processing Plants",
	[layerSidebarTypes.VISTA_2017_PETRO_REFINE]: "Petroleum Refineries",
	[layerSidebarTypes.VISTA_2017_WASTEWTR_TREAT_PLNT]:
		"Wastewater Treatment Plants",
	[layerSidebarTypes.VISTA_2017_POWER_PLANT]: "Power Plants",
	[layerSidebarTypes.VISTA_2017_LANDFILL]: "Landfills",
	[layerSidebarTypes.VISTA_2017_SOCAB_BOUND]: "SOCAB Bound"
};
