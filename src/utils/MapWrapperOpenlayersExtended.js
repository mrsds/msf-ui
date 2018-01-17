import moment from "moment";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Source_StaticImage from "ol/source/imagestatic";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Format_KML from "ol/format/kml";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Style from "ol/style/style";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Style_Text from "ol/style/text";
import Ol_Style_Icon from "ol/style/icon";
import Ol_Overlay from "ol/overlay";
import Ol_Extent from "ol/extent";
import Ol_Source_XYZ from "ol/source/xyz";
import Ol_Layer_Group from "ol/layer/group";
import Ol_Feature from "ol/feature";
import Ol_Geom_Point from "ol/geom/point";
import MapWrapperOpenlayers from "_core/utils/MapWrapperOpenlayers";
import MiscUtilExtended from "utils/MiscUtilExtended";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import tooltipStyles from "components/Map/MapTooltip.scss";

const JSZip = require("jszip");

export default class MapWrapperOpenlayersExtended extends MapWrapperOpenlayers {
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
            case appStringsMSF.LAYER_VISTA_GEOJSON:
                mapLayer = this.createVistaLayer(layer, fromCache);
                break;
            case appStringsMSF.LAYER_AVIRIS:
                mapLayer = this.createAvirisLayers(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_TOPOJSON:
                mapLayer = this.createVectorLayer(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_KML:
                mapLayer = this.createVectorLayer(layer, fromCache);
                break;
            case appStringsMSF.LAYER_VECTOR_KMZ:
                mapLayer = this.createKMZLayer(layer, fromCache);
                break;
            default:
                console.warn(
                    "Error in MapWrapperOpenlayers.createLayer: unknown layer type - ",
                    layer.get("handleAs")
                );
                mapLayer = false;
                break;
        }

        if (mapLayer) {
            mapLayer.set("_layerId", layer.get("id"));
            mapLayer.set("_layerType", layer.get("type"));
            mapLayer.set("_layerCacheHash", this.getCacheHash(layer));
            mapLayer.set("_layerTime", moment(this.mapDate).format(layer.get("timeFormat")));
            mapLayer.setVisible(true);
        }

        return mapLayer;
    }

    createAvirisLayer(layerJson) {
        // Create plume raster layer
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
        plumeLayer.set("_featureId", layerJson.id);
        plumeLayer.set("_featureExtent", extent.map(val => parseFloat(val)));
        plumeLayer.set("_featureType", "plume");

        return plumeLayer;
    }

    getAvirisIconStyle() {
        return new Ol_Style({
            image: new Ol_Style_Circle({
                radius: 10,
                stroke: new Ol_Style_Stroke({
                    color: "#000000"
                }),
                fill: new Ol_Style_Fill({
                    color: "#3399CC"
                })
            })
        });
    }

    createAvirisIconFeature(layerJson) {
        const shape = layerJson.shape;
        const extent = [shape[0][0], shape[1][1], shape[2][0], shape[0][1]];

        const iconFeature = new Ol_Feature({
            geometry: new Ol_Geom_Point(Ol_Extent.getCenter(extent.map(val => parseFloat(val))))
        });

        iconFeature.setStyle(this.getAvirisIconStyle());
        iconFeature.set("_featureId", layerJson.id);
        iconFeature.set("_featureType", "icon");

        return iconFeature;
    }

    createAvirisLayers(layer, options) {
        const extent = [-180, -90, 180, 90];
        const url = appConfig.URLS.avirisEndpoint
            .replace("{latMax}", extent[3])
            .replace("{lonMax}", extent[2])
            .replace("{latMin}", extent[1])
            .replace("{lonMin}", extent[0]);

        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(json => {
                // console.info(json);

                // Create an icon layer for each AVIRIS feature
                const avirisIconLayer = new Ol_Layer_Vector({
                    source: new Ol_Source_Vector({
                        features: json.map(json => this.createAvirisIconFeature(json))
                    }),
                    minResolution: 0.00005966144664679565
                });
                avirisIconLayer.set("_layerId", "icons");

                // Create layers for each AVIRIS feature and add the layer group (along with the icon layer) to the map
                const avirisLayerGroup = new Ol_Layer_Group({
                    layers: [...json.map(json => this.createAvirisLayer(json)), avirisIconLayer],
                    opacity: layer.get("opacity")
                });
                avirisLayerGroup.set("_layerId", "AVIRIS");
                avirisLayerGroup.set("_layerType", layer.get("type"));

                this.map
                    .getLayers()
                    .insertAt(this.findTopInsertIndexForLayer(avirisLayerGroup), avirisLayerGroup);
            });
    }

