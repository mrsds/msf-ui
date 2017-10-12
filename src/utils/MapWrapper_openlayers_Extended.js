import moment from "moment";
import * as appStrings from "_core/constants/appStrings";
import * as appStrings_Extended from "constants/appStrings_Extended";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Source_StaticImage from "ol/source/imagestatic";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Format_KML from "ol/format/kml";

import MapWrapper_openlayers from "_core/utils/MapWrapper_openlayers";
import MiscUtil_Extended from "utils/MiscUtil_Extended";
import appConfig from "constants/appConfig";

const JSZip = require("jszip");

export default class MapWrapper_openlayers_Extended extends MapWrapper_openlayers {
	createLayer(layer, fromCache = true) {
		let mapLayer = false;

		// pull from cache if possible
		let cacheHash = this.getCacheHash(layer);
		if (fromCache && this.layerCache.get(cacheHash)) {
			let cachedLayer = this.layerCache.get(cacheHash);
			cachedLayer.setOpacity(layer.get("opacity"));
			cachedLayer.setVisible(layer.get("isActive"));
			return cachedLayer;
		}

		switch (layer.get("handleAs")) {
			case appStrings.LAYER_GIBS_RASTER:
				mapLayer = this.createWMTSLayer(layer, fromCache);
				break;
			case appStrings.LAYER_WMTS_RASTER:
				mapLayer = this.createWMTSLayer(layer, fromCache);
				break;
			case appStrings.LAYER_XYZ_RASTER:
				mapLayer = this.createWMTSLayer(layer, fromCache);
				break;
			case appStrings.LAYER_VECTOR_GEOJSON:
				mapLayer = this.createVectorLayer(layer, fromCache);
				break;
			case appStrings_Extended.LAYER_AVIRIS:
				mapLayer = this.createAvirisLayers(layer, fromCache);
				//mapLayer = this.createVectorLayer(layer, fromCache);
				break;
			case appStrings.LAYER_VECTOR_TOPOJSON:
				mapLayer = this.createVectorLayer(layer, fromCache);
				break;
			case appStrings.LAYER_VECTOR_KML:
				mapLayer = this.createVectorLayer(layer, fromCache);
				break;
			case appStrings_Extended.LAYER_VECTOR_KMZ:
				mapLayer = this.createKMZLayer(layer, fromCache);
				break;
			default:
				console.warn(
					"Error in MapWrapper_openlayers.createLayer: unknown layer type - ",
					layer.get("handleAs")
				);
				mapLayer = false;
				break;
		}

		if (mapLayer) {
			mapLayer.set("_layerId", layer.get("id"));
			mapLayer.set("_layerType", layer.get("type"));
			mapLayer.set("_layerCacheHash", this.getCacheHash(layer));
			mapLayer.set(
				"_layerTime",
				moment(this.mapDate).format(layer.get("timeFormat"))
			);
			mapLayer.setVisible(true);
		}

		return mapLayer;
	}

	createAvirisLayer(scope, layerJson, topLayer) {
		let plume_url = layerJson.plume_url;
		let shape = layerJson.shape;
		let extent = [shape[0][0], shape[1][1], shape[2][0], shape[0][1]];

		let staticPlumeImage = new Ol_Source_StaticImage({
			url: plume_url,
			imageExtent: extent
		});

		let plumeLayer = new Ol_Layer_Image({
			source: staticPlumeImage
		});

		plumeLayer.set("_layerId", topLayer.get("id"));
		plumeLayer.set("_layerType", topLayer.get("type"));

		let index = scope.findTopInsertIndexForLayer(plumeLayer);
		scope.map.getLayers().insertAt(index, plumeLayer);
	}

