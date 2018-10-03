import Immutable from "immutable";
import * as MSFTypes from "constants/MSFTypes";
import moment from "moment";

export const MSFAnalyticsState = Immutable.fromJS({
    analyticsMode: MSFTypes.ANALYTICS_MODE_PLUME_DETECTION_STATS,
    filterOptions: {
        selectedArea: null,
        selectedSector: null,
        selectedSubsector: null,
        selectedUnits: "kg",
        startDate: moment("2000-01-01"),
        endDate: moment(Date.now())
    },
    summaryDataIsLoading: false,
    summaryData: null,
    filteredSummaryData: null,
    emissionsSourceData: null,
    emissionsSourceDataIsLoading: false,
    detectionStatsAreLoading: false,
    detectionStats: null,
    areaSearchOptionsLoading: false,
    areaSearchOptionsList: null,
    sectorOptionsListLoading: false,
    sectorOptionsList: null,
    emissionsSummarySourceStartIndex: 0
});
