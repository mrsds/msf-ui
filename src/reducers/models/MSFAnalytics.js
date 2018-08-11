import Immutable from "immutable";
import * as MSFTypes from "constants/MSFTypes";

export const MSFAnalyticsState = Immutable.fromJS({
    analyticsMode: MSFTypes.ANALYTICS_MODE_DATA_COLLECTION_STATS,
    filterOptions: {
        selectedArea: "Los Angeles",
        selectedSector: null,
        selectedSubsector: null,
        selectedUnits: "kg"
    },
    summaryDataIsLoading: false,
    summaryData: null,
    filteredSummaryData: null,
    detectionStatsAreLoading: false,
    detectionStats: null
});
