import moment from "moment";
import * as appStrings from "_core/constants/appStrings";
import * as appStringsMSF from "constants/appStrings";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Source_StaticImage from "ol/source/imagestatic";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Style from "ol/style/style";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Style_Icon from "ol/style/icon";
import Ol_Geom_Circle from "ol/geom/circle";
import Ol_Overlay from "ol/overlay";
import Ol_Extent from "ol/extent";
import Ol_Source_XYZ from "ol/source/xyz";
import Ol_Layer_Group from "ol/layer/group";
import Ol_Feature from "ol/feature";
import Ol_Geom_Point from "ol/geom/point";
import Ol_Geom_Polygon from "ol/geom/polygon";
import Ol_View from "ol/view";
import Ol_Proj from "ol/proj";
import Ol_Interaction from "ol/interaction";
import Ol_Map from "ol/map";
import Ol_Control from "ol/control";
import Ol_Scaleline from "ol/control/scaleline";
import Ol_Format_GeoJSON from "ol/format/geojson";
import Ol_Format_KML from "ol/format/kml";
import Ol_Loading_Strategy from "ol/loadingstrategy";
import Ol_Size from "ol/size";
import MapWrapperOpenlayers from "_core/utils/MapWrapperOpenlayers";
import MiscUtilExtended from "utils/MiscUtilExtended";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import MapUtilExtended from "utils/MapUtilExtended";
import MiscUtil from "_core/utils/MiscUtil";
import Immutable from "immutable";
import MetadataUtil from "utils/MetadataUtil";

const JSZip = require("jszip");
const INVISIBLE_VISTA_STYLE = new Ol_Style({
    fill: new Ol_Style_Fill({
        color: [0, 0, 0, 0]
    }),
    stroke: new Ol_Style_Stroke({
        color: [0, 0, 0, 0],
        width: 0
    })
});

const VISTA_STYLES_BY_SECTOR = {};

const AVIRIS_ICON_STYLE = new Ol_Style({
    image: new Ol_Style_Icon({
        opacity: 1,
        src: "img/PlumeIcon.png",
        scale: 0.6
    })
});

const INVISIBLE_AVIRIS_STYLE = new Ol_Style({
    fill: new Ol_Style_Fill({
        color: [0, 0, 0, 0]
    }),
    stroke: new Ol_Style_Stroke({
        color: [0, 0, 0, 0],
        width: 0
    })
});

const FLIGHT_LINES_STYLE = new Ol_Style({
    fill: new Ol_Style_Fill({
        color: [255, 255, 255, 0.4]
    }),
    stroke: new Ol_Style_Stroke({
        color: [255, 255, 255, 1]
        // width: 1.5
    })
});

const pointVISTAStyleFnCreator = (fill, stroke) => {
    return (f, r) => {
        if (r < 100) {
            return [
                new Ol_Style({
                    fill,
                    stroke: new Ol_Style_Stroke({
                        color: "rgba(0, 0, 0, 0.8)",
                        width: 1.5
                    }),
                    geometry: new Ol_Geom_Circle(f.getGeometry().getCoordinates(), r * 4.5)
                })
            ];
        } else {
            return [
                new Ol_Style({
                    fill,
                    stroke,
                    geometry: new Ol_Geom_Circle(f.getGeometry().getCoordinates(), r * 4)
                })
            ];
        }
    };
};

const defaultVISTAStyleFnCreator = (fillColor, strokeColor) => (f, r) => [
    new Ol_Style({
        fill: new Ol_Style_Fill({
            color: fillColor
        }),
        stroke: new Ol_Style_Stroke({
            color: "rgb(0, 0, 0, 0.4)",
            width: r < 75 ? 2.75 : 2
        })
    }),
    new Ol_Style({
        fill: new Ol_Style_Fill({
            color: fillColor
        }),
        stroke: new Ol_Style_Stroke({
            color: strokeColor,
            width: r < 75 ? 2 : 1.25
        })
    })
];

