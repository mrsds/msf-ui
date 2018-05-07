import * as types from "_core/constants/actionTypes";
import * as typesMSF from "constants/actionTypes";

export function changeAnalyticsMode(mode) {
    return { type: typesMSF.CHANGE_ANALYTICS_MODE, mode };
}

export function changeFilterSelectedArea(areaName) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_AREA, areaName };
}

export function changeFilterSector(sector) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SECTOR, sector };
}

export function changeFilterSubsector(subsector) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_SUBSECTOR, subsector };
}

export function changeFilterUnits(units) {
    return { type: typesMSF.CHANGE_ANALYTICS_FILTER_SELECTED_UNITS, units };
}
