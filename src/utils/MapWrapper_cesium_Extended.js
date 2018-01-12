import moment from "moment";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Source_StaticImage from "ol/source/imagestatic";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Format_KML from "ol/format/kml";

import MapWrapper_cesium from "_core/utils/MapWrapper_cesium";
import MiscUtil_Extended from "utils/MiscUtil_Extended";

const JSZip = require("jszip");

export default class MapWrapper_cesium_Extended extends MapWrapper_cesium {
    createLayer(layer) {
        switch (layer.get("handleAs")) {
            case appStrings.LAYER_GIBS_RASTER:
                return this.createWMTSLayer(layer);
            case appStrings.LAYER_WMTS_RASTER:
                return this.createWMTSLayer(layer);
            case appStrings.LAYER_XYZ_RASTER:
                return this.createWMTSLayer(layer);
            case appStrings.LAYER_VECTOR_GEOJSON:
                return this.createVectorLayer(layer);
            case appStringsMSF.LAYER_AVIRIS:
                return this.createVectorLayer(layer);
            case appStringsMSF.LAYER_VISTA_GEOJSON:
                return this.createVectorLayer(
                    layer.set("handleAs", appStrings.LAYER_VECTOR_GEOJSON)
                );
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.createVectorLayer(layer);
            case appStrings.LAYER_VECTOR_KML:
                return this.createVectorLayer(layer);
            case appStrings.LAYER_VECTOR_DRAWING:
                return this.createVectorLayer(layer);
            case appStringsMSF.LAYER_VECTOR_KMZ:
                return this.createVectorLayer(layer);
            default:
                console.warn(
                    "Error in MapWrapper_cesium.createLayer: unknown layer type - " +
                        layer.get("handleAs")
                );
                return false;
        }
    }

    createVectorSource(layer, options) {
        switch (layer.get("handleAs")) {
            case appStrings.LAYER_VECTOR_GEOJSON:
                return this.createGeoJsonSource(layer, options);
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.createGeoJsonSource(layer, options);
            case appStrings.LAYER_VECTOR_KML:
                return this.createKmlSource(layer, options);
            case appStringsMSF.LAYER_VECTOR_KMZ:
                return this.createKmlSource(layer, options);
            default:
                return false;
        }
    }

    createKmlSource(layer, options) {
        const scope = this;
        return MiscUtil_Extended.asyncFetch({
            url: layer.get("url"),
            handleAs: "blob"
        })
            .then(res => {
                return Promise.resolve(res.blob());
            })
            .then(JSZip.loadAsync)
            .then(zip => {
                return zip.file("doc.kml").async("blob");
            })
            .then(string => {
                const url = URL.createObjectURL(string);
                return this.cesium.KmlDataSource.load(url, {
                    camera: this.map.scene.camera,
                    canvas: this.map.scene.canvas,
                    show: layer.get("isActive")
                });
            });
    }

    getMapLayers(type) {
        switch (type) {
            case appStrings.LAYER_GIBS_RASTER:
                return this.map.imageryLayers;
            case appStrings.LAYER_WMTS_RASTER:
                return this.map.imageryLayers;
            case appStrings.LAYER_XYZ_RASTER:
                return this.map.imageryLayers;
            case appStrings.LAYER_VECTOR_GEOJSON:
                return this.map.dataSources;
            case appStrings.LAYER_AVIRIS:
                return this.map.dataSources;
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.map.dataSources;
            case appStrings.LAYER_VECTOR_KML:
                return this.map.dataSources;
            case appStringsMSF.LAYER_VECTOR_KMZ:
                return this.map.dataSources;
            default:
                return this.map.imageryLayers;
        }
    }

    activateLayer(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));

            // check if layer already exists on map, just move to top
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                this.moveLayerToTop(layer);
                return true;
            }

            // layer does not exist so we must create it
            mapLayer = this.createLayer(layer);

            // if the creation failed
            // TODO: Fix this check once we get AVIRIS layers working in Cesium
            if (!mapLayer) {
                return true;
            }

            // layer creation succeeded, add the layer to map and make it visible
            this.addLayer(mapLayer);
            mapLayer.show = true;
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.activateLayer:", err);
            return false;
        }
    }

    deactivateLayer(layer) {
        try {
            // find the layer on the map
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);

            // remove the layer
            if (mapLayer) {
                return this.removeLayer(mapLayer);
            }

            // Layer is already not active
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.deactivateLayer:", err);
            return false;
        }
    }

    setCenter(coords) {
        console.log("TODO: make cesium center");
    }

    setFeatureLabel(category, id, toggleOn) {
        // console.log("TODO: add labels to cesium");
    }

    getFeatureAtClick(pixel) {
        // console.log("TODO: add click handler to cesium");
    }

    updateSize() {}
}
