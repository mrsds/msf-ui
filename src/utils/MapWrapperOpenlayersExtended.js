import moment from "moment";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Source_StaticImage from "ol/source/imagestatic";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Format_KML from "ol/format/kml";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_WMTS from "ol/source/wmts";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Tilegrid_WMTS from "ol/tilegrid/wmts";
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
import Ol_View from "ol/view";
import Ol_Proj from "ol/proj";
import Ol_Interaction from "ol/interaction";
import Ol_Map from "ol/map";
import Ol_Control from "ol/control";
import Ol_Scaleline from "ol/control/scaleline";
import Ol_Format_GeoJSON from "ol/format/geojson";
import MapWrapperOpenlayers from "_core/utils/MapWrapperOpenlayers";
import MiscUtilExtended from "utils/MiscUtilExtended";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
// import tooltipStyles from "components/Map/MapTooltip.scss";
import React, { Component } from "react";
import { render } from "react-dom";
// import MapLabel from "components/Map/MapLabel";

const JSZip = require("jszip");
const INVISIBLE_VISTA_STYLE = new Ol_Style({
    fill: new Ol_Style_Fill({
        color: [0, 0, 0, 0]
    }),
    stroke: new Ol_Style_Stroke({
        color: [0, 0, 0, 0],
        width: 0
    }),
    image: new Ol_Style_Circle({
        radius: 4,
        fill: new Ol_Style_Fill({
            color: [0, 0, 0, 0]
        })
    })
});

const VISTA_STYLES_BY_SECTOR = {};
Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).forEach(groupName => {
    const group = layerSidebarTypes.INFRASTRUCTURE_GROUPS[groupName];
    VISTA_STYLES_BY_SECTOR[groupName] = new Ol_Style({
        fill: new Ol_Style_Fill({
            color: group.colors.fill
        }),
        stroke: new Ol_Style_Stroke({
            color: group.colors.stroke,
            width: 1
        }),
        image: new Ol_Style_Circle({
            radius: 4,
            fill: new Ol_Style_Fill({
                color: group.colors.stroke
            })
        })
    });
});

