import ViewReducer from "_core/reducers/reducerFunctions/ViewReducer";

export default class ViewReducer_Extended extends ViewReducer {
    static hideMapControlContainer(state, action) {
        return state.set("mapControlsBoxVisible", false);
    }

    static showMapControlContainer(state, action) {
        return state.set("mapControlsBoxVisible", true);
    }
}
