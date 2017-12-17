import appConfig from 'constants/appConfig';
import * as types from '_core/constants/actionTypes';
import * as appStrings from '_core/constants/appStrings';
import * as AlertActions from '_core/actions/AlertActions';
import MiscUtil from '_core/utils/MiscUtil';

const miscUtil = new MiscUtil();

export function setLayerMenuOpen(open) {
    return { type: types.SET_LAYER_MENU_OPEN, open };
}

export function setLayerActive(layer, active) {
    return { type: types.SET_LAYER_ACTIVE, layer, active };
}

export function setLayerDisabled(layer, disabled) {
    return { type: types.SET_LAYER_DISABLED, layer, disabled };
}

export function setLayerOpacity(layer, opacity) {
    return { type: types.SET_LAYER_OPACITY, layer, opacity };
}

export function changeLayerPalette(layer, palette) {
    return { type: types.SET_LAYER_PALETTE, layer, palette };
}

export function moveLayerToTop(layer) {
    return { type: types.MOVE_LAYER_TO_TOP, layer };
}

export function moveLayerToBottom(layer) {
    return { type: types.MOVE_LAYER_TO_BOTTOM, layer };
}

export function moveLayerUp(layer) {
    return { type: types.MOVE_LAYER_UP, layer };
}

export function moveLayerDown(layer) {
    return { type: types.MOVE_LAYER_DOWN, layer };
}

export function activateDefaultLayers() {
    return { type: types.ACTIVATE_DEFAULT_LAYERS };
}

export function openLayerInfo(layer) {
    return { type: types.OPEN_LAYER_INFO, layer };
}

export function closeLayerInfo() {
    return { type: types.CLOSE_LAYER_INFO };
}

export function setCurrentMetadata(layer, data) {
    return { type: types.SET_CURRENT_METADATA, layer, data };
}

export function loadLayerMetadata(layer) {
    return (dispatch) => {
        // signal loading
        dispatch(layerMetadataLoading());
        // open the display
        dispatch(openLayerInfo(layer));
        if (layer.getIn(["metadata", "url"]) && layer.getIn(["metadata", "handleAs"])) {
            // fetch the metadata
            return miscUtil.asyncFetch({
                url: layer.getIn(["metadata", "url"]),
                handleAs: layer.getIn(["metadata", "handleAs"])
            }).then((data) => {
                // store the data for display
                dispatch(setCurrentMetadata(layer, data));
                // signal loading complete
                dispatch(layerMetadataLoaded());
            }, (err) => {
                console.warn("Error in LayerActions.openLayerInfo:", err);
                // signal loading complete
                dispatch(layerMetadataLoaded());
                // display alert
                dispatch(AlertActions.addAlert({
                    title: appStrings.ALERTS.FETCH_METADATA_FAILED.title,
                    body: appStrings.ALERTS.FETCH_METADATA_FAILED.formatString.split("{LAYER}").join(layer.get("title")),
                    severity: appStrings.ALERTS.FETCH_METADATA_FAILED.severity,
                    time: new Date()
                }));
            });
        } else {
            // signal loading complete
            dispatch(layerMetadataLoaded());
            // display alert
            dispatch(AlertActions.addAlert({
                title: appStrings.ALERTS.FETCH_METADATA_FAILED.title,
                body: appStrings.ALERTS.FETCH_METADATA_FAILED.formatString.split("{LAYER}").join(layer.get("title")),
                severity: appStrings.ALERTS.FETCH_METADATA_FAILED.severity,
                time: new Date()
            }));
        }
    };
}

export function loadInitialData(callback = null) {
    return (dispatch) => {
        // Set flag that initial layer data has begun loading
        dispatch(initialDataLoading());
        // Fetch all initial layer data
        return Promise.all([
            dispatch(loadLayerData()),
            dispatch(loadPaletteData())
        ]).then(() => {
            // Set flag that initial layer data has finished loading
            dispatch(initialDataLoaded());
            if (typeof callback === "function") {
                callback.call(this);
            }
        }, (err) => {
            console.warn("Error in LayerActions.loadInitialData:", err);
            dispatch(AlertActions.addAlert({
                title: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.title,
                body: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.formatString,
                severity: appStrings.ALERTS.INITIAL_DATA_LOAD_FAILED.severity,
                time: new Date()
            }));
            dispatch(initialDataLoaded());
            if (typeof callback === "function") {
                callback.call(this);
            }
        });
    };
}

export function loadPaletteData() {
    return (dispatch) => {
        dispatch(paletteDataLoading());
        return miscUtil.asyncFetch({
            url: appConfig.URLS.paletteConfig,
            handleAs: appStrings.FILE_TYPE_JSON,
            options: { credentials: 'same-origin' }
        }).then((data) => {
            dispatch(ingestLayerPalettes(data));
            dispatch(paletteDataLoaded());
        }, (err) => {
            console.warn("Error in LayerActions.loadPaletteData:", err);
            throw err;
        });
    };
}

export function loadLayerData() {
    return (dispatch) => {
        dispatch(layerDataLoading());
        return Promise.all(appConfig.URLS.layerConfig.map((el) => {
            return dispatch(loadSingleLayerSource(el));
        })).then(() => {
            dispatch(mergeLayers());
            dispatch(layerDataLoaded());
        }, (err) => {
            console.warn("Error in LayerActions.loadLayerData:", err);
            throw err;
        });
    };
}

export function loadSingleLayerSource(options) {
    return (dispatch) => {
        return miscUtil.asyncFetch({
            url: options.url,
            handleAs: options.type,
            options: { credentials: 'same-origin' }
        }).then((data) => {
            dispatch(ingestLayerConfig(data, options));
        }, (err) => {
            console.warn("Error in LayerActions.loadSingleLayerSource: ", err);
            throw err;
        });
    };
}

// async action helpers

function initialDataLoading() {
    return { type: types.INITIAL_DATA_LOADING };
}

function initialDataLoaded() {
    return { type: types.INITIAL_DATA_LOADED };
}

function paletteDataLoading() {
    return { type: types.PALETTE_DATA_LOADING };
}

function paletteDataLoaded() {
    return { type: types.PALETTE_DATA_LOADED };
}

function layerDataLoading() {
    return { type: types.LAYER_DATA_LOADING };
}

function layerDataLoaded() {
    return { type: types.LAYER_DATA_LOADED };
}

function ingestLayerConfig(config, options) {
    return { type: types.INGEST_LAYER_CONFIG, config, options };
}

function mergeLayers() {
    return { type: types.MERGE_LAYERS };
}

function ingestLayerPalettes(paletteConfig) {
    return { type: types.INGEST_LAYER_PALETTES, paletteConfig };
}

function layerMetadataLoading() {
    return { type: types.LAYER_METADATA_LOADING };
}

function layerMetadataLoaded() {
    return { type: types.LAYER_METADATA_LOADED };
}
