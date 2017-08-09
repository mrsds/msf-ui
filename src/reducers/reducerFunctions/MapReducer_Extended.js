import MapReducer from '_core/reducers/reducerFunctions/MapReducer';
import * as appStrings from '_core/constants/appStrings';
import appConfig from 'constants/appConfig';

export default class MapReducer_Extended extends MapReducer {
    static updateAvailableLayers(state, action) {
        return state;
        // console.log(action.layerList);
        // const updatedLayers = state
        //     .getIn(["layers", "data"])
        //     .map((layer) => {
        //         console.log(layer.get("title"));
        //         // action.layerList.forEach(entry => console.log(entry.properties.category));
        //         console.log(action.layerList.some(entry => layer.get("title").includes(entry.properties.category)));
        //         return layer;
        //         // !action.layerList.some(entry => layer.get("id").includes(entry.properties.category));
        //     });
        // // updatedLayers.forEach(layer => console.log(layer.get("isDisabled")));
        // return state.setIn(["layers", "data"], updatedLayers);
    }
}