    createKMZLayer(layer, fromCache = false) {
        MiscUtilExtended.asyncFetch({
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
                mapLayer.set("_layerTime", moment(this.mapDate).format(layer.get("timeFormat")));
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
        try {
            let mapLayers = this.map.getLayers().getArray();

            // check if layer already exists on map, just move to top
            let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));
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
            console.warn("Error in MapWrapperOpenlayers.activateLayer:", err);
            return false;
        }
    }

    deactivateLayer(layer) {
        try {
            // find the layer on the map
            let mapLayers = this.map.getLayers().getArray();
            this.miscUtil
                .findAllMatchingObjectsInArray(mapLayers, "_layerId", layer.get("id"))
                .forEach(l => this.removeLayer(l));

            // Layer is already not active
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.deactivateLayer:", err);
            return false;
        }
    }

    setLayerOpacity(layer, opacity) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            this.miscUtil
                .findAllMatchingObjectsInArray(mapLayers, "_layerId", layer.get("id"))
                .forEach(l => l.setOpacity(opacity));
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.setLayerOpacity:", err);
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

            const { fill, stroke } = Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).reduce(
                (acc, groupName) => {
                    const group = layerSidebarTypes.INFRASTRUCTURE_GROUPS[groupName];
                    if (acc) return acc;
                    const categoryInGroup = group.categories.some(
                        category => category === layer.get("id")
                    );
                    if (categoryInGroup) return group.colors;
                },
                null
            );

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
            console.warn("Error in MapWrapperOpenlayers.createVectorLayer:", err);
            return false;
        }
    }

    setCenter(coords) {
        this.map.getView().setCenter(coords.map(val => parseFloat(val)));
    }

    fitFeature(extent) {
        this.map.getView().fit(extent, {
            duration: 750
        });
        return true;
    }

    centerMapOnFeature(feature, featureType) {
        let featureId = feature.get("id");
        // Resolve feature from id by featureType

        if (featureType === "VISTA") {
            // TODO there could be a much more optimal way of accessing
            // features, could leave some key trail to reconstruct path
            // to particular features
            this.map.getLayers().forEach(layer => {
                if (!layer.get("_layerId").includes("VISTA")) return;

                layer.getSource().forEachFeature(feature => {
                    if (feature.getProperties().id === featureId) {
                        return this.fitFeature(feature.getGeometry().getExtent());
                    }
                });
            });
        } else if (featureType === "AVIRIS") {
            let avirisLayerGroup = this.map
                .getLayers()
                .getArray()
                .find(l => l.get("_layerId") === "AVIRIS");

            let featureLayer = avirisLayerGroup
                .getLayers()
                .getArray()
                .find(layer => layer.get("_featureId") === featureId);
            if (featureLayer) {
                return this.fitFeature(featureLayer.get("_featureExtent"));
            }
        }
        return false;
    }

    handleAVIRISLabelToggle(pickedFeature, currentMapExtent, toggleOn) {
        const avirisLayerGroup = this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS");

        const featureId = pickedFeature.get("id");
        const featureLayer = avirisLayerGroup
            .getLayers()
            .getArray()
            .find(layer => layer.get("_featureId") === featureId);
        const iconFeature = avirisLayerGroup
            .getLayers()
            .getArray()
            .find(layer => layer.get("_layerId") === "icons")
            .getSource()
            .getFeatures()
            .find(f => f.get("_featureId") === featureId);

        // Add or remove label
        const featureExtent = featureLayer.get("_featureExtent");
        const isVisible = Ol_Extent.containsExtent(currentMapExtent, featureExtent);

        if (toggleOn) {
            const center = Ol_Extent.getCenter(featureExtent);
            this.addFeatureLabel(
                featureId,
                MiscUtilExtended.formatPlumeDatetime(pickedFeature.get("datetime")),
                pickedFeature.get("name"),
                center,
                {
                    sourceLayerId: avirisLayerGroup.get("_layerId"),
                    overlayType: "AVIRIS"
                }
            );
            iconFeature.setStyle(new Ol_Style({ display: "none" }));
            return;
        }

        // If toggling off, remove old overlay and restore the reference icon feature
        const oldOverlay = this.map
            .getOverlays()
            .getArray()
            .find(overlay => overlay.get("_featureId") === featureId);
        this.map.removeOverlay(oldOverlay);
        iconFeature.setStyle(this.getAvirisIconStyle());
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
                const featureId = pickedFeature.get("id");
                if (feature.getProperties().id === featureId) {
                    const featureExtent = feature.getGeometry().getExtent();
                    const center = Ol_Extent.getCenter(featureExtent);

                    // If we're adding a label, we change the styling of the feature to be highlighted,
                    // center the map to the feature if it's not entirely in the map, and create/place a tooltip.
                    if (toggleOn) {
                        this.addFeatureLabel(
                            featureId,
                            pickedFeature.get("name"),
                            pickedFeature.get("category"),
                            center,
                            {
                                sourceLayerId: layer.get("_layerId"),
                                overlayType: "VISTA"
                            }
                        );
                        feature.setStyle(selectedFeatureStyle);
                        return;
                    }

                    // If we're deselecting a feature, destroy the tooltip and revert the feature styling to default.
                    this.map.getOverlays().forEach(overlay => {
                        if (overlay.getId() === featureId) {
                            this.map.removeOverlay(overlay);
                        }
                    });
                    feature.setStyle(null);
                    return;
                }
            });
        });
    }

    clearFeatureLabels() {
        // For each feature overlay, remove the overlay and set the style
        // of the corresponding feature to null
        let mapLayers = this.map.getLayers().getArray();
        this.map.getOverlays().forEach(overlay => {
            // If overlay is VISTA we need to deselect the corresponding feature
            let overlayType = overlay.getProperties().overlayType;
            if (overlayType === "VISTA") {
                let featureSourceLayerId = overlay.getProperties().sourceLayerId;
                let vistaLayer = this.miscUtil.findObjectInArray(
                    mapLayers,
                    "_layerId",
                    featureSourceLayerId
                );
                if (vistaLayer) {
                    let feature = vistaLayer
                        .getSource()
                        .getFeatures()
                        .find(f => f.get("id") === overlay.getProperties()._featureId);
                    if (feature) {
                        feature.setStyle(null);
                    }
                } else {
                    console.warn("Unable to find VISTA layer for overlay deselect");
                }
            }

            // Remove overlay if it's AVIRIS or VISTA
            if (overlayType === "AVIRIS" || overlayType === "VISTA") {
                this.map.removeOverlay(overlay);
            }
        });
        return;
    }

    setFeatureLabel(category, pickedFeature, toggleOn) {
        const currentMapExtent = this.map.getView().calculateExtent();
        switch (category) {
            case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
                this.handleVISTALabelToggle(pickedFeature, currentMapExtent, toggleOn);
                break;
            case layerSidebarTypes.CATEGORY_PLUMES:
                this.handleAVIRISLabelToggle(pickedFeature, currentMapExtent, toggleOn);
                break;
        }
    }

    addFeatureLabel(id, title, subtitle, coords, opt_meta = {}) {
        try {
            // Create label domNode
            let featureLabelContainerEl = document.createElement("div");
            featureLabelContainerEl.className = tooltipStyles.tooltip;

            let featureLabelTitleEl = document.createElement("div");
            featureLabelTitleEl.className = tooltipStyles.title;
            featureLabelTitleEl.innerHTML = title;

            let featureLabelSubtitleEl = document.createElement("div");
            featureLabelSubtitleEl.className = tooltipStyles.subtitle;
            featureLabelSubtitleEl.innerHTML = subtitle;

            featureLabelContainerEl.appendChild(featureLabelTitleEl);
            featureLabelContainerEl.appendChild(featureLabelSubtitleEl);

            // create ol overlay
            let featureLabel = new Ol_Overlay({
                element: featureLabelContainerEl,
                // offset: [0, -15],
                positioning: "bottom-center",
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                },
                stopEvent: false
            });
            featureLabel.set("_featureId", id);

            // store meta opt_meta
            for (let key in opt_meta) {
                if (opt_meta.hasOwnProperty(key)) {
                    featureLabel.set(key, opt_meta[key], true);
                }
            }

            // position and place
            this.map.addOverlay(featureLabel);
            featureLabel.setPosition(coords);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.addLabel:", err);
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

    updateSize() {
        this.map.updateSize();
    }
}
