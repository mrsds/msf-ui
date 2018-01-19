import * as types from "constants/actionTypes";
import * as mapActions from "actions/mapActions";
import * as coreMapActions from "_core/actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export function pageForward(category) {
    return { type: types.FEATURE_SIDEBAR_PAGE_FORWARD, category };
}

export function pageBackward(category) {
    return { type: types.FEATURE_SIDEBAR_PAGE_BACKWARD, category };
}

export function changeSidebarCategory(category) {
    return { type: types.CHANGE_LAYER_SIDEBAR_CATEGORY, category };
}

export function setFeatureDetail(category, feature) {
    return { type: types.UPDATE_FEATURE_DETAIL, category, feature };
}

export function hideFeatureDetail() {
    return { type: types.HIDE_FEATURE_DETAIL };
}

function featureFocusInfoLoading() {
    return { type: types.FEATURE_FOCUS_INFO_LOADING };
}

function featureFocusInfoLoaded() {
    return { type: types.FEATURE_FOCUS_INFO_LOADED };
}

export function updateFeatureSearchText(category, value) {
    return dispatch => {
        dispatch(updateFeatureSearchTextState(category, value));
        dispatch(updateFeatureSearchResults(category));
    };
}

function updateFeatureSearchTextState(category, value) {
    return { type: types.UPDATE_FEATURE_SEARCH_TEXT, category, value };
}

function updateFeatureSearchResults(category) {
    return { type: types.UPDATE_FEATURE_SEARCH_RESULTS, category };
}

export function updateInfrastructureCategoryFilter(layerName, active) {
    return (dispatch, getState) => {
        const layer = getState().map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA, layerName]);
        dispatch(setGroupLayerActive(layer, active));
        if (
            getState()
                .map.get("groups")
                .find(group => group.get("id") === layer.get("group"))
                .get("isActive")
        ) {
            dispatch(coreMapActions.setLayerActive(layer.get("id"), active));
        }
        dispatch(setActiveFeatureCategories(layerName, active));
        dispatch(mapActions.updateFeatureList_Map(layerSidebarTypes.CATEGORY_INFRASTRUCTURE));
    };
}

function setActiveFeatureCategories(layer, active) {
    return { type: types.UPDATE_ACTIVE_SUBCATEGORIES, layer, active };
}

function setGroupLayerActive(layer, active) {
    return { type: types.SET_GROUP_LAYER_ACTIVE, layer, active };
}

export function toggleInfrastructureFacilityFilterOptionsVisible(category) {
    return {
        type: types.TOGGLE_INFRASTRUCTURE_FACILITY_FILTER_OPTIONS_VISIBLE,
        category
    };
}

export function updatePlumeDateRange(position, date) {
    return dispatch => {
        dispatch(updatePlumeDateRangeState(position, date));
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
    };
}

function updatePlumeDateRangeState(position, date) {
    return { type: types.SET_PLUME_DATE_RANGE, position, date };
}

export function selectFlightCampaign(flight_campaign) {
    return dispatch => {
        dispatch(updateFlightCampaign(flight_campaign));
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
    };
}

export function selectIME(ime) {
    return dispatch => {
        dispatch(updateIME(ime));
        dispatch(updateFeatureSearchResults(layerSidebarTypes.CATEGORY_PLUMES));
    };
}

function updateFlightCampaign(flight_campaign) {
    return {
        type: types.UPDATE_FLIGHT_CAMPAIGN,
        flight_campaign
    };
}

function updateIME(ime) {
    return {
        type: types.UPDATE_IME,
        ime
    };
}
