import LayerInfoReducer from '_core/reducers/reducerFunctions/LayerInfoReducer';
import * as appStrings from '_core/constants/appStrings';
import appConfig from 'constants/appConfig';

export default class LayerReducer_Extended extends LayerInfoReducer {
    // static changeMapView(state, action) {
    //     const extents = state.getIn(["view", "extent"]);
    //     const queryString = appConfig.URLS.vistaEndpoint
    //         .replace('{latMax}', extents.get(3))
    //         .replace('{lonMax}', extents.get(2))
    //         .replace('{latMin}', extents.get(1))
    //         .replace('{lonMin}', extents.get(0));
    //     return state;
    //     // console.log(queryString);

    //     // const newLayers = state.getIn(["layers", "data"]).map((layer) => {
    //     //     if (layer.get("id") === "VISTA_2017_LNG_FUELING_STATIONS") {
    //     //         return layer.set("isDisabled", true);
    //     //     } else {
    //     //         return layer;
    //     //     }
    //     // });
    //     // const newState = state.setIn(["layers", "data"], newLayers);

    //     // return MapReducer.setMapView(newState, action);
    // }
}