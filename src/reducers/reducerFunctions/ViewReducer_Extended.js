import ViewReducer from "_core/reducers/reducerFunctions/ViewReducer";

export default class ViewReducer_Extended extends ViewReducer {
    static completeLandingPageLoad(state, action) {
        return state.set("landingPageLoaded", true);
    }

    // static showMapControlContainer(state, action) {
    //     return state.set("mapControlsBoxVisible", true);
    // }
    static changeAppMode(state, action) {
        return state.set("appMode", action.mode);
    }
}
