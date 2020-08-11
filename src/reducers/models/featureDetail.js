import Immutable from "immutable";

export const featureDetailState = Immutable.fromJS({
    category: "",
    feature: {},
    plumeChartMode: 0,
    plumesWithObservationsOnly: false,
    plumeList: [],
    plumeListLoading: false,
    infrastructureChartMode: 0,
    plumeSourceId: null,
    flyoverId: null,
    plumeFilterStartDate: null,
    plumeFilterEndDate: null,
    vistaMetadataLoading: false,
    vistaMetadata: null
});
