import Immutable from "immutable";
import moment from "moment";
import Ol_Map from "ol/map";
import Ol_View from "ol/view";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Layer_Tile from "ol/layer/tile";
import Ol_Source_WMTS from "ol/source/wmts";
import Ol_Source_Cluster from "ol/source/cluster";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Source_XYZ from "ol/source/xyz";
import Ol_Tilegrid_WMTS from "ol/tilegrid/wmts";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Style from "ol/style/style";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Proj from "ol/proj";
import Ol_Proj_Projection from "ol/proj/projection";
import Ol_Interaction from "ol/interaction";
import Ol_Interaction_Draw from "ol/interaction/draw";
import Ol_Interaction_DoubleClickZoom from "ol/interaction/doubleclickzoom";
import Ol_Overlay from "ol/overlay";
import Ol_Feature from "ol/feature";
import Ol_Geom_Circle from "ol/geom/circle";
import Ol_Geom_Linestring from "ol/geom/linestring";
import Ol_Geom_Polygon from "ol/geom/polygon";
import OL_Geom_GeometryType from "ol/geom/geometrytype";
import Ol_Format_GeoJSON from "ol/format/geojson";
import Ol_Format_TopoJSON from "ol/format/topojson";
import Ol_Format_KML from "ol/format/kml";
import Ol_Easing from "ol/easing";
import proj4js from "proj4";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MapWrapper from "_core/utils/MapWrapper";
import MiscUtil from "_core/utils/MiscUtil";
import MapUtil from "_core/utils/MapUtil";
import TileHandler from "_core/utils/TileHandler";
import Cache from "_core/utils/Cache";
import tooltipStyles from "_core/components/Map/MapTooltip.scss";

/**
 * Wrapper class for Openlayers
 *
 * @export
 * @class MapWrapper_openlayers
 * @extends {MapWrapper}
 */
export default class MapWrapper_openlayers extends MapWrapper {
    /**
     * Creates an instance of MapWrapper_openlayers.
     *
     * @param {string|domnode} container the container to render this map into
     * @param {object} options view options for constructing this map wrapper (usually map state from redux)
     * @memberof MapWrapper_openlayers
     */
    constructor(container, options) {
        super(container, options);
        this.is3D = false;
        this.isActive = !options.getIn(["view", "in3DMode"]);
        this.layerCache = new Cache(appConfig.MAX_LAYER_CACHE);
        this.tileHandler = TileHandler;
        this.mapUtil = MapUtil;
        this.miscUtil = MiscUtil;
        this.cachedGeometry = null;
        this.configureStyles();
        this.map = this.createMap(container, options);

        this.initializationSuccess = this.map ? true : false;
    }

    /**
     * create an openlayers map object
     *
     * @param {string|domnode} container the domnode to render to
     * @param {object} options options for creating this map (usually map state from redux)
     * @returns {object} openlayers map object
     * @memberof MapWrapper_openlayers
     */
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

