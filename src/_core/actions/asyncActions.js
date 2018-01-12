import * as types from "_core/constants/actionTypes";

export function setAsyncLoadingState(key, newAsyncState) {
    return { type: types.SET_ASYNC_LOADING_STATE, key, newAsyncState };
}
