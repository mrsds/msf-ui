import * as types from "constants/actionTypes";

export function setJumpToNearestPending(direction) {
    return { type: types.SET_JUMP_TO_NEAREST_PENDING, direction };
}
