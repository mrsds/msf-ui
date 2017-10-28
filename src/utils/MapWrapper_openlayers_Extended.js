import moment from "moment";
import * as appStrings from "_core/constants/appStrings";
import * as appStrings_Extended from "constants/appStrings_Extended";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Source_StaticImage from "ol/source/imagestatic";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Format_KML from "ol/format/kml";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Style from "ol/style/style";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Style_Text from "ol/style/text";
import Ol_Overlay from "ol/overlay";
import Ol_Extent from "ol/extent";
import Ol_Source_XYZ from "ol/source/xyz";

import MapWrapper_openlayers from "_core/utils/MapWrapper_openlayers";
import MiscUtil_Extended from "utils/MiscUtil_Extended";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

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
			case appStrings_Extended.LAYER_VISTA_GEOJSON:
				mapLayer = this.createVistaLayer(layer, fromCache);
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
			imageExtent: extent,
			crossOrigin: "anonymous"
		});

		let plumeLayer = new Ol_Layer_Image({
			source: staticPlumeImage
		});

		plumeLayer.set("_layerId", topLayer.get("id"));
		plumeLayer.set("_layerType", topLayer.get("type"));
		plumeLayer.set("_featureId", layerJson.id);
		plumeLayer.set("_featureExtent", extent.map(val => parseFloat(val)));

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

	createVistaLayer(layer, fromCache = true) {
		try {
			let layerSource = this.createLayerSource(
				layer.set("handleAs", appStrings.LAYER_VECTOR_GEOJSON),
				{
					url: layer.get("url")
				}
			);
			if (layer.get("clusterVector")) {
				layerSource = new Ol_Source_Cluster({ source: layerSource });
			}

			const { fill, stroke } = Object.keys(
				layerSidebarTypes.INFRASTRUCTURE_GROUPS
			).reduce((acc, groupName) => {
				const group =
					layerSidebarTypes.INFRASTRUCTURE_GROUPS[groupName];
				if (acc) return acc;
				const categoryInGroup = group.categories.some(
					category => category === layer.get("id")
				);
				if (categoryInGroup) return group.colors;
			}, null);

			const style = new Ol_Style({
				fill: new Ol_Style_Fill({
					color: fill
				}),
				stroke: new Ol_Style_Stroke({
					color: stroke,
					width: 1
				}),
				image: new Ol_Style_Circle({
					radius: 4,
					fill: new Ol_Style_Fill({
						color: stroke
					})
				})
			});

			const vistaLayer = new Ol_Layer_Vector({
				source: layerSource,
				opacity: layer.get("opacity"),
				visible: layer.get("isActive"),
				extent: appConfig.DEFAULT_MAP_EXTENT,
				style
			});
			vistaLayer.set("_layerId", "VISTA");
			return vistaLayer;
		} catch (err) {
			console.warn(
				"Error in MapWrapper_openlayers.createVectorLayer:",
				err
			);
			return false;
		}
	}

	setCenter(coords) {
		this.map.getView().setCenter(coords.map(val => parseFloat(val)));
	}

	handleAVIRISLabelToggle(pickedFeature, currentMapExtent, toggleOn) {
		this.map.getLayers().forEach(layer => {
			if (layer.get("_featureId") !== pickedFeature.get("id")) return;

			const featureExtent = layer.get("_featureExtent");
			const isVisible = Ol_Extent.containsExtent(
				currentMapExtent,
				featureExtent
			);
			const featureLabelId = pickedFeature.get("id") + "_label";
			if (toggleOn) {
				if (!isVisible) this.map.getView().setCenter(featureExtent);
				const center = Ol_Extent.getCenter(featureExtent);
				this.addFeatureLabel(
					featureLabelId,
					pickedFeature.get("name"),
					center
				);
				return;
			}
			const labelToRemove = document.getElementById(featureLabelId);
			labelToRemove.parentElement.removeChild(labelToRemove);
			return;
		});
	}

	handleVISTALabelToggle(pickedFeature, currentMapExtent, toggleOn) {
		const selectedFeatureStyle = new Ol_Style({
			fill: new Ol_Style_Fill({
				color: "rgba(255,255,255,0.4)"
			}),
			stroke: new Ol_Style_Stroke({
				color: "#3399CC",
				width: 1.25
			})
		});
		this.map.getLayers().forEach(layer => {
			if (!layer.get("_layerId").includes("VISTA")) return;

			layer.getSource().forEachFeature(feature => {
				if (feature.getProperties().id === pickedFeature.get("id")) {
					const featureLabelId = pickedFeature.get("id") + "_label";
					const featureExtent = feature.getGeometry().getExtent();
					const center = Ol_Extent.getCenter(featureExtent);

					// If we're adding a label, we change the styling of the feature to be highlighted,
					// center the map to the feature if it's not entirely in the map, and create/place a tooltip.
					if (toggleOn) {
						if (
							!Ol_Extent.containsExtent(
								currentMapExtent,
								featureExtent
							)
						) {
							this.map.getView().setCenter(featureExtent);
						}

						this.addFeatureLabel(
							featureLabelId,
							pickedFeature.get("name"),
							center
						);
						feature.setStyle(selectedFeatureStyle);
						return;
					}

					// If we're deselecting a feature, destroy the tooltip and revert the feature styling to default.
					const labelToRemove = document.getElementById(
						featureLabelId
					);
					labelToRemove.parentElement.removeChild(labelToRemove);
					feature.setStyle(null);
					return;
				}
			});
		});
	}

	setFeatureLabel(category, pickedFeature, toggleOn) {
		const currentMapExtent = this.map.getView().calculateExtent();
		switch (category) {
			case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
				this.handleVISTALabelToggle(
					pickedFeature,
					currentMapExtent,
					toggleOn
				);
				break;
			case layerSidebarTypes.CATEGORY_PLUMES:
				this.handleAVIRISLabelToggle(
					pickedFeature,
					currentMapExtent,
					toggleOn
				);
				break;
		}
	}

	addFeatureLabel(id, label, coords, opt_meta = {}) {
		try {
			// Create label domNode
			let measureLabelEl = document.createElement("div");
			measureLabelEl.className = "tooltip tooltip-static";
			measureLabelEl.innerHTML = label;
			measureLabelEl.id = id;

			// create ol overlay
			let measureLabel = new Ol_Overlay({
				element: measureLabelEl,
				offset: [0, -15],
				positioning: "bottom-center"
			});

			// store meta opt_meta
			for (let key in opt_meta) {
				if (opt_meta.hasOwnProperty(key)) {
					measureLabel.set(key, opt_meta[key], true);
				}
			}

			// position and place
			measureLabel.setPosition(coords);
			this.map.addOverlay(measureLabel);
			return true;
		} catch (err) {
			console.warn("Error in MapWrapper_openlayers.addLabel:", err);
			return false;
		}
	}

	createXYZSource(layer, options) {
		return new Ol_Source_XYZ({
			url: options.url,
			projection: options.projection,
			maxZoom: options.tileGrid.maxZoom,
			minZoom: options.tileGrid.minZoom,
			tileSize: options.tileGrid.tileSize,
			wrapX: true,
			crossOrigin: "anonymous"
		});
	}
}