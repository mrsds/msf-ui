import Immutable from "immutable";

export const asyncModel = {
    loading: false,
    failed: false
};

export const asyncState = Immutable.fromJS({
    initialDataAsync: asyncModel,
    layerSourcesAsync: asyncModel,
    layerPalettesAsync: asyncModel,
    layerMetadataAsync: asyncModel,
    alerts: []
});
