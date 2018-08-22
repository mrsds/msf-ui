import Immutable from "immutable";
import * as MSFTypes from "constants/MSFTypes";

export const MSFAnalyticsState = Immutable.fromJS({
    analyticsMode: MSFTypes.ANALYTICS_MODE_DATA_COLLECTION_STATS,
    filterOptions: {
        selectedArea: null,
        selectedSector: null,
        selectedSubsector: null,
        selectedUnits: "kg"
    },
    summaryDataIsLoading: false,
    summaryData: null,
    filteredSummaryData: null,
    detectionStatsAreLoading: false,
    detectionStats: null,
    areaSearchOptionsLoading: false,
    areaSearchOptionsList: null,
    sectorOptionsListLoading: false,
    sectorOptionsList: null
});
