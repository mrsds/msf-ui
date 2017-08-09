import appConfig from 'constants/appConfig';
import MapUtil from '_core/utils/MapUtil';

export default class MapUtil_Extended extends MapUtil {

    buildAvailableLayerQueryString(extent) {
        const [lonMax, latMax] = this.constrainCoordinates([parseFloat(extent.get(2)), parseFloat(extent.get(3))]);
        const [lonMin, latMin] = this.constrainCoordinates([parseFloat(extent.get(0)), parseFloat(extent.get(1))]);
        return appConfig.URLS.vistaEndpoint
            .replace('{latMax}', latMax)
            .replace('{lonMax}', lonMax)
            .replace('{latMin}', latMin)
            .replace('{lonMin}', lonMin);
    }

}