// const { fill, stroke } = Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).reduce(
//     (acc, groupName) => {
//         const group = layerSidebarTypes.INFRASTRUCTURE_GROUPS[groupName];
//         if (acc) return acc;
//         const categoryInGroup = group.categories.some(category => category === layerId);
//         if (categoryInGroup) return group.colors;
//     },
//     null
// );

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
            case appStringsMSF.LAYER_GRIDDED_GEOJSON:
                mapLayer = this.createGriddedVectorLayer(layer, fromCache);
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

    createMap(container, options) {
        try {
            // create default draw layer
            let vectorSource = new Ol_Source_Vector({ wrapX: true });

            let vectorLayer = new Ol_Layer_Vector({
                source: vectorSource,
                style: this.defaultGeometryStyle,
                extent: appConfig.DEFAULT_MAP_EXTENT
            });
            vectorLayer.set("_layerId", "_vector_drawings");
            vectorLayer.set("_layerType", appStrings.LAYER_GROUP_TYPE_REFERENCE);

            // get the view options for the map
            let viewOptions = options.get("view").toJS();
            let mapProjection = Ol_Proj.get(appConfig.DEFAULT_PROJECTION.code);
            let center = viewOptions.center;
            this.overlay = this.createOverlay();

            return new Ol_Map({
                target: container,
                renderer: ["canvas", "dom"],
                layers: [vectorLayer],
                overlays: [this.overlay],
                view: new Ol_View({
                    maxZoom: viewOptions.maxZoom,
                    minZoom: viewOptions.minZoom,
                    projection: mapProjection,
                    maxResolution: viewOptions.maxResolution
                }),
                controls: new Ol_Control.defaults({
                    attributionOptions: {
                        collapsible: false
                    }
                }).extend([new Ol_Scaleline()]),
                interactions: Ol_Interaction.defaults({
                    altShiftDragRotate: false,
                    pinchRotate: false,
                    shiftDragZoom: false,
                    keyboard: false
                })
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createMap:", err);
            return false;
        }
    }
    createOverlay() {
        // create ol overlay
        return new Ol_Overlay({
            // element: labelContainer,
            element: document.getElementById("mapTooltip"),
            // offset: [0, -15],
            positioning: "bottom-center",
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            },
            stopEvent: true
        });
    }

    griddedVectorLayerStyleFunction(feature, resolution) {
        const dnValue = parseFloat(feature.getProperties().DN);

        let fillColor = "rgba(0, 0, 0, 0)";
        if (dnValue >= 0 && dnValue < 38) {
            fillColor = "rgba(148, 206, 88, 1.0)";
        } else if (dnValue >= 38 && dnValue < 70) {
            fillColor = "rgba(255, 254, 56, 1.0)";
        } else if (dnValue >= 70 && dnValue < 130) {
            fillColor = "rgba(254, 192, 45, 1.0)";
        } else if (dnValue >= 130) {
            fillColor = "rgba(253, 13, 27, 1.0)";
        }
        return new Ol_Style({
            // stroke: new Ol_Style_Stroke({ color: "#000000" }),
            fill: new Ol_Style_Fill({ color: `${fillColor}` })
        });
    }

    createGriddedVectorLayer(layer, options) {
        const layerSource = this.createLayerSource(
            layer.set("handleAs", appStrings.LAYER_VECTOR_GEOJSON),
            {
                url: layer.get("url")
            }
        );

        const mapLayer = new Ol_Layer_Vector({
            source: layerSource,
            opacity: layer.get("opacity"),
            style: this.griddedVectorLayerStyleFunction
        });
        mapLayer.set("_layerId", "griddedFlux");
        mapLayer.set("_layerOrder", layer.get("layerOrder"));
        return mapLayer;
    }

    addLayer(mapLayer) {
        try {
            const layerOrder = mapLayer.get("_layerOrder");
            let index;
            if (typeof layerOrder === "undefined") {
                index = this.findTopInsertIndexForLayer(mapLayer);
            } else {
                index = this.findFixedInsertIndexForLayer(mapLayer);
            }
            this.map.getLayers().insertAt(index + layerOrder, mapLayer);
            this.addLayerToCache(mapLayer, appConfig.TILE_LAYER_UPDATE_STRATEGY);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.addLayer:", err);
            return false;
        }
    }

    /* Inserts a layer at a certain index, relative to others. So, if a certain layer has a "layerOrder" of 1,
    this function finds the position index of the next-highest layer that's active and inserts the layer at
    an index right below it.*/
    findFixedInsertIndexForLayer(mapLayer) {
        const targetOrder = mapLayer.get("_layerOrder");
        const layerCollection = this.map.getLayers();

        let lastLayerOrder = 100;
        let lastLayerIndex = 100;
        for (let i = 0; i < layerCollection.getLength(); i++) {
            const layer = layerCollection.item(i);
            if (layer.get("_layerType") !== appStrings.LAYER_GROUP_TYPE_DATA) continue;
            const layerOrder = layer.get("_layerOrder");
            if (layerOrder > targetOrder && layerOrder < lastLayerOrder && i < lastLayerIndex) {
                lastLayerOrder = layerOrder;
                lastLayerIndex = i;
            }
        }
        return lastLayerIndex - 1;
    }

    changeGriddedVectorLayerDate(date) {
        const griddedFluxLayer = this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "GRIDDED_EMISSIONS_V2");

        const sourceUrl = appConfig.URLS.griddedVectorEndpoint.replace(
            "{date}",
            date.format("YYYYMMDD")
        );

        const newSource = new Ol_Source_Vector({
            url: sourceUrl,
            format: new Ol_Format_GeoJSON()
        });

        griddedFluxLayer.setSource(newSource);
    }

    createAvirisLayer(layerJson) {
        // Create plume raster layer
        let plume_url = layerJson.plume_url;
        let shape = layerJson.shape;
        let extent = [shape[0][0], shape[1][1], shape[2][0], shape[0][1]];
        let transformedExtent = Ol_Proj.transformExtent(
            extent.map(val => parseFloat(val)),
            appStrings.PROJECTIONS.latlon.code,
            this.map
                .getView()
                .getProjection()
                .getCode()
        );

        let staticPlumeImage = new Ol_Source_StaticImage({
            url: plume_url,
            imageExtent: transformedExtent,
            projection: this.map
                .getView()
                .getProjection()
                .getCode(),
            crossOrigin: "anonymous"
        });

        let plumeLayer = new Ol_Layer_Image({
            source: staticPlumeImage
        });
        plumeLayer.set("_featureId", layerJson.id);
        plumeLayer.set("_featureExtent", transformedExtent.map(val => parseFloat(val)));
        plumeLayer.set("_featureType", "plume");

        return plumeLayer;
    }

    createAvirisIconFeature(layerJson) {
        const shape = layerJson.shape;
        const extent = [shape[0][0], shape[1][1], shape[2][0], shape[0][1]];
        let transformedExtent = Ol_Proj.transformExtent(
            extent.map(val => parseFloat(val)),
            appStrings.PROJECTIONS.latlon.code,
            this.map
                .getView()
                .getProjection()
                .getCode()
        );

        const iconFeature = new Ol_Feature({
            geometry: new Ol_Geom_Point(Ol_Extent.getCenter(transformedExtent))
        });

        // iconFeature.setStyle(this.getAvirisIconStyle());
        iconFeature.set("_featureId", layerJson.id);
        iconFeature.set("_featureType", "icon");
        iconFeature.set("_featureActive", false);

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
                // Create an icon layer for each AVIRIS feature
                const avirisIconLayer = new Ol_Layer_Vector({
                    extent: appConfig.DEFAULT_MAP_EXTENT,
                    source: new Ol_Source_Vector({
                        features: json.map(json => this.createAvirisIconFeature(json))
                    }),
                    style: new Ol_Style({
                        image: new Ol_Style_Icon({
                            opacity: 1,
                            src: "img/PlumeIcon.png",
                            scale: 0.6
                        })
                    }),
                    minResolution: 38.2185141425881
                });
                avirisIconLayer.set("_layerId", "icons");

                // Create layers for each AVIRIS feature and add the layer group (along with the icon layer) to the map
                let avirisImageryLayerGroup = new Ol_Layer_Group({
                    maxResolution: 76.43702828517625,
                    layers: [...json.map(json => this.createAvirisLayer(json))]
                });
                avirisImageryLayerGroup.set("_layerId", "AVIRIS_IMAGE_LAYER_GROUP");
                const avirisLayerGroup = new Ol_Layer_Group({
                    layers: [avirisImageryLayerGroup, avirisIconLayer],
                    opacity: layer.get("opacity")
                });
                avirisLayerGroup.set("_layerId", "AVIRIS");
                avirisLayerGroup.set("_layerType", layer.get("type"));

                const layerOrder = layer.get("layerOrder");
                avirisLayerGroup.set("_layerOrder", layerOrder);
                this.map
                    .getLayers()
                    .insertAt(
                        this.findTopInsertIndexForLayer(avirisLayerGroup) + layerOrder,
                        avirisLayerGroup
                    );
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
                console.log("exists");
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
            // If we're dealing with a layer group we need to find all layers
            // with _layerGroup equal to the id of the input layer
            if (layer.get("type") === appStringsMSF.LAYER_GROUP_TYPE_GROUP) {
                this.miscUtil
                    .findAllMatchingObjectsInArray(mapLayers, "_layerGroup", layer.get("id"))
                    .forEach(l => l.setOpacity(opacity));
            } else {
                this.miscUtil
                    .findAllMatchingObjectsInArray(mapLayers, "_layerId", layer.get("id"))
                    .forEach(l => l.setOpacity(opacity));
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.setLayerOpacity:", err);
            return false;
        }
    }

    getVistaStyle(layerId, visible = true) {
        if (!visible) {
            return INVISIBLE_VISTA_STYLE;
        }
        // console.log(layerId,"?", VISTA_STYLES_BY_SECTOR, layerSidebarTypes.INFRASTRUCTURE_ID_TO_SECTOR)
        return VISTA_STYLES_BY_SECTOR[layerSidebarTypes.INFRASTRUCTURE_ID_TO_SECTOR[layerId]];
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

            const style = this.getVistaStyle(layer.get("id"));

            const vistaLayer = new Ol_Layer_Vector({
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                extent: appConfig.DEFAULT_MAP_EXTENT,
                style
            });
            vistaLayer.set("_layerGroup", "VISTA");
            vistaLayer.set("_layerOrder", 1);
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
            let featureLayer = this.getAVIRISFeatureLayerById(featureId);
            // let avirisLayerGroup = this.map
            //     .getLayers()
            //     .getArray()
            //     .find(l => l.get("_layerId") === "AVIRIS");

            // let avirisImageLayerGroup = avirisLayerGroup
            //     .getLayers()
            //     .getArray()
            //     .find(l => l.get("_layerId") === "AVIRIS_IMAGE_LAYER_GROUP");

            // let featureLayer = avirisImageLayerGroup
            //     .getLayers()
            //     .getArray()
            //     .find(layer => layer.get("_featureId") === featureId);
            if (featureLayer) {
                return this.fitFeature(featureLayer.get("_featureExtent"));
            }
        }
        return false;
    }

    getAVIRISFeatureLayerById(id) {
        let avirisLayerGroup = this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS");

        let avirisImageLayerGroup = avirisLayerGroup
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS_IMAGE_LAYER_GROUP");

        return avirisImageLayerGroup
            .getLayers()
            .getArray()
            .find(layer => layer.get("_featureId") === id);
    }

    handleAVIRISLabelToggle(pickedFeature, currentMapExtent) {
        let featureId = pickedFeature.get("id");
        let featureLayer = this.getAVIRISFeatureLayerById(featureId);
        // const avirisLayerGroup = this.map
        //     .getLayers()
        //     .getArray()
        //     .find(l => l.get("_layerId") === "AVIRIS");

        // const featureId = pickedFeature.get("id");
        // const featureLayer = avirisLayerGroup
        //     .getLayers()
        //     .getArray()
        //     .find(layer => layer.get("_featureId") === featureId);
        // const iconFeature = avirisLayerGroup
        //     .getLayers()
        //     .getArray()
        //     .find(layer => layer.get("_layerId") === "icons")
        //     .getSource()
        //     .getFeatures()
        //     .find(f => f.get("_featureId") === featureId);

        // Add or remove label
        const featureExtent = featureLayer.get("_featureExtent");
        const isVisible = Ol_Extent.containsExtent(currentMapExtent, featureExtent);

        const centerCoords = Ol_Extent.getCenter(featureExtent);
        const topLeft = Ol_Extent.getTopLeft(featureExtent);
        const center = [centerCoords[0], topLeft[1]];
        this.addFeatureLabel(
            featureId,
            MiscUtilExtended.formatPlumeDatetime(pickedFeature.get("datetime")),
            pickedFeature.get("name"),
            center,
            {
                sourceLayerId: "AVIRIS",
                overlayType: "AVIRIS"
            }
        );
        // iconFeature.setStyle(new Ol_Style({ display: "none" }));

        // If toggling off, remove old overlay and restore the reference icon feature
        // const oldOverlay = this.map
        //     .getOverlays()
        //     .getArray()
        //     .find(overlay => overlay.get("_featureId") === featureId);
        // this.map.removeOverlay(oldOverlay);
        // iconFeature.setStyle(this.getAvirisIconStyle());
    }

    handleVISTALabelToggle(pickedFeature, currentMapExtent) {
        const selectedFeatureStyle = new Ol_Style({
            fill: new Ol_Style_Fill({
                color: "rgba(255,255,255,0.4)"
            }),
            stroke: new Ol_Style_Stroke({
                color: "#3399CC",
                width: 1.25
            }),
            image: new Ol_Style_Circle({
                radius: 4,
                fill: new Ol_Style_Fill({
                    color: "#3399CC"
                })
            })
        });
        this.map.getLayers().forEach(layer => {
            if (!layer.get("_layerId").includes("VISTA")) return;

            layer.getSource().forEachFeature(feature => {
                const featureId = pickedFeature.get("id");
                if (feature.getProperties().id === featureId) {
                    const featureExtent = feature.getGeometry().getExtent();
                    const centerCoords = Ol_Extent.getCenter(featureExtent);
                    const topLeft = Ol_Extent.getTopLeft(featureExtent);
                    const center = [centerCoords[0], topLeft[1]];

                    // If we're adding a label, we change the styling of the feature to be highlighted,
                    // center the map to the feature if it's not entirely in the map, and create/place a tooltip.
                    this.addFeatureLabel(
                        featureId,
                        pickedFeature.get("name"),
                        pickedFeature.get("category"),
                        center,
                        {
                            sourceLayerId: layer.get("_layerId"),
                            overlayType: "VISTA",
                            _featureId: featureId
                        }
                    );
                    feature.setStyle(selectedFeatureStyle);
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
            let featureSourceLayerId = overlay.getProperties().sourceLayerId;
            if (overlayType === "VISTA") {
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
                    } else {
                        console.warn("Unable to find VISTA feature for overlay deselect");
                    }
                } else {
                    console.warn("Unable to find VISTA layer for overlay deselect");
                }
            }

            // // If overlay is AVIRIS we need to reset the style of the icon (SKIP)
            // if (overlayType === "AVIRIS") {
            //     let featureSourceLayerId = overlay.getProperties().sourceLayerId;
            //     let iconFeature = avirisIconLayerFeatures.find(
            //         f => f.get("_featureId") === overlay.getProperties()._featureId
            //     );
            //     if (iconFeature) {
            //         iconFeature.setStyle(this.getAvirisIconStyle());
            //     } else {
            //         console.warn("Unable to find AVIRIS icon for overlay deselect");
            //     }
            // }

            // Remove overlay if it's AVIRIS or VISTA
            if (overlayType === "AVIRIS" || overlayType === "VISTA") {
                // this.map.removeOverlay(overlay);
                overlay.setVisible(false);
                overlay.setPosition();
            }
        });
        return;
    }

    setFeatureLabel(category, pickedFeature) {
        const currentMapExtent = this.map.getView().calculateExtent();
        switch (category) {
            case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
                this.handleVISTALabelToggle(pickedFeature, currentMapExtent);
                break;
            case layerSidebarTypes.CATEGORY_PLUMES:
                this.handleAVIRISLabelToggle(pickedFeature, currentMapExtent);
                break;
        }
    }

    addFeatureLabel(id, title, subtitle, coords, opt_meta = {}) {
        try {
            // // store meta opt_meta
            for (let key in opt_meta) {
                if (opt_meta.hasOwnProperty(key)) {
                    this.overlay.set(key, opt_meta[key], true);
                }
            }
            window.requestAnimationFrame(() => {
                this.overlay.setVisible(true);
                this.overlay.setPosition(coords);
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.addLabel:", err);
            return false;
        }
    }

    createGIBSWMTSSource(layer, options) {
        let source = MapWrapperOpenlayers.prototype.createGIBSWMTSSource(layer, options);
        source.crossOrigin = "anonymous";
        return source;
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

    setActivePlumes(activeFeatures, hideAll) {
        const activeFeatureIds = activeFeatures
            .filter(feature => feature && feature.get("id"))
            .map(feature => feature.get("id"));

        const avirisLayerGroup = this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS");

        if (!avirisLayerGroup) {
            return;
        }

        const avirisImageLayerGroup = avirisLayerGroup
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS_IMAGE_LAYER_GROUP");

        const avirisIconLayerGroup = avirisLayerGroup
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "icons");

        avirisImageLayerGroup
            .getLayers()
            .getArray()
            .forEach(feature => {
                const opacity =
                    !hideAll &&
                    (!activeFeatureIds.length ||
                        activeFeatureIds.includes(feature.get("_featureId")))
                        ? 1
                        : 0;
                feature.setOpacity(opacity);
            });
    }

    togglePlumeIcons(iconsOff) {
        this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS")
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "icons")
            .setOpacity(iconsOff ? 0 : 1);
    }

    setActiveInfrastructure(activeFeatures, hideAll) {
        const activeInfrastructureIds = activeFeatures
            .filter(feature => feature && feature.get("id"))
            .map(feature => feature.get("id"));

        const activeInfrastructureCategoryIds = activeFeatures.reduce((acc, feature) => {
            if (!acc.includes(feature.get("categoryId"))) acc.push(feature.get("categoryId"));
            return acc;
        }, []);

        const vistaLayers = this.map
            .getLayers()
            .getArray()
            .filter(layer => layer.get("_layerGroup") === "VISTA");

        vistaLayers.forEach(layer => {
            const layerId = layer.get("_layerId");

            layer
                .getSource()
                .getFeatures()
                .forEach(feature => {
                    if (hideAll) {
                        return feature.setStyle(this.getVistaStyle(layerId, false));
                    }
                    if (!activeFeatures.length) {
                        return feature.setStyle(this.getVistaStyle(layerId, true));
                    }
                    if (activeInfrastructureIds.includes(feature.get("id"))) {
                        return feature.setStyle(this.getVistaStyle(layerId, true));
                    } else {
                        return feature.setStyle(this.getVistaStyle(layerId, false));
                    }
                });
        });
    }

    /**
     * adjusts the rendered map size to it's container
     * and uses rAF
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapperOpenlayers
     */
    resize() {
        try {
            window.requestAnimationFrame(() => {
                this.map.updateSize();
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.resize:", err);
            return false;
        }
    }

    soloFeature(feature, category) {
        const plumes = category === layerSidebarTypes.CATEGORY_PLUMES ? [feature] : [];
        const infrastructure =
            category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE ? [feature] : [];
        this.setActivePlumes(plumes, infrastructure.length);
        this.setActiveInfrastructure(infrastructure, plumes.length);
    }

    setOilWellLayer(data) {
        const oldOilWellLayer = this.map
            .getLayers()
            .getArray()
            .find(layer => layer.get("_layerId") === "OIL_WELLS");
        if (oldOilWellLayer) this.removeLayer(oldOilWellLayer);

        if (!data) return;

        // HACK ALERT -- for some reason Ol_Source_Vector doesn't read from JSON strings, only URLs.
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const format = new Ol_Format_GeoJSON();
        const vistaLayerSource = new Ol_Source_Vector({
            url,
            format
        });

        const vistaLayer = new Ol_Layer_Vector({
            source: vistaLayerSource,
            visible: true,
            extent: this.map.getView().calculateExtent(),
            style: this.getVistaStyle(layerSidebarTypes.VISTA_2017_OILGAS_WELLS)
        });

        vistaLayer.set("_layerGroup", "VISTA");
        vistaLayer.set("_layerOrder", 1);
        vistaLayer.set("_layerId", "OIL_WELLS");
        vistaLayer.set("_layerType", appStrings.LAYER_GROUP_TYPE_DATA);

        vistaLayer.setVisible(true);
        this.addLayer(vistaLayer);
        this.map.updateSize();
    }
}
