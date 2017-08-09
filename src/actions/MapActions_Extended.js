import appConfig from 'constants/appConfig';
import * as types_extended from 'constants/actionTypes_Extended';
import MiscUtil from '_core/utils/MiscUtil';
import MapUtil_Extended from 'utils/MapUtil_Extended';
import * as appStrings_Extended from 'constants/appStrings_Extended';
import * as AlertActions from '_core/actions/AlertActions';

const miscUtil = new MiscUtil();
const mapUtil = new MapUtil_Extended();

export function getAvailableLayers(extent) {
    return (dispatch) => {
        dispatch(availableLayerListLoading());
        
        return miscUtil.asyncFetch({
            url: mapUtil.buildAvailableLayerQueryString(extent),
            handleAs: "json"
        }).then((data) => {
            // update available features for bbox
            dispatch(updateAvailableFeatures(data.features));
            // signal loading complete
            dispatch(availableLayerListLoaded());
        }, (err) => {
            console.warn("Error getting available layer list for current view bbox:", err);
            // signal loading complete
            dispatch(availableLayerListLoaded());
            
            // display alert
            dispatch(AlertActions.addAlert({
              title: appStrings_Extended.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.title,
              body: appStrings_Extended.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED,
              severity: appStrings_Extended.ALERTS.LAYER_AVAILABILITY_LIST_LOAD_FAILED.severity,
              time: new Date()
            }));
        });
    };
}

export function availableLayerListLoading() {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADING };
}

export function availableLayerListLoaded() {
    return { type: types_extended.AVAILABLE_LAYER_LIST_LOADED };
}

export function updateAvailableFeatures(layerList) {
    return { type: types_extended.UPDATE_AVAILABLE_FEATURE_LIST, layerList };
}