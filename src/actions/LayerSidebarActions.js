import * as types from 'constants/actionTypes_Extended';

export function setLayerSidebarCategory(category) {
    return { type: types.SET_LAYER_SIDEBAR_CATEGORY, category };
}

export function pageForward(category) {
	return { type: types.FEATURE_SIDEBAR_PAGE_FORWARD, category };
}

export function pageBackward(category) {
	return { type: types.FEATURE_SIDEBAR_PAGE_BACKWARD, category };
}

export function  changeSidebarCategory(index) {
	return { type: types.CHANGE_LAYER_SIDEBAR_CATEGORY, index };
}