	createAvirisLayers(layer, options) {
		/*
      let createPlumeVector = function(vectorSource, jsonUrl) {
        jsonUrl = "https://s3-us-gov-west-1.amazonaws.com/methane/AVIRIS/test.json";
        let format = new Ol_Format_GeoJSON();

        fetch(jsonUrl).then((response) => {
            return response.json();
        }).then(function(json) {

            console.info(json);
            let features = format.readFeatures(json, {featureProjection: 'EPSG:4326'});
            features[0].setId(jsonUrl);
            console.info(features);
            vectorSource.addFeatures(features);
        });

      };
      */

		const extent = this.getExtent();
		const url = appConfig.URLS.avirisEndpoint
			.replace("{latMax}", extent[3])
			.replace("{lonMax}", extent[2])
			.replace("{latMin}", extent[1])
			.replace("{lonMin}", extent[0]);

		let scope = this;
		fetch(url)
			.then(response => {
				return response.json();
			})
			.then(function(json) {
				console.info(json);
				for (let i = 0; i < json.length; i++) {
					let layerJson = json[i];
					scope.createAvirisLayer(scope, layerJson, layer);
				}
			});

		// Returns a blank image layer to make the openlayers stuff up above happy.
		// return new Ol_Layer_Image({});

		/*
       let extent = [-118.409132561, 33.9107045204, -118.397865128, 33.9013096592];
      let plume = new Ol_Source_StaticImage({
        url : "https://s3-us-gov-west-1.amazonaws.com/methane/AVIRIS/ang20160910t193531_S00009_r7078_c866_ctr.png",
        imageExtent: extent
      });
      let imageLayer = new Ol_Layer_Image({
        source:plume
      });
      return imageLayer;
      */
		/*
      let format = new Ol_Format_GeoJSON();
      let vectorSource = new Ol_Source_Vector({
        url: options.url,
        loader: function(extent, resolution, projection) {
          this.resolution = resolution;

          let url = options.url;

          if (url.indexOf("?") == -1) {
            url += "?";
          } else {
            url += "&";
          }

          url += "minLon" + extent[0];
          url += "&minLat" + extent[1];
          url += "&maxLon" + extent[2];
          url += "&maxLat" + extent[3];

          fetch(url).then((response) => {
            return response.json();
          }).then(function(json) {
            console.info(json);

            //for (let i = 0; i < json.length; i++) {
            //  createPlumeVector(vectorSource, json[i].json_url);
           // }

          });
        }//,
        //strategy: function(extent, resolution) {
          //if(this.resolution && this.resolution != resolution){
          //  this.loadedExtentsRtree_.clear();
          //}
          //return [extent];
        //}
      });

      return vectorSource;
      */
	}

	createKMZLayer(layer, fromCache = false) {
		const scope = this;
		const miscUtil = new MiscUtil_Extended();
		miscUtil
			.asyncFetch({
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
				const kmlLayer = layer.set("handleAs", "vector_kml");
				const layerSource = this.createLayerSource(kmlLayer, { url });
				const mapLayer = new Ol_Layer_Vector({
					source: layerSource,
					opacity: layer.get("opacity")

					// style: this.vectorStyleSelector,
				});
				mapLayer.set("_layerId", layer.get("id"));
				mapLayer.set("_layerType", layer.get("type"));
				mapLayer.set("_layerCacheHash", this.getCacheHash(layer));
				mapLayer.set(
					"_layerTime",
					moment(this.mapDate).format(layer.get("timeFormat"))
				);
				this.addLayer(mapLayer);
				mapLayer.setVisible(true);
				// const index = scope.findTopInsertIndexForLayer(mapLayer);
				// scope.map.getLayers().insertAt(index, mapLayer);
			});
		return null;
	}

	setLayerActive(layer, active) {
		if (active) {
			return this.activateLayer(layer);
		} else {
			return this.deactivateLayer(layer);
		}
	}

	activateLayer(layer) {
		// debugger;
		try {
			let mapLayers = this.map.getLayers().getArray();

			// check if layer already exists on map, just move to top
			let mapLayer = this.miscUtil.findObjectInArray(
				mapLayers,
				"_layerId",
				layer.get("id")
			);
			if (mapLayer) {
				this.moveLayerToTop(layer);
				return true;
			}

			// layer does not exist so we must create it
			mapLayer = this.createLayer(layer);

			if (!mapLayer) {
				return true;
			}

			// layer creation succeeded, add and set visible
			this.addLayer(mapLayer);
			mapLayer.setVisible(true);
			return true;
		} catch (err) {
			console.warn("Error in MapWrapper_openlayers.activateLayer:", err);
			return false;
		}
	}

	deactivateLayer(layer) {
		try {
			// find the layer on the map
			let mapLayers = this.map.getLayers().getArray();
			this.miscUtil
				.findAllMatchingObjectsInArray(
					mapLayers,
					"_layerId",
					layer.get("id")
				)
				.forEach(l => this.removeLayer(l));

			// Layer is already not active
			return true;
		} catch (err) {
			console.warn(
				"Error in MapWrapper_openlayers.deactivateLayer:",
				err
			);
			return false;
		}
	}

	setLayerOpacity(layer, opacity) {
		try {
			let mapLayers = this.map.getLayers().getArray();
			this.miscUtil
				.findAllMatchingObjectsInArray(
					mapLayers,
					"_layerId",
					layer.get("id")
				)
				.forEach(l => l.setOpacity(opacity));
			return true;
		} catch (err) {
			console.warn(
				"Error in MapWrapper_openlayers.setLayerOpacity:",
				err
			);
			return false;
		}
	}
}