            return new Ol_Map({
                target: container,
                renderer: ["canvas", "dom"],
                layers: [vectorLayer],
                view: new Ol_View({
                    maxZoom: viewOptions.maxZoom,
                    minZoom: viewOptions.minZoom,
                    projection: mapProjection,
                    maxResolution: viewOptions.maxResolution
                }),
                controls: [],
                interactions: Ol_Interaction.defaults({
                    altShiftDragRotate: false,
                    pinchRotate: false,
                    shiftDragZoom: false,
                    keyboard: false
                })
            });
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.createMap:", err);
            return false;
        }
    }

    /**
     * prepare the default style objects that will be used
     * in drawing/measuring
     *
     * @memberof MapWrapper_openlayers
     */
    configureStyles() {
        let geometryStyles = {};
        geometryStyles[OL_Geom_GeometryType.POLYGON] = [
            new Ol_Style({
                stroke: new Ol_Style_Stroke({
                    color: appConfig.GEOMETRY_OUTLINE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT + 1
                })
            }),
            new Ol_Style({
                fill: new Ol_Style_Fill({
                    color: appConfig.GEOMETRY_FILL_COLOR
                }),
                stroke: new Ol_Style_Stroke({
                    color: appConfig.GEOMETRY_STROKE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT
                })
            })
        ];
        geometryStyles[OL_Geom_GeometryType.POINT] = [
            new Ol_Style({
                image: new Ol_Style_Circle({
                    radius: 4,
                    fill: new Ol_Style_Fill({
                        color: appConfig.GEOMETRY_STROKE_COLOR
                    }),
                    stroke: new Ol_Style_Stroke({
                        color: appConfig.GEOMETRY_OUTLINE_COLOR,
                        width: 2
                    })
                }),
                zIndex: Infinity
            })
        ];
        geometryStyles[OL_Geom_GeometryType.MULTI_LINE_STRING] = geometryStyles[
            OL_Geom_GeometryType.LINE_STRING
        ] = [
            new Ol_Style({
                stroke: new Ol_Style_Stroke({
                    color: appConfig.GEOMETRY_OUTLINE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT + 1
                })
            }),
            new Ol_Style({
                stroke: new Ol_Style_Stroke({
                    color: appConfig.GEOMETRY_STROKE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT
                })
            })
        ];
        geometryStyles[OL_Geom_GeometryType.CIRCLE] = geometryStyles[OL_Geom_GeometryType.POLYGON];
        this.defaultGeometryStyle = (feature, resolution) => {
            return geometryStyles[feature.getGeometry().getType()];
        };

        let drawingAreaStyles = {};
        let drawingDistanceStyles = {};
        let drawingStyles = {
            [appStrings.SHAPE_DISTANCE]: drawingDistanceStyles,
            [appStrings.SHAPE_AREA]: drawingAreaStyles
        };
        drawingAreaStyles[OL_Geom_GeometryType.POLYGON] = [
            new Ol_Style({
                stroke: new Ol_Style_Stroke({
                    lineDash: [15, 10],
                    color: appConfig.GEOMETRY_OUTLINE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT + 1
                })
            }),
            new Ol_Style({
                fill: new Ol_Style_Fill({
                    color: appConfig.GEOMETRY_FILL_COLOR
                }),
                stroke: new Ol_Style_Stroke({
                    lineDash: [15, 10],
                    color: appConfig.GEOMETRY_STROKE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT
                })
            })
        ];
        drawingAreaStyles[OL_Geom_GeometryType.POINT] = [
            new Ol_Style({
                image: new Ol_Style_Circle({
                    radius: 4,
                    fill: new Ol_Style_Fill({
                        color: appConfig.GEOMETRY_STROKE_COLOR
                    }),
                    stroke: new Ol_Style_Stroke({
                        color: appConfig.GEOMETRY_OUTLINE_COLOR,
                        width: 1
                    })
                }),
                zIndex: Infinity
            })
        ];
        drawingAreaStyles[OL_Geom_GeometryType.MULTI_LINE_STRING] = drawingAreaStyles[
            OL_Geom_GeometryType.LINE_STRING
        ] = [];
        drawingAreaStyles[OL_Geom_GeometryType.CIRCLE] =
            drawingAreaStyles[OL_Geom_GeometryType.POLYGON];

        drawingDistanceStyles[OL_Geom_GeometryType.MULTI_LINE_STRING] = drawingDistanceStyles[
            OL_Geom_GeometryType.LINE_STRING
        ] = [
            new Ol_Style({
                stroke: new Ol_Style_Stroke({
                    lineDash: [15, 10],
                    color: appConfig.GEOMETRY_OUTLINE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT + 1
                })
            }),
            new Ol_Style({
                stroke: new Ol_Style_Stroke({
                    lineDash: [15, 10],
                    color: appConfig.GEOMETRY_STROKE_COLOR,
                    width: appConfig.GEOMETRY_STROKE_WEIGHT
                })
            })
        ];
        drawingDistanceStyles[OL_Geom_GeometryType.POINT] =
            drawingAreaStyles[OL_Geom_GeometryType.POINT];
        drawingDistanceStyles[OL_Geom_GeometryType.POLYGON] =
            drawingAreaStyles[OL_Geom_GeometryType.POLYGON];
        drawingDistanceStyles[OL_Geom_GeometryType.CIRCLE] =
            drawingAreaStyles[OL_Geom_GeometryType.CIRCLE];

        this.defaultDrawingStyle = (
            feature,
            resolution,
            measureType = appStrings.MEASURE_DISTANCE
        ) => {
            return drawingStyles[measureType][feature.getGeometry().getType()];
        };
    }

    /**
     * get the size of the rendered map
     *
     * @returns {obejct|boolean} size of the map or false if it fails
     *  - width - {number} width of the map
     *  - height - {number} height of the map
     * @memberof MapWrapper_openlayers
     */
    getMapSize() {
        try {
            let size = this.map.getSize();
            if (!size) {
                return { width: 0, height: 0 };
            } else {
                return { width: size[0], height: size[1] };
            }
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getMapSize:", err);
            return false;
        }
    }

    /**
     * adjusts the rendered map size to it's container
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    resize() {
        try {
            this.map.updateSize();
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.resize:", err);
            return false;
        }
    }

    /**
     * create an openlayers layer object
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {boolean} [fromCache=true] true if the layer may be pulled from the cache
     * @returns {object|boolean} openlayers layer object or false if it fails
     * @memberof MapWrapper_openlayers
     */
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
            case appStrings.LAYER_VECTOR_TOPOJSON:
                mapLayer = this.createVectorLayer(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_KML:
                mapLayer = this.createVectorLayer(layer, fromCache);
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
            mapLayer.set("_layerTime", moment(this.mapDate).format(layer.get("timeFormat")));
        }
        return mapLayer;
    }

    /**
     * create an openlayers wmts raster layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {boolean} [fromCache=true] true if the layer may be pulled from the cache
     * @returns {object|boolean} openlayers layer wmts layer object or false if it fails
     * @memberof MapWrapper_openlayers
     */
    createWMTSLayer(layer, fromCache = true) {
        try {
            if (layer && layer.get("wmtsOptions")) {
                let options = layer.get("wmtsOptions").toJS();
                let layerSource = this.createLayerSource(layer, options, fromCache);

                // set up wrap around extents
                // let mapProjExtent = this.map.getView().getProjection().getExtent();

                let mapLayer = new Ol_Layer_Tile({
                    opacity: layer.get("opacity"),
                    visible: layer.get("isActive"),
                    crossOrigin: "anonymous",
                    source: layerSource,
                    extent: appConfig.DEFAULT_MAP_EXTENT
                });

                this.setWMTSLayerOverrides(layerSource, layer, mapLayer);

                return mapLayer;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.createWMTSLayer:", err);
            return false;
        }
    }

    /**
     * override the url generation function and tile loading functions
     * for an openlayers wmts layer in order to customize urls and
     * tile load handling
     *
     * @param {object} layerSource openlayers wmts layer source
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} mapLayer openlayers wmts layer
     * @memberof MapWrapper_openlayers
     */
    setWMTSLayerOverrides(layerSource, layer, mapLayer) {
        // make sure we have these set
        if (
            typeof layerSource.get("_defaultUrlFunc") === "undefined" &&
            typeof layerSource.get("_defaultTileFunc") === "undefined"
        ) {
            layerSource.set("_defaultUrlFunc", layerSource.getTileUrlFunction());
            layerSource.set("_defaultTileFunc", layerSource.getTileLoadFunction());
        }

        // override tile url and load functions
        let origTileUrlFunc = layerSource.get("_defaultUrlFunc");
        let origTileLoadFunc = layerSource.get("_defaultTileFunc");
        layerSource.setTileUrlFunction((tileCoord, pixelRatio, projectionString) => {
            return this.generateTileUrl(
                layer,
                mapLayer,
                layerSource,
                tileCoord,
                pixelRatio,
                projectionString,
                origTileUrlFunc
            );
        });
        layerSource.setTileLoadFunction((tile, url) => {
            return this.handleTileLoad(layer, mapLayer, tile, url, origTileLoadFunc);
        });
    }

    /**
     * create an openlayers vector layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {boolean} [fromCache=true] true if the layer may be pulled from the cache
     * @returns {object} openlayers vector layer
     * @memberof MapWrapper_openlayers
     */
    createVectorLayer(layer, fromCache = true) {
        try {
            let layerSource = this.createLayerSource(layer, {
                url: layer.get("url")
            });
            if (layer.get("clusterVector")) {
                layerSource = new Ol_Source_Cluster({ source: layerSource });
            }

            return new Ol_Layer_Vector({
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                extent: appConfig.DEFAULT_MAP_EXTENT
            });
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.createVectorLayer:", err);
            return false;
        }
    }

    /**
     * get the center of the current map view
     *
     * @returns {array} [x,y] center of the view
     * @memberof MapWrapper_openlayers
     */
    getCenter() {
        return [0, 0];
    }

    /**
     * set the view bounding box extent of the map
     *
     * @param {array} extent [minX, minY, maxX, maxY] of the desired extent
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    setExtent(extent) {
        try {
            if (extent) {
                let mapSize = this.map.getSize() || [];
                this.map.getView().fit(extent, {
                    size: mapSize,
                    constrainResolution: false
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.setExtent:", err);
            return false;
        }
    }

    /**
     * get the current view bounding box of the map
     *
     * @returns {array} [minX, minY, maxX, maxY] of the current extent
     * @memberof MapWrapper_openlayers
     */
    getExtent() {
        try {
            return this.map.getView().calculateExtent(this.map.getSize());
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getExtent:", err);
            return false;
        }
    }

    /**
     * pan the map in a specified direction by a preset number of pixels
     * default to 100 pixels, 200 if specified
     *
     * @param {string} direction (MAP_PAN_DIRECTION_UP|MAP_PAN_DIRECTION_DOWN|MAP_PAN_DIRECTION_LEFT|MAP_PAN_DIRECTION_RIGHT)
     * @param {boolean} extraFar extraFar true of the map should pan 200 pixels instead of 100 pixels
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    panMap(direction, extraFar) {
        try {
            let deltaX = 0;
            let deltaY = 0;
            let view = this.map.getView();
            let pixelDelta = extraFar ? 200 : 100;

            switch (direction) {
                case appStrings.MAP_PAN_DIRECTION_UP:
                    deltaY = pixelDelta;
                    break;
                case appStrings.MAP_PAN_DIRECTION_DOWN:
                    deltaY = -pixelDelta;
                    break;
                case appStrings.MAP_PAN_DIRECTION_LEFT:
                    deltaX = pixelDelta;
                    break;
                case appStrings.MAP_PAN_DIRECTION_RIGHT:
                    deltaX = -pixelDelta;
                    break;
                default:
                    return false;
            }

            let delta = [deltaX, deltaY];
            let centerInPx = this.map.getPixelFromCoordinate(view.getCenter());
            let newCenterInPx = [centerInPx[0] - delta[0], centerInPx[1] - delta[1]];
            let newCenter = this.map.getCoordinateFromPixel(newCenterInPx);
            this.map.getView().setCenter(this.map.getView().getCenter());
            let pan = this.map.getView().animate({
                duration: 175,
                easing: Ol_Easing.linear,
                center: newCenter
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.panMap:", err);
            return false;
        }
    }

    /**
     * zoom in the map by one zoom level
     *
     * @param {number} [duration=175] timing of the zoom animation
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    zoomIn(duration = 175) {
        try {
            if (typeof this.map !== "undefined" && typeof this.map.getView() !== "undefined") {
                this.map.getView().setResolution(this.map.getView().getResolution());
                this.map.getView().animate({
                    resolution: this.map.getView().getResolution(),
                    zoom: this.map.getView().getZoom() + 1,
                    duration: duration
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.zoomIn:", err);
            return false;
        }
    }

    /**
     * zoom out the map by one zoom level
     *
     * @param {number} [duration=175] timing of the zoom animation
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    zoomOut(duration = 175) {
        try {
            if (typeof this.map !== "undefined" && typeof this.map.getView() !== "undefined") {
                this.map.getView().setResolution(this.map.getView().getResolution());
                this.map.getView().animate({
                    resolution: this.map.getView().getResolution(),
                    zoom: this.map.getView().getZoom() - 1,
                    duration: duration
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.zoomOut:", err);
            return false;
        }
    }

    /**
     * activate a drawing interaction
     *
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    enableDrawing(geometryType) {
        try {
            // remove double-click zoom while drawing so we can double-click complete
            this.setDoubleClickZoomEnabled(false);

            // Get drawHandler by geometryType
            let drawInteraction = this.miscUtil.findObjectInArray(
                this.map.getInteractions().getArray(),
                "_id",
                appStrings.INTERACTION_DRAW + geometryType
            );
            if (drawInteraction) {
                // Call setActive(true) on handler to enable
                drawInteraction.setActive(true);
                // Check that handler is active
                return drawInteraction.getActive();
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.enableDrawing:", err);
            return false;
        }
    }

    /**
     * turn off current drawing interaction
     *
     * @param {boolean} [delayDblClickEnable=true] true if re-enabling double-click interaction should be delayed
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    disableDrawing(delayDblClickEnable = true) {
        try {
            // Call setActive(false) on all handlers
            let drawInteractions = this.miscUtil.findAllMatchingObjectsInArray(
                this.map.getInteractions().getArray(),
                appStrings.INTERACTION_DRAW,
                true
            );
            drawInteractions.map(handler => {
                handler.setActive(false);

                // Check that handler is not active
                if (handler.getActive()) {
                    console.warn("could not disable openlayers draw handler:", handler.get("_id"));
                }
            });

            // re-enable double-click zoom
            if (delayDblClickEnable) {
                setTimeout(() => {
                    this.setDoubleClickZoomEnabled(true);
                }, 251);
            } else {
                this.setDoubleClickZoomEnabled(true);
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.disableDrawing:", err);
            return false;
        }
    }

    /**
     * finalize a drawing interaction
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    completeDrawing() {
        try {
            let drawInteractions = this.miscUtil.findAllMatchingObjectsInArray(
                this.map.getInteractions().getArray(),
                appStrings.INTERACTION_DRAW,
                true
            );
            drawInteractions.map(handler => {
                if (handler.getActive()) {
                    handler.finishDrawing();
                }
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.completeDrawing:", err);
            return false;
        }
    }

    /**
     * enable a measuring interaction
     *
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @param {string} measurementType (Distance|Area)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    enableMeasuring(geometryType, measurementType) {
        try {
            // remove double-click zoom while drawing so we can double-click complete
            this.setDoubleClickZoomEnabled(false);

            // Get drawHandler by geometryType
            let interaction = this.miscUtil.findObjectInArray(
                this.map.getInteractions().getArray(),
                "_id",
                appStrings.INTERACTION_MEASURE + geometryType
            );
            if (interaction) {
                // Call setActive(true) on handler to enable
                interaction.setActive(true);
                // Check that handler is active
                return interaction.getActive();
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.enableMeasuring:", err);
            return false;
        }
    }

    /**
     * turn off current measuring interaction
     *
     * @param {boolean} [delayDblClickEnable=true] true if re-enabling double-click interaction should be delayed
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    disableMeasuring(delayDblClickEnable = true) {
        try {
            // Call setActive(false) on all handlers
            let measureInteractions = this.miscUtil.findAllMatchingObjectsInArray(
                this.map.getInteractions().getArray(),
                appStrings.INTERACTION_MEASURE,
                true
            );
            measureInteractions.map(handler => {
                handler.setActive(false);

                // Check that handler is not active
                if (handler.getActive()) {
                    console.warn(
                        "could not disable openlayers measure handler:",
                        handler.get("_id")
                    );
                }
            });
            // re-enable double-click zoom
            if (delayDblClickEnable) {
                setTimeout(() => {
                    this.setDoubleClickZoomEnabled(true);
                }, 251);
            } else {
                this.setDoubleClickZoomEnabled(true);
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.disableMeasuring:", err);
            return false;
        }
    }

    /**
     * finalize a measuring interaction
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    completeMeasuring() {
        try {
            let measureInteractions = this.miscUtil.findAllMatchingObjectsInArray(
                this.map.getInteractions().getArray(),
                appStrings.INTERACTION_MEASURE,
                true
            );
            measureInteractions.map(handler => {
                if (handler.getActive()) {
                    handler.finishDrawing();
                }
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.completeMeasuring:", err);
            return false;
        }
    }

    /**
     * enable or disable the double-click interaction
     * which can interfere with certain aspects of shape
     * drawing
     *
     * @param {boolean} enabled true if the double-click interaction should be enabled
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    setDoubleClickZoomEnabled(enabled) {
        try {
            let dblClickInteraction = this.miscUtil.findObjectInArray(
                this.map.getInteractions().getArray(),
                interaction => {
                    return interaction instanceof Ol_Interaction_DoubleClickZoom;
                }
            );
            if (dblClickInteraction) {
                dblClickInteraction.setActive(enabled);
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.setDoubleClickZoomEnabled:", err);
            return false;
        }
    }

    /**
     * Enable or disable all currently active listeners.
     * Overriden to avoid warning logs from
     * parent class
     *
     * @param {boolean} active true if the listeners should be enabled
     * @returns {boolean} false
     * @memberof MapWrapper_openlayers
     */
    enableActiveListeners(active) {
        return false;
    }

    /**
     * add a geometry to the map
     *
     * @param {object} geometry geometry to add to the map
     * - type - {string} (Circle|LineString|Polygon)
     * - coordinateType - {string} (Cartesian|Cartographic)
     * - center - {object} center coordinate of circle {lon,lat}
     * - radius - {number} radius of circle
     * - coordinates - {array} set of coordinates for shape [{lat,lon}]
     * @param {string} interactionType (Draw|Measure)
     * @param {boolean} [geodesic=false] true if the shape be processed into geodesic arcs
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    addGeometry(geometry, interactionType, geodesic = false) {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", "_vector_drawings");
        if (!mapLayer) {
            console.warn("could not find drawing layer in openlayers map");
            return false;
        }
        if (geometry.type === appStrings.GEOMETRY_CIRCLE) {
            let circleGeom = null;
            if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTOGRAPHIC) {
                circleGeom = new Ol_Geom_Circle(
                    [geometry.center.lon, geometry.center.lat],
                    geometry.radius /
                        Ol_Proj.METERS_PER_UNIT[
                            this.map
                                .getView()
                                .getProjection()
                                .getUnits()
                        ]
                );
            } else {
                console.warn(
                    "Unsupported geometry coordinateType ",
                    geometry.coordinateType,
                    " for openlayers circle"
                );
                return false;
            }
            let circleFeature = new Ol_Feature({
                geometry: circleGeom
            });
            circleFeature.set("interactionType", interactionType);
            circleFeature.setId(geometry.id);
            mapLayer.getSource().addFeature(circleFeature);
            return true;
        }
        if (geometry.type === appStrings.GEOMETRY_LINE_STRING) {
            let lineStringGeom = null;
            if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTOGRAPHIC) {
                let geomCoords = geometry.coordinates.map(x => {
                    return [x.lon, x.lat];
                });

                // generate geodesic arcs from points
                if (geodesic) {
                    geomCoords = this.mapUtil.generateGeodesicArcsForLineString(geomCoords);
                }

                lineStringGeom = new Ol_Geom_Linestring(geomCoords);
            } else {
                console.warn(
                    "Unsupported geometry coordinateType ",
                    geometry.coordinateType,
                    " for openlayers lineString"
                );
                return false;
            }

            let lineStringFeature = new Ol_Feature({
                geometry: lineStringGeom
            });
            lineStringFeature.set("interactionType", interactionType);
            lineStringFeature.setId(geometry.id);
            mapLayer.getSource().addFeature(lineStringFeature);
            return true;
        }
        if (geometry.type === appStrings.GEOMETRY_POLYGON) {
            let polygonGeom = null;
            if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTOGRAPHIC) {
                // Map obj to array
                let geomCoords = geometry.coordinates.map(x => {
                    return [x.lon, x.lat];
                });
                // Push the first point to close the ring
                geomCoords.push([geometry.coordinates[0].lon, geometry.coordinates[0].lat]);

                // generate geodesic arcs from points
                if (geodesic) {
                    geomCoords = this.mapUtil.generateGeodesicArcsForLineString(geomCoords);
                }

                // Put these coordinates into a ring by adding to array
                polygonGeom = new Ol_Geom_Polygon([geomCoords]);
            } else {
                console.warn(
                    "Unsupported geometry coordinateType ",
                    geometry.coordinateType,
                    " for openlayers polygon"
                );
                return false;
            }
            let polygonFeature = new Ol_Feature({
                geometry: polygonGeom
            });
            polygonFeature.set("interactionType", interactionType);
            polygonFeature.setId(geometry.id);
            mapLayer.getSource().addFeature(polygonFeature);
            return true;
        }
        return false;
    }

    /**
     * add a label to the map
     *
     * @param {string} label the content of the label
     * @param {array} coords location of the label on the map [lon,lat]
     * @param {object} [opt_meta={}] additional data to attach to the label object (optional)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    addLabel(label, coords, opt_meta = {}) {
        try {
            // Create label domNode
            let measureLabelEl = document.createElement("div");
            measureLabelEl.className = tooltipStyles.tooltip;
            measureLabelEl.innerHTML = label;

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
            this.map.addOverlay(measureLabel);
            measureLabel.setPosition(coords);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.addLabel:", err);
            return false;
        }
    }

    /**
     * remove all drawing geometries from the map
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    removeAllDrawings() {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", "_vector_drawings");
        if (!mapLayer) {
            console.warn("could not remove all geometries in openlayers map");
            return false;
        }
        // Remove geometries
        let mapLayerFeatures = mapLayer.getSource().getFeatures();
        let featuresToRemove = mapLayerFeatures.filter(
            x => x.get("interactionType") === appStrings.INTERACTION_DRAW
        );
        for (let i = 0; i < featuresToRemove.length; i++) {
            mapLayer.getSource().removeFeature(featuresToRemove[i]);
        }
        return (
            mapLayer
                .getSource()
                .getFeatures()
                .filter(x => x.get("interactionType") === appStrings.INTERACTION_DRAW).length === 0
        );
    }

    /**
     * remove all measurement geometries from the map
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    removeAllMeasurements() {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", "_vector_drawings");
        if (!mapLayer) {
            console.warn("could not remove all geometries in openlayers map");
            return false;
        }
        // Remove geometries
        let mapLayerFeatures = mapLayer.getSource().getFeatures();
        let featuresToRemove = mapLayerFeatures.filter(
            x => x.get("interactionType") === appStrings.INTERACTION_MEASURE
        );
        for (let i = 0; i < featuresToRemove.length; i++) {
            mapLayer.getSource().removeFeature(featuresToRemove[i]);
        }
        // Remove overlays
        this.map.getOverlays().clear();
        return (
            mapLayer
                .getSource()
                .getFeatures()
                .filter(x => x.get("interactionType") === appStrings.INTERACTION_MEASURE).length ===
                0 && this.map.getOverlays().getArray().length === 0
        );
    }

    /**
     * Reset the orientation of the map to north up.
     * Overriden to avoid warning logs from parent class
     *
     * @param {number} duration timing of the animation
     * @returns {boolean} false
     * @memberof MapWrapper_openlayers
     */
    resetOrientation(duration) {
        return true;
    }

    /**
     * add a handler to the map for a given type of drawing
     *
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @param {function} onDrawEnd callback for when the drawing completes
     * @param {string} interactionType (Draw|Measure)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    addDrawHandler(geometryType, onDrawEnd, interactionType) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(
                mapLayers,
                "_layerId",
                "_vector_drawings"
            );
            if (mapLayer) {
                let measureDistGeom = (coords, opt_geom) => {
                    let geom = opt_geom ? opt_geom : new Ol_Geom_Linestring();

                    // remove duplicates
                    let newCoords = coords.reduce((acc, el, i) => {
                        let prev = acc[i - 1];
                        el = this.mapUtil.constrainCoordinates(el);
                        if (!prev || (prev[0] !== el[0] || prev[1] !== el[1])) {
                            acc.push(el);
                        }
                        return acc;
                    }, []);

                    let lineCoords = this.mapUtil.generateGeodesicArcsForLineString(newCoords);
                    geom.setCoordinates(lineCoords);
                    geom.set("originalCoordinates", newCoords, true);
                    return geom;
                };
                let measureAreaGeom = (coords, opt_geom) => {
                    coords = coords[0]; // TODO: find case where this isn't what we want
                    let geom = opt_geom ? opt_geom : new Ol_Geom_Polygon();

                    // remove duplicates
                    let newCoords = coords.reduce((acc, el, i) => {
                        let prev = acc[i - 1];
                        el = this.mapUtil.constrainCoordinates(el);
                        if (!prev || (prev[0] !== el[0] || prev[1] !== el[1])) {
                            acc.push(el);
                        }
                        return acc;
                    }, []);

                    // add last leg
                    if (newCoords.length > 1) {
                        newCoords.push(newCoords[0]);
                    }

                    let lineCoords = this.mapUtil.generateGeodesicArcsForLineString(newCoords);
                    geom.setCoordinates([lineCoords]);
                    geom.set("originalCoordinates", newCoords, true);
                    return geom;
                };

                let geometryFunction = undefined;
                let shapeType = appStrings.SHAPE_AREA;
                if (interactionType === appStrings.INTERACTION_MEASURE) {
                    if (geometryType === appStrings.GEOMETRY_LINE_STRING) {
                        geometryFunction = measureDistGeom;
                        shapeType = appStrings.SHAPE_DISTANCE;
                    } else if (geometryType === appStrings.GEOMETRY_POLYGON) {
                        geometryFunction = measureAreaGeom;
                        shapeType = appStrings.SHAPE_AREA;
                    } else if (geometryType === appStrings.GEOMETRY_CIRCLE) {
                        geometryFunction = measureAreaGeom;
                        shapeType = appStrings.SHAPE_DISTANCE;
                    }
                } else {
                    if (geometryType === appStrings.GEOMETRY_LINE_STRING) {
                        shapeType = appStrings.SHAPE_DISTANCE;
                    } else if (geometryType === appStrings.GEOMETRY_POLYGON) {
                        shapeType = appStrings.SHAPE_AREA;
                    } else if (geometryType === appStrings.GEOMETRY_CIRCLE) {
                        shapeType = appStrings.SHAPE_DISTANCE;
                    }
                }
                let drawStyle = (feature, resolution) => {
                    return this.defaultDrawingStyle(feature, resolution, shapeType);
                };
                let drawInteraction = new Ol_Interaction_Draw({
                    source: mapLayer.getSource(),
                    type: geometryType,
                    geometryFunction: geometryFunction,
                    style: drawStyle,
                    wrapX: true
                });

                if (appConfig.DEFAULT_MAP_EXTENT) {
                    // Override creation of overlay_ so we can pass in an extent
                    // since OL doesn't let you do this via options
                    drawInteraction.overlay_ = new Ol_Layer_Vector({
                        extent: appConfig.DEFAULT_MAP_EXTENT,
                        source: new Ol_Source_Vector({
                            useSpatialIndex: false,
                            wrapX: true
                        }),
                        style: drawStyle
                    });
                }

                // Set callback
                drawInteraction.on("drawend", event => {
                    if (typeof onDrawEnd === "function") {
                        // store type of feature and id for later reference
                        let geometry = this.retrieveGeometryFromEvent(event, geometryType);
                        event.feature.set("interactionType", interactionType);
                        event.feature.setId(geometry.id);
                        onDrawEnd(geometry, event);
                    }
                });

                // Disable
                drawInteraction.setActive(false);

                // Set properties we'll need
                drawInteraction.set("_id", interactionType + geometryType);
                drawInteraction.set(interactionType, true);

                // Add to map
                this.map.addInteraction(drawInteraction);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.addDrawHandler:", err);
            return false;
        }
    }

    /**
     * extract a standard geometry object from an openlayers draw
     * event
     *
     * @param {object} event openalyers draw complete event
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @returns {object} standard geometry object
     * - type - {string} (Circle|LineString|Polygon)
     * - coordinateType - {string} (Cartesian|Cartographic)
     * - center - {object} center coordinate of circle {lon,lat}
     * - radius - {number} radius of circle
     * - coordinates - {array} set of coordinates for shape [{lat,lon}]
     * @memberof MapWrapper_openlayers
     */
    retrieveGeometryFromEvent(event, geometryType) {
        if (geometryType === appStrings.GEOMETRY_CIRCLE) {
            let center = event.feature.getGeometry().getCenter();
            return {
                type: appStrings.GEOMETRY_CIRCLE,
                id: Math.random(),
                center: { lon: center[0], lat: center[1] },
                radius: event.feature.getGeometry().getRadius(),
                proj: this.map
                    .getView()
                    .getProjection()
                    .getCode(),
                coordinateType: appStrings.COORDINATE_TYPE_CARTOGRAPHIC
            };
        } else if (geometryType === appStrings.GEOMETRY_LINE_STRING) {
            let tmpCoords = [];
            if (event.feature.getGeometry().get("originalCoordinates")) {
                tmpCoords = event.feature
                    .getGeometry()
                    .get("originalCoordinates")
                    .map(x => {
                        return { lon: x[0], lat: x[1] };
                    });
            } else {
                tmpCoords = event.feature
                    .getGeometry()
                    .getCoordinates()
                    .map(x => {
                        return { lon: x[0], lat: x[1] };
                    });
            }
            return {
                type: appStrings.GEOMETRY_LINE_STRING,
                id: Math.random(),
                proj: this.map
                    .getView()
                    .getProjection()
                    .getCode(),
                coordinates: tmpCoords,
                coordinateType: appStrings.COORDINATE_TYPE_CARTOGRAPHIC
            };
        } else if (geometryType === appStrings.GEOMETRY_POLYGON) {
            let tmpCoords = [];
            if (event.feature.getGeometry().get("originalCoordinates")) {
                tmpCoords = event.feature
                    .getGeometry()
                    .get("originalCoordinates")
                    .map(x => {
                        return { lon: x[0], lat: x[1] };
                    });
            } else {
                tmpCoords = event.feature
                    .getGeometry()
                    .getCoordinates()[0]
                    .map(x => {
                        return { lon: x[0], lat: x[1] };
                    });
            }
            return {
                type: appStrings.GEOMETRY_POLYGON,
                id: Math.random(),
                proj: this.map
                    .getView()
                    .getProjection()
                    .getCode(),
                coordinates: tmpCoords,
                coordinateType: appStrings.COORDINATE_TYPE_CARTOGRAPHIC
            };
        }

        return false;
    }

    /**
     * adjust the display of all measurement overlays currently on the map
     * to display in the specified units
     *
     * @param {string} units (metric|imperial|nautical|schoolbus)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    setScaleUnits(units) {
        try {
            // Set scalebar units
            let controls = this.map.getControls();
            controls.forEach((el, index, arr) => {
                if (typeof el.setUnits === "function") {
                    el.setUnits(units);
                }
            });
            // Set measurement units
            this.map.getOverlays().forEach(overlay => {
                if (overlay.get("measurementType") === appStrings.MEASURE_AREA) {
                    overlay.getElement().innerHTML = this.mapUtil.formatArea(
                        this.mapUtil.convertAreaUnits(overlay.get("meters"), units),
                        units
                    );
                } else if (overlay.get("measurementType") === appStrings.MEASURE_DISTANCE) {
                    overlay.getElement().innerHTML = this.mapUtil.formatDistance(
                        this.mapUtil.convertDistanceUnits(overlay.get("meters"), units),
                        units
                    );
                } else {
                    console.warn("could not set openlayers scale units.");
                    return false;
                }
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.setScaleUnits:", err);
            return false;
        }
    }

    /**
     * add an openlayers layer object to the map
     *
     * @param {object} mapLayer openlayers layer object
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    addLayer(mapLayer) {
        try {
            let index = this.findTopInsertIndexForLayer(mapLayer);
            this.map.getLayers().insertAt(index, mapLayer);
            this.addLayerToCache(mapLayer, appConfig.TILE_LAYER_UPDATE_STRATEGY);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.addLayer:", err);
            return false;
        }
    }

    /**
     * remove an openlayers layer object from the map
     *
     * @param {object} mapLayer openlayers layer object
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    removeLayer(mapLayer) {
        try {
            this.map.removeLayer(mapLayer);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.removeLayer:", err);
            return false;
        }
    }

    /**
     * replace a layer on the map
     *
     * @param {object} mapLayer openlayers layer object
     * @param {number} index the display index of the layer to be replaced
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    replaceLayer(mapLayer, index) {
        try {
            this.map.getLayers().setAt(index, mapLayer);
            this.addLayerToCache(mapLayer, appConfig.TILE_LAYER_UPDATE_STRATEGY);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.replaceLayer:", err);
            return false;
        }
    }

    /**
     * activate a layer on the map. This will create a new
     * openlayers layer object and add it to the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
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

            // if the creation failed
            if (!mapLayer) {
                return false;
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

    /**
     * Remove a layer from the map. This will find the
     * openlayers layer corresponding the specified layer and
     * remove it from the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds or if layer is not active
     * @memberof MapWrapper_openlayers
     */
    deactivateLayer(layer) {
        try {
            // find the layer on the map
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));

            // remove the layer
            if (mapLayer) {
                return this.removeLayer(mapLayer);
            }

            // Layer is already not active
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.deactivateLayer:", err);
            return false;
        }
    }

    /**
     * set a layer active/inactive on the map
     *
     * @param {obejct} layer layer from map state in redux
     * @param {boolean} [active=true] true if the layer should be added to the map
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    setLayerActive(layer, active) {
        if (active) {
            return this.activateLayer(layer);
        } else {
            return this.deactivateLayer(layer);
        }
    }

    /**
     * set the opacity of a layer on the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {number} opacity value of the opacity [0.0 - 1.0]
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    setLayerOpacity(layer, opacity) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));
            if (mapLayer) {
                mapLayer.setOpacity(opacity);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.setLayerOpacity:", err);
            return false;
        }
    }

    /**
     * Set the basemap layer on the map.
     * The basemap is fixed as the bottom layer on the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    setBasemap(layer) {
        try {
            // create the new basemap layer
            let newBasemap = this.createLayer(layer);
            if (newBasemap) {
                // replace or insert new basemap (insert should happen only once)
                let mapLayers = this.map.getLayers();
                if (
                    mapLayers.getLength() > 0 &&
                    mapLayers.item(0).get("_layerType") === appStrings.LAYER_GROUP_TYPE_BASEMAP
                ) {
                    mapLayers.setAt(0, newBasemap);
                } else {
                    mapLayers.insertAt(0, newBasemap);
                }
                newBasemap.setVisible(true);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.setBasemap:", err);
            return false;
        }
    }

    /**
     * Hide the display of the basemap. This does not
     * remove the basemap layer but makes it invisble.
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    hideBasemap() {
        try {
            let mapLayers = this.map.getLayers();
            if (typeof mapLayers.item(0) !== "undefined") {
                mapLayers.item(0).setVisible(false);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.hideBasemap:", err);
            return false;
        }
    }

    /**
     * add a listener to the map for a given interaction
     *
     * @param {string} eventStr event type to listen for (mousemove|moveend|click)
     * @param {function} callback function to call when the event is fired
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    addEventListener(eventStr, callback) {
        try {
            switch (eventStr) {
                case appStrings.EVENT_MOUSE_HOVER:
                    return this.map.addEventListener("pointermove", position => {
                        callback(position.pixel);
                    });
                case appStrings.EVENT_MOUSE_CLICK:
                    return this.map.addEventListener("click", clickEvt => {
                        callback({ pixel: clickEvt.pixel });
                    });
                case appStrings.EVENT_MOVE_END:
                    return this.map.addEventListener("moveend", callback);
                default:
                    return this.map.addEventListener(eventStr, callback);
            }
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.addEventListener:", err);
            return false;
        }
    }

    /**
     * get the current zoom level of the map
     *
     * @returns {number|boolean} zoom level or false if it fails
     * @memberof MapWrapper_openlayers
     */
    getZoom() {
        try {
            return this.map.getView().getZoom();
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getZoom:", err);
            return false;
        }
    }

    /**
     * returns the projection string of the current map projection
     *
     * @returns {string} code of the current map projection
     * @memberof MapWrapper_openlayers
     */
    getProjection() {
        try {
            return this.map
                .getView()
                .getProjection()
                .getCode();
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getProjection:", err);
            return false;
        }
    }

    /**
     * update a layer on the map. This creates a new layer
     * and replaces the layer with a matching id
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    updateLayer(layer) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayerWithIndex = this.miscUtil.findObjectWithIndexInArray(
                mapLayers,
                "_layerId",
                layer.get("id")
            );
            if (mapLayerWithIndex) {
                if (
                    appConfig.TILE_LAYER_UPDATE_STRATEGY ===
                        appStrings.TILE_LAYER_UPDATE_STRATEGIES.TILE &&
                    [
                        appStrings.LAYER_GIBS_RASTER,
                        appStrings.LAYER_WMTS_RASTER,
                        appStrings.LAYER_XYZ_RASTER
                    ].indexOf(layer.get("handleAs")) !== -1
                ) {
                    let mapLayer = mapLayerWithIndex.value;

                    // cache the source for later
                    this.addLayerToCache(mapLayer, appConfig.TILE_LAYER_UPDATE_STRATEGY);

                    // find a cached source
                    let cacheHash = this.getCacheHash(layer) + "_source";
                    let source = this.layerCache.get(cacheHash);
                    if (!source) {
                        // create a new source
                        let options = layer.get("wmtsOptions").toJS();
                        source = this.createLayerSource(layer, options, false);

                        this.setWMTSLayerOverrides(source, layer, mapLayer);
                    } else if (appConfig.DEFAULT_TILE_TRANSITION_TIME !== 0) {
                        // reset the transition tracking for the tiles to enable crossfade
                        let tileCache = source.getTileCacheForProjection(source.getProjection());
                        tileCache.forEach(tile => {
                            tile.transitionStarts_ = {};
                        });
                    }

                    // update the layer
                    mapLayer.set("_layerId", layer.get("id"));
                    mapLayer.set("_layerType", layer.get("type"));
                    mapLayer.set("_layerCacheHash", this.getCacheHash(layer));
                    mapLayer.set(
                        "_layerTime",
                        moment(this.mapDate).format(layer.get("timeFormat"))
                    );
                    mapLayer.setSource(source);
                } else {
                    let updatedMapLayer = this.createLayer(layer);
                    this.replaceLayer(updatedMapLayer, mapLayerWithIndex.index);
                }
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.updateLayer:", err);
            return false;
        }
    }

    /**
     * add an openlayers layer object, or its source, to a layer cache
     * to preserve its resources. If updateStrategy is "replace_tile" then
     * only the layer source is cached, if the updateStrategy is "replace_layer"
     * then the entire layer object is cached.
     *
     * @param {object} mapLayer openlayers layer object
     * @param {string} [updateStrategy=appStrings.TILE_LAYER_UPDATE_STRATEGIES.TILE] (replace_tile|replace_layer)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    addLayerToCache(mapLayer, updateStrategy = appStrings.TILE_LAYER_UPDATE_STRATEGIES.TILE) {
        try {
            // cache the source for later
            switch (updateStrategy) {
                case appStrings.TILE_LAYER_UPDATE_STRATEGIES.TILE:
                    this.layerCache.set(
                        mapLayer.get("_layerCacheHash") + "_source",
                        mapLayer.getSource()
                    );
                    break;
                case appStrings.TILE_LAYER_UPDATE_STRATEGIES.LAYER:
                    this.layerCache.set(mapLayer.get("_layerCacheHash"), mapLayer);
                    break;
                default:
                    this.layerCache.set(mapLayer.get("_layerCacheHash"), mapLayer);
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayer.addLayerToCache: ", err);
            return false;
        }
    }

    /**
     * get the lat-lon corresponding to a given pixel position
     * within the containing domnode
     *
     * @param {array} pixel location in the container [x,y]
     * @returns {object|boolean} object of position of false if it fails
     * - lat - {number} latitude of the pixel location
     * - lon - {number} longitude of the pixel location
     * - isValid - {boolean} pixel was on the globe
     * @memberof MapWrapper_openlayers
     */
    getLatLonFromPixelCoordinate(pixel) {
        try {
            let coordinate = this.map.getCoordinateFromPixel(pixel);
            let constrainCoordinate = this.mapUtil.constrainCoordinates(coordinate);
            if (
                typeof constrainCoordinate[0] !== "undefined" &&
                typeof constrainCoordinate[1] !== "undefined" &&
                !isNaN(constrainCoordinate[0]) &&
                !isNaN(constrainCoordinate[0])
            ) {
                return {
                    lat: constrainCoordinate[0],
                    lon: constrainCoordinate[1],
                    isValid: coordinate[1] <= 90 && coordinate[1] >= -90
                };
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getLatLonFromPixelCoordinate:", err);
            return false;
        }
    }

    /**
     * move a layer to the top of the map display stack
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    moveLayerToTop(layer) {
        try {
            let mapLayers = this.map.getLayers();
            let mapLayerWithIndex = this.miscUtil.findObjectWithIndexInArray(
                mapLayers.getArray(),
                "_layerId",
                layer.get("id")
            );
            if (mapLayerWithIndex) {
                let mapLayer = mapLayerWithIndex.value;
                let currIndex = mapLayerWithIndex.index;
                mapLayers.removeAt(currIndex);
                let newIndex = this.findTopInsertIndexForLayer(mapLayer);
                mapLayers.insertAt(newIndex, mapLayer);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.moveLayerToTop:", err);
            return false;
        }
    }

    /**
     * Move a layer to the bottom of the map display stack.
     * The layer will always be above the basemap, which
     * is always at the absolute bottom of the display
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    moveLayerToBottom(layer) {
        try {
            let mapLayers = this.map.getLayers();
            let mapLayerWithIndex = this.miscUtil.findObjectWithIndexInArray(
                mapLayers.getArray(),
                "_layerId",
                layer.get("id")
            );
            if (mapLayerWithIndex) {
                let mapLayer = mapLayerWithIndex.value;
                let currIndex = mapLayerWithIndex.index;
                mapLayers.removeAt(currIndex);
                mapLayers.insertAt(1, mapLayer); // index 1 because we always have a basemap. TODO - verify
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.moveLayerToBottom:", err);
            return false;
        }
    }

    /**
     * move a layer up in the display stack
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    moveLayerUp(layer) {
        try {
            let mapLayers = this.map.getLayers();
            let mapLayerWithIndex = this.miscUtil.findObjectWithIndexInArray(
                mapLayers.getArray(),
                "_layerId",
                layer.get("id")
            );
            if (mapLayerWithIndex) {
                let mapLayer = mapLayerWithIndex.value;
                let currIndex = mapLayerWithIndex.index;
                mapLayers.removeAt(currIndex);
                let topIndex = this.findTopInsertIndexForLayer(mapLayer);
                let newIndex = currIndex < topIndex ? currIndex + 1 : currIndex;
                mapLayers.insertAt(newIndex, mapLayer);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.moveLayerUp:", err);
            return false;
        }
    }

    /**
     * move a layer down in the display stack.
     * The layer will always be above the basemap, which
     * is always at the absolute bottom of the display
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    moveLayerDown(layer) {
        try {
            let mapLayers = this.map.getLayers();
            let mapLayerWithIndex = this.miscUtil.findObjectWithIndexInArray(
                mapLayers.getArray(),
                "_layerId",
                layer.get("id")
            );
            if (mapLayerWithIndex) {
                let mapLayer = mapLayerWithIndex.value;
                let currIndex = mapLayerWithIndex.index;
                if (currIndex > 1) {
                    mapLayers.removeAt(currIndex);
                    mapLayers.insertAt(currIndex - 1, mapLayer);
                }
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.moveLayerDown:", err);
            return false;
        }
    }

    /**
     * get a list of the layer ids for layers
     * that are marked as type "data" and are
     * currently active
     *
     * @returns {array|boolean} list of string layer ids or false if it fails
     * @memberof MapWrapper_openlayers
     */
    getActiveLayerIds() {
        try {
            let retList = [];
            let mapLayers = this.map.getLayers();
            mapLayers.forEach(mapLayer => {
                if (
                    mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_DATA &&
                    mapLayer.getVisible()
                ) {
                    retList.push(mapLayer.get("_layerId"));
                }
            });
            return retList;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getActiveLayerIds:", err);
            return false;
        }
    }

    /**
     * retrieve the corresponding viewport pixel from an openlayers
     * click event
     *
     * @param {object} clickEvt openlayers click event wrapper
     * @returns {array|boolean} pixel coordinates or false if it fails
     * @memberof MapWrapper_openlayers
     */
    getPixelFromClickEvent(clickEvt) {
        try {
            return clickEvt.pixel;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getPixelFromClickEvent:", err);
            return false;
        }
    }

    /**
     * clear the current layer cache
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_openlayers
     */
    clearCache() {
        try {
            this.layerCache.clear();
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.clearCache:", err);
            return false;
        }
    }

    /* functions for openlayers only */

    /**
     * generate a url for a tile for a wmts raster layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} mapLayer openlayers layer object
     * @param {object} layerSource openlayers layer source object
     * @param {array} tileCoord [x,y,z] tile coordinate
     * @param {number} pixelRatio map view pixel ratio
     * @param {string} projectionString projection code
     * @param {function} origFunc openlayers default tile url generation function (tileCoord, pixelRatio, projectionString) --> {string}
     * @returns {string} url for this tile
     * @memberof MapWrapper_openlayers
     */
    generateTileUrl(
        layer,
        mapLayer,
        layerSource,
        tileCoord,
        pixelRatio,
        projectionString,
        origFunc
    ) {
        try {
            let origUrl = layer.getIn(["wmtsOptions", "url"]);
            let customUrlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["wmtsOptions", "urlFunctions", appStrings.MAP_LIB_2D])
            );
            let tileMatrixIds =
                typeof layerSource.getTileGrid === "function" &&
                typeof layerSource.getTileGrid().getMatrixIds === "function"
                    ? layerSource.getTileGrid().getMatrixIds()
                    : [];
            if (typeof customUrlFunction === "function") {
                return customUrlFunction({
                    layer,
                    mapLayer,
                    origUrl,
                    tileCoord,
                    tileMatrixIds,
                    pixelRatio,
                    projectionString,
                    context: appStrings.MAP_LIB_2D
                });
            }
            return origFunc(tileCoord, pixelRatio, projectionString);
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.generateTileUrl:", err);
            return false;
        }
    }

    /**
     * load in a tile for a wmts raster layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} mapLayer openlayers layer object
     * @param {object} tile openlayers tile object
     * @param {sting} url url used for this tiles raster image
     * @param {function} origFunc openlayers default tile load function (tile, url) , pixelRatio, projectionString) --> {string}
     * @returns undefined
     * @memberof MapWrapper_openlayers
     */
    handleTileLoad(layer, mapLayer, tile, url, origFunc) {
        try {
            let customTileFunction = this.tileHandler.getTileFunction(
                layer.getIn(["wmtsOptions", "tileFunctions", appStrings.MAP_LIB_2D])
            );
            if (typeof customTileFunction === "function") {
                return customTileFunction({
                    layer,
                    mapLayer,
                    tile,
                    url,
                    defaultFunc: () => {
                        return origFunc(tile, url);
                    }
                });
            }
            return origFunc(tile, url);
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.handleTileLoad:", err);
            return false;
        }
    }

    /**
     * creates an openlayers layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * - layer - {string} layer identifier
     * - format - {string} tile resouce format
     * - requestEncoding - {string} url encoding (REST|KVP)
     * - matrixSet - {string} matrix set for the tile pyramid
     * - projection - {string} projection string
     * - extents - {array} bounding box extents for this layer
     * - tileGrid - {object} of tiling options
     *   - origin - {array} lat lon coordinates of layer upper left
     *   - resolutions - {array} list of tile resolutions
     *   - matrixIds - {array} identifiers for each zoom level
     *   - tileSize - {number} size of the tiles
     * @param {boolean} [fromCache=true] true if the source may be pulled from the cache
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createLayerSource(layer, options, fromCache = true) {
        // check cache
        if (fromCache) {
            let cacheHash = this.getCacheHash(layer) + "_source";
            if (this.layerCache.get(cacheHash)) {
                return this.layerCache.get(cacheHash);
            }
        }

        switch (layer.get("handleAs")) {
            case appStrings.LAYER_GIBS_RASTER:
                return this.createGIBSWMTSSource(layer, options);
            case appStrings.LAYER_WMTS_RASTER:
                return this.createWMTSSource(layer, options);
            case appStrings.LAYER_XYZ_RASTER:
                return this.createXYZSource(layer, options);
            case appStrings.LAYER_VECTOR_GEOJSON:
                return this.createVectorGeojsonSource(layer, options);
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.createVectorTopojsonSource(layer, options);
            case appStrings.LAYER_VECTOR_KML:
                return this.createVectorKMLSource(layer, options);
            default:
                console.warn(
                    "Error in MapWrapper_openlayers.createLayerSource: unknonw layer type - ",
                    layer.get("handleAs")
                );
                return false;
        }
    }

    /**
     * creates an openlayers wmts layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * - layer - {string} layer identifier
     * - format - {string} tile resouce format
     * - requestEncoding - {string} url encoding (REST|KVP)
     * - matrixSet - {string} matrix set for the tile pyramid
     * - projection - {string} projection string
     * - extents - {array} bounding box extents for this layer
     * - tileGrid - {object} of tiling options
     *   - origin - {array} lat lon coordinates of layer upper left
     *   - resolutions - {array} list of tile resolutions
     *   - matrixIds - {array} identifiers for each zoom level
     *   - tileSize - {number} size of the tiles
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createWMTSSource(layer, options) {
        return new Ol_Source_WMTS({
            url: options.url,
            layer: options.layer,
            format: options.format,
            requestEncoding: options.requestEncoding,
            matrixSet: options.matrixSet,
            projection: options.projection,
            tileGrid: new Ol_Tilegrid_WMTS({
                extent: options.extents,
                origin: options.tileGrid.origin,
                resolutions: options.tileGrid.resolutions,
                matrixIds: options.tileGrid.matrixIds,
                tileSize: options.tileGrid.tileSize
            }),
            transition: appConfig.DEFAULT_TILE_TRANSITION_TIME,
            wrapX: true
        });
    }

    /**
     * creates an openlayers wmts layer source with GIBS specific adjustments
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * - layer - {string} layer identifier
     * - format - {string} tile resouce format
     * - requestEncoding - {string} url encoding (REST|KVP)
     * - matrixSet - {string} matrix set for the tile pyramid
     * - projection - {string} projection string
     * - extents - {array} bounding box extents for this layer
     * - tileGrid - {object} of tiling options
     *   - origin - {array} lat lon coordinates of layer upper left
     *   - resolutions - {array} list of tile resolutions
     *   - matrixIds - {array} identifiers for each zoom level
     *   - tileSize - {number} size of the tiles
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createGIBSWMTSSource(layer, options) {
        return new Ol_Source_WMTS({
            url: options.url,
            layer: options.layer,
            format: options.format,
            requestEncoding: options.requestEncoding,
            matrixSet: options.matrixSet,
            projection: options.projection,
            tileGrid: new Ol_Tilegrid_WMTS({
                extent: options.extents,
                origin: options.tileGrid.origin,
                resolutions: options.tileGrid.resolutions.slice(
                    2,
                    appConfig.GIBS_IMAGERY_RESOLUTIONS.length
                ),
                // resolutions: options.tileGrid.resolutions,
                matrixIds: options.tileGrid.matrixIds.slice(2, options.tileGrid.matrixIds.length),
                // matrixIds: options.tileGrid.matrixIds,
                tileSize: options.tileGrid.tileSize
            }),
            transition: appConfig.DEFAULT_TILE_TRANSITION_TIME,
            wrapX: true
        });
    }

    /**
     * creates an openlayers xyz layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * - layer - {string} layer identifier
     * - format - {string} tile resouce format
     * - requestEncoding - {string} url encoding (REST|KVP)
     * - matrixSet - {string} matrix set for the tile pyramid
     * - projection - {string} projection string
     * - extents - {array} bounding box extents for this layer
     * - tileGrid - {object} of tiling options
     *   - origin - {array} lat lon coordinates of layer upper left
     *   - resolutions - {array} list of tile resolutions
     *   - matrixIds - {array} identifiers for each zoom level
     *   - tileSize - {number} size of the tiles
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createXYZSource(layer, options) {
        return new Ol_Source_XYZ({
            url: options.url,
            projection: options.projection,
            maxZoom: options.tileGrid.maxZoom,
            minZoom: options.tileGrid.minZoom,
            tileSize: options.tileGrid.tileSize,
            transition: appConfig.DEFAULT_TILE_TRANSITION_TIME,
            wrapX: true
        });
    }

    /**
     * creates an openlayers geojson vector layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createVectorGeojsonSource(layer, options) {
        // customize the layer url if needed
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D]) !== "undefined"
        ) {
            let urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D])
            );
            options.url = urlFunction({
                layer: layer,
                url: options.url
            });
        }

        return new Ol_Source_Vector({
            url: options.url,
            format: new Ol_Format_GeoJSON()
        });
    }

    /**
     * creates an openlayers topojson vector layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createVectorTopojsonSource(layer, options) {
        // customize the layer url if needed
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D]) !== "undefined"
        ) {
            let urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D])
            );
            options.url = urlFunction({
                layer: layer,
                url: options.url
            });
        }

        return new Ol_Source_Vector({
            url: options.url,
            format: new Ol_Format_TopoJSON()
        });
    }

    /**
     * creates an openlayers kml vector layer source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options raster imagery options for layer from redux state
     * - url - {string} base url for this layer
     * @returns {object} openlayers source object
     * @memberof MapWrapper_openlayers
     */
    createVectorKMLSource(layer, options) {
        // customize the layer url if needed
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D]) !== "undefined"
        ) {
            let urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D])
            );
            options.url = urlFunction({
                layer: layer,
                url: options.url
            });
        }

        return new Ol_Source_Vector({
            url: options.url,
            format: new Ol_Format_KML()
        });
    }

    /**
     * Find the highest index for a layer to be displayed.
     * Data layers are displayed below reference layers and
     * above basemaps
     *
     * @param {object} mapLayer openlayers map layer to compare
     * @returns {number} highest index display index for a layer of this type
     * @memberof MapWrapper_openlayers
     */
    findTopInsertIndexForLayer(mapLayer) {
        let mapLayers = this.map.getLayers();
        let index = mapLayers.getLength();

        if (mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_REFERENCE) {
            // referece layers always on top
            return index;
        } else if (mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_BASEMAP) {
            // basemaps always on bottom
            return 0;
        } else {
            // data layers in the middle
            for (let i = index - 1; i >= 0; --i) {
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

    /**
     * get the a string representing this layer to be used in the layer cache
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {string} string representing this layer
     * @memberof MapWrapper_openlayers
     */
    getCacheHash(layer) {
        return layer.get("id") + moment(this.mapDate).format(layer.get("timeFormat"));
    }
}