Object.keys(layerSidebarTypes.INFRASTRUCTURE_GROUPS).forEach(groupName => {
    const group = layerSidebarTypes.INFRASTRUCTURE_GROUPS[groupName];
    const pointStroke = new Ol_Style_Stroke({
        color: "rgba(0, 0, 0, 0.2)",
        width: 1.5
    });
    const pointFill = new Ol_Style_Fill({
        color: group.colors.stroke
    });

    const pointStyleFn = pointVISTAStyleFnCreator(pointFill, pointStroke);
    const defaultStyleFn = defaultVISTAStyleFnCreator(group.colors.fill, group.colors.stroke);

    const styleFunction = (feature, resolution) => {
        let styles = [];
        if (
            feature.getGeometry().getType() === appStrings.GEOMETRY_LINE_STRING ||
            feature.getGeometry().getType() === appStrings.GEOMETRY_POLYGON ||
            feature.getGeometry().getType() === appStringsMSF.GEOMETRY_MULTIPOLYGON
        ) {
            styles = defaultStyleFn(feature, resolution);
        } else {
            styles = pointStyleFn(feature, resolution);
        }
        return styles;
    };
    VISTA_STYLES_BY_SECTOR[groupName] = styleFunction;
});

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
            case appStringsMSF.LAYER_GROUP_TYPE_VISTA_SOURCE:
                mapLayer = this.createVistaSourceLayer(layer, fromCache);
                break;
            case appStringsMSF.LAYER_FLIGHT_LINES:
                mapLayer = this.createFlightLinesLayer(layer, fromCache);
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
            style: INVISIBLE_AVIRIS_STYLE,
            visible: layer.get("visibleInGroup")
        });
        mapLayer.set("_layerId", layer.id);
        mapLayer.set("_layerOrder", layer.get("layerOrder"));
        mapLayer.set("_layerGroup", "GRIDDED");

        return mapLayer;
    }

    addLayer(mapLayer) {
        try {
            const mapLayers = this.map.getLayers();
            let insertIndex = 0;
            if (
                mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_BASEMAP ||
                appStrings.LAYER_GROUP_TYPE_REFERENCE
            ) {
                insertIndex = this.findTopInsertIndexForLayer(mapLayer);
            }

            if (mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_DATA) {
                const dataLayerStartIndex = mapLayers
                    .getArray()
                    .filter(
                        layer => layer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_BASEMAP
                    ).length;
                const layerOrder = mapLayer.get("_layerOrder") || 0;
                insertIndex = dataLayerStartIndex + layerOrder;
            }

            mapLayers.insertAt(insertIndex, mapLayer);
            this.addLayerToCache(mapLayer, appConfig.TILE_LAYER_UPDATE_STRATEGY);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.addLayer:", err);
            return false;
        }
    }

    getGriddedDateFormat(period) {
        switch (period) {
            case "daily":
                return "YYYYMMDD";
            case "monthly":
                return "YYYYMM";
            case "yearly":
                return "YYYY";
        }
    }

    changeGriddedVectorLayerDate(date, name) {
        const griddedFluxLayer = this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === name);

        const layerConfig = appConfig.GRIDDED_LAYER_TYPES.find(l => l.name === name);
        const sourceUrl = layerConfig.endpoint.replace(
            "{date}",
            date.format(this.getGriddedDateFormat(layerConfig.period))
        );
        console.log(sourceUrl);

        const newSource = new Ol_Source_Vector({
            url: sourceUrl,
            format: new Ol_Format_GeoJSON()
        });

        griddedFluxLayer.setSource(newSource);
    }

    createAvirisFeature(layer, projection) {
        const shape = layer.shape;
        const extent = [shape[0][0], shape[1][1], shape[2][0], shape[0][1]];
        const transformedExtent = Ol_Proj.transformExtent(
            extent.map(val => parseFloat(val)),
            appStrings.PROJECTIONS.latlon.code,
            this.map
                .getView()
                .getProjection()
                .getCode()
        );

        const imageFeature = new Ol_Feature({
            geometry: new Ol_Geom_Polygon.fromExtent(transformedExtent),
            pointGeometry: new Ol_Geom_Point(Ol_Extent.getCenter(transformedExtent)),
            name: layer.name
        });
        imageFeature.setGeometryName("pointGeometry");

        Object.keys(layer).forEach(key => {
            if (!imageFeature.get(key)) {
                imageFeature.set(key, layer[key]);
            }
        });

        imageFeature.set("ime", layer.ime_20);
        imageFeature.set("datetime", layer.data_date_dt);
        imageFeature.set("sourceId", layer.source_id);
        imageFeature.set("location", layer.location);
        imageFeature.setId(layer.id);
        imageFeature.set("name", layer.candidate_id);
        imageFeature.set("ime", layer.ime_20);
        imageFeature.set("fetch", layer.fetch20);
        imageFeature.set("plumeId", layer.plume_id);
        imageFeature.set("_opacity", 1);
        imageFeature.set("_layerGroup", "AVIRIS");

        // Only load the source plume image when the user zooms in close enough.
        let image;
        let baseRes;
        let iconStyle;
        function styleFunc(feature, resolution) {
            if (feature.get("_opacity") === 0 || resolution > appConfig.PLUME_MAX_RESOLUTION) {
                return INVISIBLE_AVIRIS_STYLE;
            }
            if (!iconStyle) {
                image = new Image();
                image.src = layer.plume_url;
                image.onload = _ => {
                    iconStyle = new Ol_Style({
                        image: new Ol_Style_Icon({
                            anchor: [image.height / 2, (image.width / 2) | 0],
                            opacity: 1,
                            img: image,
                            imgSize: [image.width, image.height],
                            anchorXUnits: "pixels",
                            anchorYUnits: "pixels"
                        })
                    });
                    baseRes = (transformedExtent[2] - transformedExtent[0]) / image.width;
                    // Running "setStyle" when the image loads forces the feature to refresh.
                    feature.setStyle(styleFunc);
                };
                // Return invisible while we load the image.
                return INVISIBLE_AVIRIS_STYLE;
            }
            iconStyle.getImage().setScale(baseRes / resolution);
            return iconStyle;
        }
        imageFeature.setStyle(styleFunc);
        return imageFeature;
    }

    createAvirisLayers(layer, options) {
        const layerSource = new Ol_Source_Vector({
            strategy: Ol_Loading_Strategy.bbox,
            loader: (extent, resolution, projection) => {
                const url = MapUtilExtended.buildAvirisFeatureQueryStringNew(extent);
                layerSource.dispatchEvent("loadingFeatures");
                fetch(url, { credentials: "same-origin" })
                    .then(res => res.json())
                    .then(data => {
                        data.map(layer =>
                            layerSource.addFeature(this.createAvirisFeature(layer, projection))
                        );
                        layerSource.dispatchEvent("featuresLoaded");
                    });
            }
        });

        const avirisLayer = new Ol_Layer_Vector({
            extent: appConfig.DEFAULT_MAP_EXTENT,
            source: layerSource,
            opacity: layer.get("opacity"),
            visible: layer.get("isActive"),
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            renderMode: "image"
        });

        avirisLayer.set("_layerId", "AVIRIS");
        avirisLayer.set("_layerType", layer.get("type"));
        avirisLayer.set("_layerOrder", layer.get("layerOrder"));

        // this.map.getLayers().insertAt(this.findTopInsertIndexForLayer(avirisLayer), avirisLayer);
        return avirisLayer;
    }

    createKMZLayer(layer, fromCache = false) {
        MiscUtilExtended.asyncFetch({
            url: layer.get("url"),
            handleAs: "blob",
            credentials: "same-origin"
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

            if (layer.get("group") === "VISTA") this.vistaLayers.count--;

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
        return VISTA_STYLES_BY_SECTOR[layerSidebarTypes.INFRASTRUCTURE_ID_TO_SECTOR[layerId]];
    }

    createVistaLayer(layer, fromCache = true) {
        this.vistaLayers = this.vistaLayers || { count: 0, loaded: 0 };

        const isOilWellLayer = layer.get("id") === layerSidebarTypes.VISTA_2017_OILGAS_WELLS;
        if (!isOilWellLayer) this.vistaLayers.count++;

        try {
            const style = this.getVistaStyle(layer.get("id"));

            const layerSource = new Ol_Source_Vector({
                format: new Ol_Format_GeoJSON(),
                strategy: Ol_Loading_Strategy.bbox,
                loader: (extent, resolution, projection) => {
                    if (!isOilWellLayer) layerSource.dispatchEvent("loadingFeatures");
                    const url = MapUtilExtended.buildVistaFeatureQueryStringForCategory(
                        extent,
                        layer.get("id")
                    );
                    fetch(url, { credentials: "same-origin" }).then(res =>
                        res.json().then(data => {
                            // Add in default name if one does not exist
                            data.features = data.features.filter(f => f.geometry);
                            layerSource.addFeatures(
                                layerSource.getFormat().readFeatures(data, {
                                    dataProjection: "EPSG:4326",
                                    featureProjection: projection
                                })
                            );

                            this.vistaLayers.loaded++;
                            if (
                                isOilWellLayer ||
                                this.vistaLayers.count <= this.vistaLayers.loaded
                            ) {
                                layerSource.dispatchEvent("featuresLoaded");
                            }
                        })
                    );
                }
            });

            const maxResolution = isOilWellLayer ? appConfig.OIL_WELL_MAX_RESOLUTION : undefined;

            const vistaLayer = new Ol_Layer_Vector({
                renderMode: "image",
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                extent: appConfig.DEFAULT_MAP_EXTENT,
                style,
                maxResolution
            });
            vistaLayer.set("_layerId", layer.get("id"));
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

    centerMapOnFeature(feature) {
        let zoomGeom = feature.get("geometry");

        if (!zoomGeom) {
            // If this feature doesn't have geometry attached, see if it's in the metadata.
            let coords = [MetadataUtil.getLong(feature), MetadataUtil.getLat(feature)];
            if (coords.every(x => x)) return this.zoomToCoords(coords.map(x => parseFloat(x)));

            // Hacky, but the fields for location seem to vary a bit, so this is just to keep things working.
            coords = feature.get("location").toJS();
            if (coords.every(x => x)) return this.zoomToCoords(coords.reverse());

            return;
        }

        // For point geometry, we just center the point and bring the map to a default zoom level.
        if (zoomGeom instanceof Ol_Geom_Point) {
            this.setCenter(zoomGeom.getExtent());
            return this.map.getView().animate({
                resolution: this.map.getView().getResolution(),
                zoom: appConfig.ZOOM_TO_LEVEL,
                duration: 175
            });
        }

        // For polygons, fit the map to the extent of the poly.
        return this.fitFeature(zoomGeom.getExtent());
    }

    zoomToCoords(coords) {
        return this.map.getView().animate({
            resolution: this.map.getView().getResolution(),
            zoom: appConfig.ZOOM_TO_LEVEL,
            duration: 175,
            center: Ol_Proj.transform(
                [coords[0], coords[1]],
                Ol_Proj.get("EPSG:4326"),
                Ol_Proj.get(appConfig.DEFAULT_PROJECTION.code)
            )
        });
    }

    getAVIRISFeatureById(id) {
        return this.getAvirisLayer()
            .getSource()
            .getFeatures()
            .find(f => f.getId() === id);
    }

    handleAVIRISLabelToggle(pickedFeature, currentMapExtent) {
        let featureId = pickedFeature.get("id");

        const featureExtent = this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS")
            .getSource()
            .getFeatures()
            .find(f => f.getId() === featureId)
            .getGeometry()
            .getExtent();

        // Add or remove label
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
    }

    handleVISTALabelToggle(pickedFeature, currentMapExtent) {
        const pointStroke = new Ol_Style_Stroke({
            color: "rgba(0, 0, 0, 0.2)",
            width: 1.5
        });
        const pointFill = new Ol_Style_Fill({
            color: "rgba(255,54,40,1)"
        });

        const pointStyleFn = pointVISTAStyleFnCreator(pointFill, pointStroke);
        const defaultStyleFn = defaultVISTAStyleFnCreator("rgba(255,255,255,0.2)", "#ff3628");

        const styleFunction = (feature, resolution) => {
            let styles = [];
            if (
                feature.getGeometry().getType() === appStrings.GEOMETRY_LINE_STRING ||
                feature.getGeometry().getType() === appStrings.GEOMETRY_POLYGON ||
                feature.getGeometry().getType() === appStringsMSF.GEOMETRY_MULTIPOLYGON
            ) {
                styles = defaultStyleFn(feature, resolution);
            } else {
                styles = pointStyleFn(feature, resolution);
            }
            return styles;
        };
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
                    // this.addFeatureLabel(
                    //     featureId,
                    //     pickedFeature.get("name"),
                    //     pickedFeature.get("category"),
                    //     center,
                    //     {
                    //         sourceLayerId: layer.get("_layerId"),
                    //         overlayType: "VISTA",
                    //         _featureId: featureId
                    //     }
                    // );
                    feature.setStyle(styleFunction);
                    return;
                }
            });
        });
    }

    clearFeatureLabels(activeFeature) {
        let mapLayers = this.map.getLayers().getArray();
        if (activeFeature.get("category") === layerSidebarTypes.CATEGORY_INFRASTRUCTURE) {
            const featureId = activeFeature.getIn(["feature", "id"]);
            this.getVistaLayers().some(layer => {
                const feature = layer
                    .getSource()
                    .getFeatures()
                    .find(f => f.get("id") === featureId);
                if (feature) {
                    feature.setStyle(null);
                    return true;
                } else {
                    return false;
                }
            });
        }
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

        const avirisLayer = this.getAvirisLayer();

        if (!avirisLayer) return null;

        avirisLayer.getSource().forEachFeature(feature => {
            const opacity =
                !hideAll && (!activeFeatureIds.length || activeFeatureIds.includes(feature.getId()))
                    ? 1
                    : 0;
            feature.set("_opacity", opacity);
        });

        avirisLayer.changed();
    }

    getVistaLayers() {
        return this.map
            .getLayers()
            .getArray()
            .filter(layer => layer.get("_layerGroup") === "VISTA");
    }

    setActiveInfrastructure(activeFeatures, hideAll) {
        const activeInfrastructureIds = activeFeatures
            .filter(feature => feature && feature.get("id"))
            .map(feature => feature.get("id"));

        const activeInfrastructureCategoryIds = activeFeatures.reduce((acc, feature) => {
            if (!acc.includes(feature.get("categoryId"))) acc.push(feature.get("categoryId"));
            return acc;
        }, []);

        const vistaLayers = this.getVistaLayers();

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

    getAvirisLayer() {
        return this.map
            .getLayers()
            .getArray()
            .find(l => l.get("_layerId") === "AVIRIS");
    }

    setVisiblePlumes(plumeList) {
        const activePlumeIds = plumeList.map(f => f.get("id"));
        const avirisLayer = this.getAvirisLayer();

        if (!avirisLayer) return; // Bail if this layer isn't switched on

        avirisLayer
            .getSource()
            .getFeatures()
            .forEach(f => {
                const opacity = activePlumeIds.includes(f.getId()) ? 1 : 0;
                f.set("_opacity", opacity);
            });

        avirisLayer.changed();
    }

    setVisibleInfrastructure(layerSidebarState) {
        const activeInfrastructureIds = layerSidebarState
            .getIn(["searchState", layerSidebarTypes.CATEGORY_INFRASTRUCTURE, "searchResults"])
            .map(f => f.get("id"));

        const vistaLayers = this.getVistaLayers();
        vistaLayers.forEach(layer =>
            layer
                .getSource()
                .getFeatures()
                .forEach(feature => {
                    feature.setStyle(
                        this.getVistaStyle(
                            layer.get("_layerId"),
                            activeInfrastructureIds.includes(feature.getProperties().id)
                        )
                    );
                })
        );
    }

    getVisibleVistaFeatures() {
        const extent = this.map.getView().calculateExtent(this.map.getSize());
        return this.getVistaLayers().reduce(
            (acc, layer) => acc.concat(layer.getSource().getFeaturesInExtent(extent)),
            []
        );
    }

    addVistaLayerHandler(evt, callback) {
        switch (evt) {
            case appStringsMSF.VISTA_LAYER_UPDATED:
                this.getVistaLayers().forEach(layer => {
                    layer.getSource().on("featuresLoaded", callback);
                });
                break;
            case appStringsMSF.UPDATING_VISTA_LAYER:
                this.getVistaLayers().forEach(layer =>
                    layer.getSource().on("loadingFeatures", callback)
                );
                break;
        }
    }

    getVisibleAvirisFeatures() {
        const extent = this.map.getView().calculateExtent(this.map.getSize());
        return (
            this.getAvirisLayer() &&
            this.getAvirisLayer()
                .getSource()
                .getFeaturesInExtent(extent)
        );
    }

    addAvirisLayerHandler(evt, callback) {
        switch (evt) {
            case appStringsMSF.AVIRIS_LAYER_UPDATED:
                if (this.getAvirisLayer())
                    this.getAvirisLayer()
                        .getSource()
                        .on("featuresLoaded", callback);
                break;
            case appStringsMSF.UPDATING_AVIRIS_LAYER:
                if (this.getAvirisLayer())
                    this.getAvirisLayer()
                        .getSource()
                        .on("loadingFeatures", callback);
                break;
        }
    }

    getFeatureByName(featureName, featureType) {
        let feature;
        switch (featureType) {
            case "VISTA":
                feature = this.getVistaLayers()
                    .reduce((acc, l) => acc.concat(l.getSource().getFeatures()), [])
                    .find(f => f.get("name").includes(featureName));
                break;
        }
        return feature;
    }

    createVistaSourceLayer(layer, fromCache = true) {
        const layerSource = new Ol_Source_Vector({
            strategy: Ol_Loading_Strategy.bbox,
            loader: (extent, resolution, projection) => {
                const url = MapUtilExtended.buildFeatureQueryString(layer.get("url"), extent);
                layerSource.dispatchEvent("loadingFeatures");
                fetch(url, { credentials: "same-origin" })
                    .then(res => res.json())
                    .then(data =>
                        data.forEach(source => {
                            layerSource.addFeature(this.makeVistaSourceFeature(source));
                        })
                    )
                    .then(_ => layerSource.dispatchEvent("featuresLoaded"));
            }
        });

        const sourceLayer = new Ol_Layer_Vector({
            extent: appConfig.DEFAULT_MAP_EXTENT,
            source: layerSource,
            opacity: layer.get("opacity"),
            visible: layer.get("isActive"),
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            renderMode: "image"
        });

        sourceLayer.set("_layerId", "VISTA_SOURCES");
        sourceLayer.set("_layerType", layer.get("type"));
        sourceLayer.set("_layerOrder", layer.get("layerOrder"));
        sourceLayer.setStyle(AVIRIS_ICON_STYLE);

        return sourceLayer;
    }

    makeVistaSourceFeature(source) {
        const coordinates = Ol_Proj.transform(
            [source.source_longitude, source.source_latitude],
            Ol_Proj.get("EPSG:4326"),
            Ol_Proj.get(appConfig.DEFAULT_PROJECTION.code)
        );
        const feature = new Ol_Feature({
            geometry: new Ol_Geom_Point(coordinates),
            name: source.name
        });
        return feature;
    }

    getCurrentExtent() {
        const coords = this.map.getView().calculateExtent();
        return Ol_Proj.transform(
            coords.slice(0, 2),
            Ol_Proj.get(appConfig.DEFAULT_PROJECTION.code),
            Ol_Proj.get("EPSG:4326")
        ).concat(
            Ol_Proj.transform(
                coords.slice(2),
                Ol_Proj.get(appConfig.DEFAULT_PROJECTION.code),
                Ol_Proj.get("EPSG:4326")
            )
        );
    }

    createFlightLinesLayer(layer, fromCache) {
        return new Ol_Layer_Vector({
            source: new Ol_Source_Vector({
                url: layer.get("url"),
                format: new Ol_Format_KML({
                    extractStyles: false
                })
            }),
            opacity: layer.get("opacity"),
            visible: layer.get("isActive"),
            extent: appConfig.DEFAULT_MAP_EXTENT,
            style: FLIGHT_LINES_STYLE
        });
    }

    hexToRgba(hex) {
        const colors = [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16),
            parseInt(hex.slice(7, 9), 16)
        ];
        return `rgba(${colors.join(",")})`;
    }

    makeGriddedStyleFunctionFromPalette(pal) {
        let palette = pal.toJS();
        palette.values = palette.values.map(val => {
            const highExclusive = val.value.startsWith(">");

            return Object.assign(val, {
                color: this.hexToRgba(val.color),
                value: parseFloat(highExclusive ? val.value.slice(1) : val.value),
                highExclusive
            });
        });

        // Function assumes that palette entries are in ascending order
        return (feature, resolution) => {
            const dnValue = parseFloat(feature.getProperties().DN);

            const fillColor = palette.values.reduce(
                (acc, { highExclusive, value, color }) =>
                    acc
                        ? acc
                        : (highExclusive && dnValue > value) || dnValue < value ? color : null,
                null
            );

            return new Ol_Style({
                // stroke: new Ol_Style_Stroke({ color: "#000000" }),
                fill: new Ol_Style_Fill({ color: `${fillColor}` })
            });
        };
    }

    setActiveGriddedLayer(name, palette) {
        this.map.getLayers().forEach(l => {
            if (!l || l.get("_layerGroup") !== "GRIDDED") return;
            const style =
                l.get("_layerId") !== name
                    ? INVISIBLE_VISTA_STYLE
                    : this.makeGriddedStyleFunctionFromPalette(palette);
            return l.setStyle(style);
        });
    }

    getGriddedLayers() {
        return this.map
            .getLayers()
            .getArray()
            .filter(l => l.get("_layerGroup") === "GRIDDED");
    }

    /**
     * Find the highest index for a layer to be displayed.
     * Data layers are displayed below reference layers and
     * above basemaps
     *
     * @param {object} mapLayer openlayers map layer to compare
     * @returns {number} highest index display index for a layer of this type
     * @memberof MapWrapperOpenlayers
     */
    findTopInsertIndexForLayer(mapLayer) {
        let mapLayers = this.map.getLayers();
        let index = mapLayers.getLength();

        if (mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_REFERENCE) {
            // referece layers always on top of basemaps
            return 1;
        } else if (mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_BASEMAP) {
            // basemaps always on bottom
            return 0;
        } else {
            // data layers in the middle
            for (let i = index - 1; i >= 1; --i) {
                let compareLayer = mapLayers.item(i);
                if (
                    compareLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_DATA ||
                    compareLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_BASEMAP
                ) {
                    return i + 1;
                }
            }
            index = 0;
        }
        return index;
    }
}
