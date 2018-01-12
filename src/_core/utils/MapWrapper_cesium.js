import moment from "moment";
import MapWrapper from "_core/utils/MapWrapper";
import MiscUtil from "_core/utils/MiscUtil";
import CesiumTilingScheme_GIBS from "_core/utils/CesiumTilingScheme_GIBS";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MapUtil from "_core/utils/MapUtil";
import TileHandler from "_core/utils/TileHandler";
import "assets/cesium/Cesium.js";
import "_core/utils/CesiumDrawHelper.js";
import Modernizr from "modernizr";

/**
 * Wrapper class for Cesium
 *
 * @export
 * @class MapWrapper_cesium
 * @extends {MapWrapper}
 */
export default class MapWrapper_cesium extends MapWrapper {
    /**
     * Creates an instance of MapWrapper_cesium.
     *
     * @param {string|domnode} container the container to render this map into
     * @param {object} options view options for constructing this map wrapper (usually map state from redux)
     * @memberof MapWrapper_cesium
     */
    constructor(container, options) {
        super(container, options);

        this.is3D = true;
        this.isActive = options.getIn(["view", "in3DMode"]);
        this.tileHandler = TileHandler;
        this.mapUtil = MapUtil;
        this.miscUtil = MiscUtil;

        // Create cesium scene
        window.CESIUM_BASE_URL = "assets/cesium";
        this.cesium = window.Cesium;
        this.drawHelper = window.DrawHelper;
        this.map = this.createMap(container, options);

        this.initializationSuccess = this.map ? true : false;

        // Only continue if map was created
        if (this.map) {
            // Create cesium-draw-helper
            this.drawHandler = new this.drawHelper({
                viewer: this.map,
                fill: appConfig.GEOMETRY_FILL_COLOR,
                stroke: appConfig.GEOMETRY_STROKE_COLOR
            });

            // Initialize custom draw-helper interactions array
            this.drawHandler._customInteractions = {};

            // Set drawhandler inactive
            this.drawHandler._isActive = false;

            // store limits for zoom
            this.zoomLimits = {
                maxZoom: options.getIn(["view", "maxZoomDistance3D"]),
                minZoom: options.getIn(["view", "minZoomDistance3D"])
            };
        }
    }
    /**
     * create a cesium map object
     *
     * @param {string|domnode} container the domnode to render to
     * @param {object} options options for creating this map (usually map state from redux)
     * @returns {object} cesium viewer object
     * @memberof MapWrapper_cesium
     */
    createMap(container, options) {
        try {
            // Check for webgl support
            if (!Modernizr.webgl) {
                throw "WebGL not available in this browser but is required by CesiumJS";
            }
            let map = new this.cesium.Viewer(container, {
                animation: false,
                baseLayerPicker: false,
                fullscreenButton: false,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                navigationHelpButton: false,
                vrButton: false,
                contextOptions: {
                    alpha: true
                },
                terrainExaggeration: 1,
                navigationInstructionsInitiallyVisible: false,
                scene3DOnly: true,
                //initialize an empty layer so Cesium doesn't load bing maps
                imageryProvider: new this.cesium.WebMapServiceImageryProvider({
                    url: " ",
                    layers: 0
                })
            });
            // Depth testing
            // Seems to be causing issues with vector rendering. Removing.
            // map.scene.globe.depthTestAgainstTerrain = true;

            // Terrain
            let terrainProvider = new this.cesium.CesiumTerrainProvider({
                url: "//assets.agi.com/stk-terrain/world"
            });
            let defaultTerrainProvider = new this.cesium.EllipsoidTerrainProvider();
            map.terrainProvider = terrainProvider;

            // remove sun and moon
            map.scene.sun = undefined;
            map.scene.moon = undefined;

            //change the maximum distance we can move from the globe
            map.scene.screenSpaceCameraController.maximumZoomDistance = options.getIn([
                "view",
                "maxZoomDistance3D"
            ]);
            map.scene.screenSpaceCameraController.minimumZoomDistance = options.getIn([
                "view",
                "minZoomDistance3D"
            ]);

            // disable right click zoom weirdness
            map.scene.screenSpaceCameraController.zoomEventTypes = this.cesium.CameraEventType.WHEEL;

            map.scene.globe.baseColor = this.cesium.Color.BLACK;

            //remove all preloaded earth layers
            map.scene.globe.imageryLayers.removeAll();

            return map;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.createMap:", err);
            return false;
        }
    }

    /**
     * return the size of the rendered map.
     * Unused, overidden to avoid warning log from parent class
     *
     * @returns false
     * @memberof MapWrapper_cesium
     */
    getMapSize() {
        return false;
    }

    /**
     * resize the map to container
     * Unused, overidden to avoid warning log from parent class
     *
     * @returns true
     * @memberof MapWrapper_cesium
     */
    resize() {
        return true;
    }

    /**
     * adjust the level of terrain exagerration on the rendered map
     *
     * @param {number} terrainExaggeration scalar value of exagerration
     * @returns true
     * @memberof MapWrapper_cesium
     */
    setTerrainExaggeration(terrainExaggeration) {
        // Set terrain exaggeration on scene
        this.map.scene._terrainExaggeration = terrainExaggeration;

        // Force re-render if terrain is currently enabled
        if (this.map.terrainProvider !== new this.cesium.EllipsoidTerrainProvider()) {
            this.map.terrainProvider = new this.cesium.EllipsoidTerrainProvider();
            this.map.terrainProvider = new this.cesium.CesiumTerrainProvider({
                url: appConfig.DEFAULT_TERRAIN_ENDPOINT
            });
        }
        return true;
    }

    /**
     * enable or disable 3D terrain display on the map
     *
     * @param {boolean} enable true if terrain should be enabled
     * @returns true
     * @memberof MapWrapper_cesium
     */
    enableTerrain(enable) {
        if (enable) {
            this.map.terrainProvider = new this.cesium.CesiumTerrainProvider({
                url: appConfig.DEFAULT_TERRAIN_ENDPOINT
            });
        } else {
            this.map.terrainProvider = new this.cesium.EllipsoidTerrainProvider();
        }
        return true;
    }

    /**
     * calculate the current center of the map view
     *
     * @returns {array|boolean} [lon,lat] of the map center or false if calculation fails
     * @memberof MapWrapper_cesium
     */
    getCenter() {
        try {
            return [
                this.cesium.Math.toDegrees(this.map.camera.positionCartographic.longitude),
                this.cesium.Math.toDegrees(this.map.camera.positionCartographic.latitude)
            ];
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.getCenter:", err);
            return false;
        }
    }

    /**
     * set the current view extent of the map
     *
     * @param {array} extent set of [minX, minY, maxX, minY] coordinates
     * @returns true if change succeeds
     * @memberof MapWrapper_cesium
     */
    setExtent(extent) {
        try {
            if (!extent) {
                return false;
            }
            let extentClone = extent.slice(0);
            // Ensure that extent lat is -90 to 90
            if (extentClone[1] < -90) {
                extentClone[1] = -90;
            }
            if (extentClone[3] > 90) {
                extentClone[3] = 90;
            }
            this.map.camera.flyTo({
                destination: this.cesium.Rectangle.fromDegrees(...extentClone),
                duration: 0
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.setExtent:", err);
            return false;
        }
    }

    /**
     * get the current view extent of the map
     *
     * @returns {array} [minX,minY,maxX,minY] extent constrained to [+-180,+-90]
     * @memberof MapWrapper_cesium
     */
    getExtent() {
        try {
            let fallbackExtent = [-180, -90, 180, 90];
            let viewRect = this.map.camera.computeViewRectangle();
            // If viewRect does not exist
            if (!viewRect) {
                return fallbackExtent;
            }
            // Convert viewRect to Degrees
            let viewRectDeg = [
                this.cesium.Math.toDegrees(viewRect.west),
                this.cesium.Math.toDegrees(viewRect.south),
                this.cesium.Math.toDegrees(viewRect.east),
                this.cesium.Math.toDegrees(viewRect.north)
            ];

            // If viewRect is too far out and we actually get [-180, -90, 180, 90],
            // attempt to approximate view by creating extent around center point
            if (
                viewRectDeg[0] === -180 &&
                viewRectDeg[1] === -90 &&
                viewRectDeg[2] === 180 &&
                viewRectDeg[3] === 90
            ) {
                let center = this.getCenter();
                if (!center) {
                    return fallbackExtent;
                }
                return [center[0] - 90, center[1] - 45, center[0] + 90, center[1] + 45];
            }
            return viewRectDeg;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.getExtent:", err);
            return false;
        }
    }
    /**
     * pan the map in a given direction by a preset number of degrees
     * default to 5 degrees, 20 if specified
     *
     * @param {string} direction (MAP_PAN_DIRECTION_UP|MAP_PAN_DIRECTION_DOWN|MAP_PAN_DIRECTION_LEFT|MAP_PAN_DIRECTION_RIGHT)
     * @param {boolean} extraFar true if the map should pan 20 degrees instead of 5
     * @returns true if pan succeeds
     * @memberof MapWrapper_cesium
     */
    panMap(direction, extraFar) {
        try {
            if (!direction) {
                return false;
            }
            let horizontalDegreesAmt = extraFar ? 20.0 : 5.0;
            let verticalDegreesAmt = extraFar ? 20.0 : 5.0;
            let viewRect = this.map.camera.computeViewRectangle();
            let horizontalDegrees = 0;
            let verticalDegrees = 0;
            if (this.cesium.defined(viewRect)) {
                horizontalDegrees =
                    horizontalDegreesAmt *
                    this.cesium.Math.toDegrees(viewRect.east - viewRect.west) /
                    360.0;
                verticalDegrees =
                    verticalDegreesAmt *
                    this.cesium.Math.toDegrees(viewRect.north - viewRect.south) /
                    180.0;
            }
            let currPosition = this.map.scene.camera.positionCartographic;
            let newPosition = currPosition.clone();

            switch (direction) {
                case appStrings.MAP_PAN_DIRECTION_UP:
                    newPosition.latitude = Math.min(
                        newPosition.latitude + this.cesium.Math.toRadians(verticalDegrees),
                        this.cesium.Math.PI_OVER_TWO
                    );
                    break;
                case appStrings.MAP_PAN_DIRECTION_DOWN:
                    newPosition.latitude = Math.max(
                        newPosition.latitude - this.cesium.Math.toRadians(verticalDegrees),
                        -this.cesium.Math.PI_OVER_TWO
                    );
                    break;
                case appStrings.MAP_PAN_DIRECTION_LEFT:
                    if (viewRect.west > viewRect.east) {
                        horizontalDegrees =
                            horizontalDegreesAmt *
                            ((this.cesium.Math.toDegrees(viewRect.east) -
                                (-180 - (180 - this.cesium.Math.toDegrees(viewRect.west)) * 2)) /
                                360.0);
                    }
                    newPosition.longitude =
                        newPosition.longitude - this.cesium.Math.toRadians(horizontalDegrees);
                    break;
                case appStrings.MAP_PAN_DIRECTION_RIGHT:
                    if (viewRect.east < viewRect.west) {
                        horizontalDegrees =
                            horizontalDegreesAmt *
                            ((180 +
                                (this.cesium.Math.toDegrees(viewRect.east) + 180) * 2 -
                                this.cesium.Math.toDegrees(viewRect.west)) /
                                360.0);
                    }
                    newPosition.longitude =
                        newPosition.longitude + this.cesium.Math.toRadians(horizontalDegrees);
                    break;
                default:
                    return false;
            }

            this.map.scene.camera.flyTo({
                destination: this.map.scene.globe.ellipsoid.cartographicToCartesian(newPosition),
                easingFunction: this.cesium.EasingFunction.LINEAR_NONE,
                duration: 0.175
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.panMap:", err);
            return false;
        }
    }

    /**
     * zoom the map in by half of the current zoom level
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    zoomIn() {
        try {
            let currPosition = this.map.scene.camera.positionCartographic;
            let newH = Math.max(
                currPosition.height - currPosition.height / 2,
                appConfig.MIN_ZOOM_DISTANCE_3D
            );
            let newPosition = currPosition.clone();
            newPosition.height = newH;
            newPosition = this.map.scene.globe.ellipsoid.cartographicToCartesian(newPosition);
            this.map.scene.camera.flyTo({
                destination: newPosition,
                duration: 0.175
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.zoomIn:", err);
            return false;
        }
    }

    /**
     * zoom out by doubling the current zoom height
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    zoomOut() {
        try {
            let currPosition = this.map.scene.camera.positionCartographic;
            let newH = Math.min(
                currPosition.height + currPosition.height,
                appConfig.MAX_ZOOM_DISTANCE_3D
            );
            let newPosition = currPosition.clone();
            newPosition.height = newH;
            newPosition = this.map.scene.globe.ellipsoid.cartographicToCartesian(newPosition);
            this.map.scene.camera.flyTo({
                destination: newPosition,
                duration: 0.175
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.zoomOut:", err);
            return false;
        }
    }

    /**
     * reset the orientation of the map view to North up, non-tilted view
     *
     * @param {number} duration time (in ms) of the transition
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    resetOrientation(duration) {
        try {
            this.map.camera.flyTo({
                destination: this.map.camera.positionWC,
                orientation: {},
                duration: typeof duration === "number" ? duration : 1
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.resetOrientation:", err);
            return false;
        }
    }

    /**
     * add a handler to the map for a given type of drawing
     *
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @param {function} onDrawEnd callback for when the drawing completes
     * @param {string} interactionType (Draw|Measure)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    addDrawHandler(geometryType, onDrawEnd, interactionType) {
        try {
            if (geometryType === appStrings.GEOMETRY_CIRCLE) {
                this.drawHandler._customInteractions[
                    "_id" + interactionType + appStrings.GEOMETRY_CIRCLE
                ] = () => {
                    this.drawHandler.startDrawingCircle({
                        callback: (center, radius) => {
                            // Add geometry to cesium map since it's not done automatically
                            let id = Math.random();
                            this.addGeometry(
                                {
                                    proj: appStrings.PROJECTIONS.latlon.code,
                                    type: geometryType,
                                    center: center,
                                    radius: radius,
                                    coordinateType: appStrings.COORDINATE_TYPE_CARTESIAN,
                                    id: id
                                },
                                interactionType
                            );
                            if (typeof onDrawEnd === "function") {
                                // Recover geometry from event in cartographic
                                let cartographicCenter = this.cartesianToLatLon(center);
                                let geometry = {
                                    type: appStrings.GEOMETRY_CIRCLE,
                                    center: cartographicCenter,
                                    id: id,
                                    proj: appStrings.PROJECTIONS.latlon.code,
                                    radius: radius,
                                    coordinateType: appStrings.COORDINATE_TYPE_CARTOGRAPHIC
                                };
                                onDrawEnd(geometry);
                            }
                        }
                    });
                };
                return true;
            } else if (geometryType === appStrings.GEOMETRY_LINE_STRING) {
                this.drawHandler._customInteractions[
                    "_id" + interactionType + appStrings.GEOMETRY_LINE_STRING
                ] = () => {
                    this.drawHandler.startDrawingPolyline({
                        callback: coordinates => {
                            // Add geometry to cesium map since it's not done automatically
                            let id = Math.random();
                            this.addGeometry(
                                {
                                    proj: appStrings.PROJECTIONS.latlon.code,
                                    type: geometryType,
                                    coordinates: coordinates,
                                    coordinateType: appStrings.COORDINATE_TYPE_CARTESIAN,
                                    id: id
                                },
                                interactionType
                            );
                            if (typeof onDrawEnd === "function") {
                                // Recover geometry from event in cartographic
                                let cartographicCoordinates = coordinates.map(pos => {
                                    return this.cartesianToLatLon(pos);
                                });
                                let geometry = {
                                    type: appStrings.GEOMETRY_LINE_STRING,
                                    id: id,
                                    proj: appStrings.PROJECTIONS.latlon.code,
                                    coordinates: cartographicCoordinates,
                                    coordinateType: appStrings.COORDINATE_TYPE_CARTOGRAPHIC
                                };
                                onDrawEnd(geometry);
                            }
                        }
                    });
                };
                return true;
            } else if (geometryType === appStrings.GEOMETRY_POLYGON) {
                this.drawHandler._customInteractions[
                    "_id" + interactionType + appStrings.GEOMETRY_POLYGON
                ] = () => {
                    this.drawHandler.startDrawingPolygon({
                        callback: coordinates => {
                            // Add geometry to cesium map since it's not done automatically
                            let id = Math.random();
                            this.addGeometry(
                                {
                                    proj: appStrings.PROJECTIONS.latlon.code,
                                    type: geometryType,
                                    coordinates: coordinates,
                                    coordinateType: appStrings.COORDINATE_TYPE_CARTESIAN,
                                    id: id
                                },
                                interactionType
                            );
                            if (typeof onDrawEnd === "function") {
                                // Recover geometry from event in cartographic
                                let cartographicCoordinates = coordinates.map(pos => {
                                    return this.cartesianToLatLon(pos);
                                });
                                let geometry = {
                                    type: appStrings.GEOMETRY_POLYGON,
                                    coordinates: cartographicCoordinates,
                                    id: id,
                                    proj: appStrings.PROJECTIONS.latlon.code,
                                    coordinateType: appStrings.COORDINATE_TYPE_CARTOGRAPHIC
                                };
                                onDrawEnd(geometry);
                            }
                        }
                    });
                };
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.addDrawHandler:", err);
            return false;
        }
    }

    /**
     * enable the draw interaction for a type of geometry
     *
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @returns true if enabling the interaction succeeds
     * @memberof MapWrapper_cesium
     */
    enableDrawing(geometryType) {
        try {
            // Enable drawing for geometryType
            let interaction = this.drawHandler._customInteractions[
                "_id" + appStrings.INTERACTION_DRAW + geometryType
            ];
            if (interaction) {
                interaction();
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.enableDrawing:", err);
            return false;
        }
    }

    /**
     * turn off current drawing interaction
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    disableDrawing() {
        try {
            this.drawHandler.stopDrawing();
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.disableDrawing:", err);
            return false;
        }
    }

    /**
     * enable the measure interaction for a type of geometry
     *
     * @param {string} geometryType (Circle|LineString|Polygon)
     * @param {string} measurementType (Distance|Area)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    enableMeasuring(geometryType, measurementType) {
        try {
            // Enable drawing for geometryType
            let interaction = this.drawHandler._customInteractions[
                "_id" + appStrings.INTERACTION_MEASURE + geometryType
            ];
            if (interaction) {
                interaction();
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.enableMeasuring:", err);
            return false;
        }
    }

    /**
     * turn off the current measuring interaction
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    disableMeasuring() {
        try {
            this.drawHandler.stopDrawing();
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.disableMeasuring:", err);
            return false;
        }
    }

    /**
     * enable or disable all draw interactions
     *
     * @param {boolean} active true if draw interactions should be enabled
     * @returns true if a draw handler is present
     * @memberof MapWrapper_cesium
     */
    enableActiveListeners(active) {
        if (this.drawHandler) {
            this.drawHandler._isActive = active;
            return true;
        }
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
     * @memberof MapWrapper_cesium
     */
    addGeometry(geometry, interactionType, geodesic = false) {
        try {
            if (geometry.type === appStrings.GEOMETRY_CIRCLE) {
                let cesiumCenter = null;
                let cesiumRadius = null;
                // Check coordinate type
                if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTOGRAPHIC) {
                    // Calc radius by finding cartesian distance from
                    // center to radius point
                    let point = {
                        lat: geometry.center.lat,
                        lon: geometry.center.lon
                    };
                    point.lon += geometry.radius;

                    let cesiumPoint = this.latLonToCartesian(point.lat, point.lon);
                    cesiumCenter = this.latLonToCartesian(geometry.center.lat, geometry.center.lon);
                    // cesiumRadius = this.cesium.Cartesian3.distance(cesiumCenter, cesiumPoint);
                    cesiumRadius = this.mapUtil.calculatePolylineDistance(
                        [[geometry.center.lon, geometry.center.lat], [point.lon, point.lat]],
                        geometry.proj
                    );
                } else {
                    cesiumCenter = geometry.center;
                    cesiumRadius = geometry.radius;
                }
                let material = this.cesium.Material.fromType(this.cesium.Material.RimLightingType);
                material.uniforms.color = new this.cesium.Color.fromCssColorString(
                    appConfig.GEOMETRY_FILL_COLOR
                );
                material.uniforms.rimColor = new this.cesium.Color(1.0, 1.0, 1.0, 1.0);
                let primitiveToAdd = new this.drawHelper.CirclePrimitive({
                    center: cesiumCenter,
                    radius: cesiumRadius,
                    material: material,
                    showDrawingOutline: true
                });
                this.map.scene.primitives.add(primitiveToAdd);
                primitiveToAdd._interactionType = interactionType;
                primitiveToAdd.setStrokeStyle(
                    new this.cesium.Color.fromCssColorString(appConfig.GEOMETRY_STROKE_COLOR),
                    appConfig.GEOMETRY_STROKE_WEIGHT
                );
                return true;
            } else if (geometry.type === appStrings.GEOMETRY_LINE_STRING) {
                let cartesianCoords = null;
                // Check coordinate type
                if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTOGRAPHIC) {
                    // Transform coordinates from cartographic to cartesian
                    cartesianCoords = geometry.coordinates.map(x => {
                        return this.latLonToCartesian(x.lat, x.lon);
                    });
                } else if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTESIAN) {
                    cartesianCoords = geometry.coordinates;
                } else {
                    console.warn(
                        "Unhandled coordinate type when trying to draw cesium line string:",
                        geometry.type
                    );
                    return false;
                }
                let material = this.cesium.Material.fromType(this.cesium.Material.ColorType);
                material.uniforms.color = new this.cesium.Color.fromCssColorString(
                    appConfig.GEOMETRY_STROKE_COLOR
                );
                let primitiveToAdd = new this.drawHelper.PolylinePrimitive({
                    positions: cartesianCoords,
                    // width: appConfig.GEOMETRY_STROKE_WEIGHT,
                    width: 1.0, // match the other shapes
                    material: material,
                    showDrawingOutline: true,
                    geodesic: true
                });
                primitiveToAdd._interactionType = interactionType;
                this.map.scene.primitives.add(primitiveToAdd);
                return true;
            } else if (geometry.type === appStrings.GEOMETRY_POLYGON) {
                let cartesianCoords = null;
                // Check coordinate type
                if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTOGRAPHIC) {
                    // Transform coordinates from cartographic to cartesian
                    cartesianCoords = geometry.coordinates.map(x => {
                        return this.latLonToCartesian(x.lat, x.lon);
                    });
                } else if (geometry.coordinateType === appStrings.COORDINATE_TYPE_CARTESIAN) {
                    cartesianCoords = geometry.coordinates;
                } else {
                    console.warn(
                        "Unhandled coordinate type when trying to draw cesium polygon string:",
                        geometry.type
                    );
                    return false;
                }
                let material = this.cesium.Material.fromType(this.cesium.Material.RimLightingType);
                material.uniforms.color = new this.cesium.Color.fromCssColorString(
                    appConfig.GEOMETRY_FILL_COLOR
                );
                material.uniforms.rimColor = new this.cesium.Color.fromCssColorString(
                    appConfig.GEOMETRY_FILL_COLOR
                );
                let primitiveToAdd = new this.drawHelper.PolygonPrimitive({
                    positions: cartesianCoords,
                    material: material,
                    showDrawingOutline: true
                });
                this.map.scene.primitives.add(primitiveToAdd);
                primitiveToAdd._interactionType = interactionType;
                primitiveToAdd.setStrokeStyle(
                    new this.cesium.Color.fromCssColorString(appConfig.GEOMETRY_STROKE_COLOR),
                    appConfig.GEOMETRY_STROKE_WEIGHT
                );
                return true;
            }
            console.warn("add geometry not complete in cesium", geometry, " is unsupported");
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.addGeometry:", err);
            return false;
        }
    }

    /**
     * add a label to the map
     *
     * @param {string} label the content of the label
     * @param {array} coords location of the label on the map [lon,lat]
     * @param {object} [opt_meta={}] additional data to attach to the label object (optional)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    addLabel(label, coords, opt_meta = {}) {
        try {
            coords = this.cesium.Cartesian3.fromDegrees(coords[0], coords[1]);
            let result = this.createOverlayImage(label);
            let overlay = result[0];
            let canvas = result[1];

            //Need to wait for image to load before proceeding to draw
            overlay.onload = () => {
                // label options
                let labelOptions = {
                    id: Math.random(),
                    position: coords,
                    billboard: {
                        image: canvas
                    }
                };

                // store meta options
                for (let key in opt_meta) {
                    if (opt_meta.hasOwnProperty(key)) {
                        labelOptions[key] = opt_meta[key];
                    }
                }

                // place the label
                canvas.getContext("2d").drawImage(overlay, 0, 0);
                this.map.entities.add(labelOptions);
            };
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.addLabel:", err);
            return false;
        }
    }

    /**
     * create an overlay image for text on the map
     *
     * @param {string} text content of the overlay display
     * @returns {array} display nodes [image, canvas]
     * @memberof MapWrapper_cesium
     */
    createOverlayImage(text) {
        let canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 85;
        let tooltipStyles =
            "-webkit-font-smoothing: auto; padding-top:60px; top: -60px; text-align:center; position:relative; display:block; text-rendering: optimizeLegibility; font-family:'Roboto Mono, sans-serif'; font-size:14px; white-space: nowrap; color:black; letter-spacing:1px";
        let tooltipContentStyles =
            "-webkit-font-smoothing: auto; font-family:Roboto Mono, Helvetica Neue, Helvetica !important; font-weight:400; !important; top: 0px; position:relative; display: inline-block; background: white; border-radius: 2px;padding: 5px 9px;";
        let tooltipAfterStyles =
            "border-top: 8px solid #eeeeee;border-right: 8px solid transparent;border-left: 8px solid transparent;content: '';position: absolute;bottom: -8px;margin-left: -9px;left: 50%;";

        let svgString =
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="85">' +
            '<foreignObject width="100%" height="100%">' +
            '<div xmlns="http://www.w3.org/1999/xhtml">' +
            '<div style="transform:scale(1);' +
            tooltipStyles +
            '">' +
            '<span style="' +
            tooltipContentStyles +
            '">' +
            text +
            "</span>" +
            '<span style="' +
            tooltipAfterStyles +
            '"></span>' +
            "</div>" +
            "</div>" +
            "</foreignObject>" +
            "</svg>";

        let image = new Image();
        image.src = "data:image/svg+xml;base64," + window.btoa(svgString);
        return [image, canvas];
    }

    /**
     * remove all drawing geometries from the map
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    removeAllDrawings() {
        try {
            // Find primitives to remove
            let primitivesToRemove = this.map.scene.primitives._primitives.filter(
                x => x._interactionType === appStrings.INTERACTION_DRAW
            );
            for (let i = 0; i < primitivesToRemove.length; i++) {
                this.map.scene.primitives.remove(primitivesToRemove[i]);
            }
            return (
                this.map.scene.primitives._primitives.filter(
                    x => x._interactionType === appStrings.INTERACTION_DRAW
                ).length === 0
            );
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.removeAllDrawings:", err);
            return false;
        }
    }

    /**
     * remove all measurement geometries from the map
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    removeAllMeasurements() {
        try {
            // Find primitives to remove
            let primitivesToRemove = this.map.scene.primitives._primitives.filter(
                x => x._interactionType === appStrings.INTERACTION_MEASURE
            );
            for (let i = 0; i < primitivesToRemove.length; i++) {
                this.map.scene.primitives.remove(primitivesToRemove[i]);
            }
            // Remove all entities
            this.map.entities.removeAll();
            return (
                this.map.scene.primitives._primitives.filter(
                    x => x._interactionType === appStrings.INTERACTION_MEASURE
                ).length === 0
            );
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.removeAllMeasurements:", err);
            return false;
        }
    }

    /**
     * add a listener to the map for a given interaction
     *
     * @param {string} eventStr event type to listen for (mousemove|moveend|click)
     * @param {function} callback function to call when the event is fired
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    addEventListener(eventStr, callback) {
        try {
            switch (eventStr) {
                case appStrings.EVENT_MOVE_END:
                    this.map.camera.moveEnd.addEventListener(callback);
                    return true;
                case appStrings.EVENT_MOUSE_HOVER:
                    new this.cesium.ScreenSpaceEventHandler(this.map.scene.canvas).setInputAction(
                        movement => {
                            callback([movement.endPosition.x, movement.endPosition.y]);
                        },
                        this.cesium.ScreenSpaceEventType.MOUSE_MOVE
                    );
                    return true;
                case appStrings.EVENT_MOUSE_CLICK:
                    new this.cesium.ScreenSpaceEventHandler(this.map.scene.canvas).setInputAction(
                        movement => {
                            callback({
                                pixel: [movement.position.x, movement.position.y]
                            });
                        },
                        this.cesium.ScreenSpaceEventType.LEFT_CLICK
                    );
                    return true;
                default:
                    return true;
            }
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.addEventListener:", err);
            return false;
        }
    }

    /**
     * set the opacity of a layer on the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {number} opacity value of the opacity [0.0 - 1.0]
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    setLayerOpacity(layer, opacity) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer && typeof mapLayer.alpha !== "undefined") {
                mapLayer.alpha = opacity;
                return true;
            } else if (
                mapLayer._layerHandleAs === appStrings.LAYER_VECTOR_GEOJSON ||
                mapLayer._layerHandleAs === appStrings.LAYER_VECTOR_TOPOJSON ||
                mapLayer._layerHandleAs === appStrings.LAYER_VECTOR_KML
            ) {
                mapLayer.entities._entities._array.map(entity => {
                    if (entity.polygon) {
                        if (entity.polygon.outlineColor) {
                            let c = entity.polygon.outlineColor.getValue();
                            c.alpha = opacity * 1.0;
                            entity.polygon.outlineColor.setValue(c);
                        }
                        if (entity.polygon.fill) {
                            let c = entity.polygon.fill.getValue();
                            c.alpha = opacity * 0.5;
                            entity.polygon.fill.setValue(c);
                        }
                        if (entity.polygon.material) {
                            if (entity.polygon.material.color) {
                                let c = entity.polygon.material.color.getValue();
                                c.alpha = opacity * 0.5;
                                entity.polygon.material.color.setValue(c);
                            }
                        }
                    }
                    if (entity.polyline) {
                        let c = entity.polyline.material.color.getValue();
                        c.alpha = opacity * 1.0;
                        entity.polyline.material.color.setValue(c);
                    }
                    if (entity.billboard) {
                        entity.billboard.color = new this.cesium.Color(
                            1.0,
                            1.0,
                            1.0,
                            opacity * 1.0
                        );
                    }
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.setLayerOpacity:", err);
            return false;
        }
    }

    /**
     * adjust the display of all measurement overlays currently on the map
     * to display in the specified units
     *
     * @param {string} units (metric|imperial|nautical|schoolbus)
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    setScaleUnits(units) {
        try {
            // Set measurement units
            let newOutputText = "";
            this.map.entities.values.forEach(entity => {
                if (entity.measurementType === appStrings.MEASURE_AREA) {
                    newOutputText = this.mapUtil.formatArea(
                        this.mapUtil.convertAreaUnits(entity.meters, units),
                        units
                    );
                } else if (entity.measurementType === appStrings.MEASURE_DISTANCE) {
                    newOutputText = this.mapUtil.formatDistance(
                        this.mapUtil.convertDistanceUnits(entity.meters, units),
                        units
                    );
                } else {
                    console.warn("could not set cesium scale units.");
                    return false;
                }
                // Create new image
                let result = this.createOverlayImage(newOutputText);
                let overlay = result[0];
                let canvas = result[1];

                //Need to wait for image to load before proceeding to draw
                overlay.onload = () => {
                    canvas.getContext("2d").drawImage(overlay, 0, 0);
                    // Set image of overlay
                    entity.billboard.image = overlay;
                };
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.setScaleUnits:", err);
            return false;
        }
    }

    /**
     * add a layer to the map
     *
     * @param {object} mapLayer cesium layer object
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    addLayer(mapLayer) {
        try {
            let mapLayers = this.getMapLayers(mapLayer._layerHandleAs);
            let index = this.findTopInsertIndexForLayer(mapLayers, mapLayer);
            mapLayers.add(mapLayer, index);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.addLayer:", err);
            return false;
        }
    }

    /**
     * remove a layer from the map
     *
     * @param {object} mapLayer cesium layer object
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    removeLayer(mapLayer) {
        try {
            let mapLayers = this.getMapLayers(mapLayer._layerHandleAs);
            mapLayers.remove(mapLayer);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.removeLayer:", err);
            return false;
        }
    }

    /**
     * activate a layer on the map. This will create a new
     * cesium layer object and add it to the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
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
            if (!mapLayer) {
                return false;
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

    /**
     * Remove a layer from the map. This will find the
     * cesium layer corresponding the specified layer and
     * remove it from the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds or if layer is not active
     * @memberof MapWrapper_cesium
     */
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

    /**
     * set a layer active/inactive on the map
     *
     * @param {obejct} layer layer from map state in redux
     * @param {boolean} [active=true] true if the layer should be added to the map
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    setLayerActive(layer, active = true) {
        if (active) {
            return this.activateLayer(layer);
        } else {
            return this.deactivateLayer(layer);
        }
    }

    /**
     * update a layer on the map. This creates a new layer
     * and replaces the layer with a matching id
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    updateLayer(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                let updatedMapLayer = this.createLayer(layer);
                let index = mapLayers.indexOf(mapLayer);
                mapLayers.remove(mapLayer);
                mapLayers.add(updatedMapLayer, index);
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.updateLayer:", err);
            return false;
        }
    }

    /**
     * Set the basemap layer on the map.
     * The basemap is fixed as the bottom layer on the map
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    setBasemap(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let newBasemap = this.createLayer(layer);
            newBasemap.show = true;
            if (newBasemap) {
                // remove the current basemap
                let currBasemap = mapLayers.get(0);
                if (
                    typeof currBasemap !== "undefined" &&
                    currBasemap._layerType === appStrings.LAYER_GROUP_TYPE_BASEMAP
                ) {
                    mapLayers.remove(currBasemap);
                }
                mapLayers.add(newBasemap, 0);
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.setBasemap:", err);
            return false;
        }
    }

    /**
     * Hide the display of the basemap. This does not
     * remove the basemap layer but makes it invisble.
     *
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    hideBasemap() {
        try {
            let mapLayers = this.getMapLayers();
            let currBasemap = mapLayers.get(0);
            if (typeof currBasemap !== "undefined") {
                currBasemap.show = false;
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.hideBasemap:", err);
            return false;
        }
    }

    /**
     * create a cesium layer corresponding to the
     * given layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {object|boolean} cesium layer object or false if it fails
     * @memberof MapWrapper_cesium
     */
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
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.createVectorLayer(layer);
            case appStrings.LAYER_VECTOR_KML:
                return this.createVectorLayer(layer);
            default:
                console.warn(
                    "Error in MapWrapper_cesium.createLayer: unknown layer type - " +
                        layer.get("handleAs")
                );
                return false;
        }
    }

    /**
     * create a wmts cesium layer corresponding
     * to the given layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {object|boolean} cesium layer object or false if it fails
     * @memberof MapWrapper_cesium
     */
    createWMTSLayer(layer) {
        try {
            let _context = this;
            let options = layer.get("wmtsOptions").toJS();
            let imageryProvider = this.createImageryProvider(layer, options);
            if (imageryProvider) {
                let mapLayer = new this.cesium.ImageryLayer(imageryProvider, {
                    alpha: layer.get("opacity"),
                    show: layer.get("isActive")
                });
                mapLayer._layerId = layer.get("id");
                mapLayer._layerType = layer.get("type");
                mapLayer._layerHandleAs = layer.get("handleAs");
                mapLayer._layerTime = moment(this.mapDate).format(layer.get("timeFormat"));

                // override the tile loading for this layer
                let origTileLoadFunc = mapLayer.imageryProvider.requestImage;
                mapLayer.imageryProvider._origTileLoadFunc = origTileLoadFunc;
                mapLayer.imageryProvider.requestImage = function(x, y, level, request) {
                    return _context.handleTileLoad(layer, mapLayer, x, y, level, request, this);
                };

                return mapLayer;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.createWMTSLayer:", err);
            return false;
        }
    }

    /**
     * create a vector cesium layer corresponding
     * to the given layer
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {object|boolean} cesium layer object or false if it fails
     * @memberof MapWrapper_cesium
     */
    createVectorLayer(layer) {
        try {
            let options = { url: layer.get("url") };
            let layerSource = this.createVectorSource(layer, options);
            if (layerSource) {
                // layer source is a promise that acts as a stand-in while the data loads
                layerSource.then(mapLayer => {
                    mapLayer._layerId = layer.get("id");
                    mapLayer._layerType = layer.get("type");
                    mapLayer._layerHandleAs = layer.get("handleAs");
                    mapLayer._layerTime = moment(this.mapDate).format(layer.get("timeFormat"));
                    setTimeout(() => {
                        this.setLayerOpacity(layer, layer.get("opacity"));
                    }, 0);
                });

                // need to add custom metadata while data loads
                layerSource._layerId = layer.get("id");
                layerSource._layerType = layer.get("type");
                layerSource._layerHandleAs = layer.get("handleAs");
                layerSource._layerTime = moment(this.mapDate).format(layer.get("timeFormat"));

                return layerSource;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.createVectorLayer:", err);
        }
    }

    /**
     * get the lat-lon corresponding to a given pixel position
     * within the containing domnode
     *
     * @param {array} pixel location on the container [x,y]
     * @returns {object|boolean} object of position of false if it fails
     * - lat - {number} latitude of the pixel location
     * - lon - {number} longitude of the pixel location
     * - isValid - {boolean} pixel was on the globe
     * @memberof MapWrapper_cesium
     */
    getLatLonFromPixelCoordinate(pixel) {
        try {
            let cartesian = this.map.scene.camera.pickEllipsoid(
                { x: pixel[0], y: pixel[1] },
                this.map.scene.globe.ellipsoid
            );
            if (cartesian) {
                let cartographic = this.map.scene.globe.ellipsoid.cartesianToCartographic(
                    cartesian
                );
                // Switching to lat/lon lines definition as opposed to distance in lat/lon direction
                return {
                    lat: this.cesium.Math.toDegrees(cartographic.longitude),
                    lon: this.cesium.Math.toDegrees(cartographic.latitude),
                    isValid: true
                };
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.getLatLonFromPixelCoordinate:", err);
            return false;
        }
    }

    /**
     * move a layer to the top of the map display stack
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    moveLayerToTop(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                let currIndex = mapLayers.indexOf(mapLayer);
                let index = this.findTopInsertIndexForLayer(mapLayers, mapLayer);
                while (++currIndex < index) {
                    // use raise so that we aren't re-requesting tiles every time
                    mapLayers.raise(mapLayer);
                }
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.moveLayerToTop:", err);
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
     * @memberof MapWrapper_cesium
     */
    moveLayerToBottom(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                mapLayers.lowerToBottom(mapLayer);
                mapLayers.raise(mapLayer); // move to index 1 because we always have a basemap. TODO - verify
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.moveLayerToBottom:", err);
            return false;
        }
    }

    /**
     * move a layer up in the display stack
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {boolean} true if it succeeds
     * @memberof MapWrapper_cesium
     */
    moveLayerUp(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                let currIndex = mapLayers.indexOf(mapLayer);
                let index = this.findTopInsertIndexForLayer(mapLayers, mapLayer);
                if (++currIndex < index) {
                    mapLayers.raise(mapLayer);
                }
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.moveLayerUp:", err);
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
     * @memberof MapWrapper_cesium
     */
    moveLayerDown(layer) {
        try {
            let mapLayers = this.getMapLayers(layer.get("handleAs"));
            let mapLayer = this.findLayerInMapLayers(mapLayers, layer);
            if (mapLayer) {
                let index = mapLayers.indexOf(mapLayer);
                if (index > 1) {
                    mapLayers.lower(mapLayer);
                }
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.moveLayerDown:", err);
            return false;
        }
    }

    /**
     * retrieve the corresponding viewport pixel from a cesium
     * click event
     *
     * @param {object} clickEvt cesium click event wrapper
     * @returns {array} pixel coordinates
     * @memberof MapWrapper_cesium
     */
    getPixelFromClickEvent(clickEvt) {
        try {
            return clickEvt.pixel;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.getPixelFromClickEvent:", err);
            return false;
        }
    }

    /* methods for Cesium only */

    /**
     * convert cartesian coordinates to lat-lon coordiantes
     *
     * @param {object} point cartesian point {x,y,z}
     * @returns {object} lat-lon point {lat,lon}
     * @memberof MapWrapper_cesium
     */
    cartesianToLatLon(point) {
        let cartographicRadians = this.cesium.Ellipsoid.WGS84.cartesianToCartographic(point);
        return {
            lat: this.cesium.Math.toDegrees(cartographicRadians.latitude),
            lon: this.cesium.Math.toDegrees(cartographicRadians.longitude)
        };
    }

    /**
     * convert lat-lon coordinates to cartesian coordinates
     *
     * @param {number} lat latitude value
     * @param {number} lon longitude value
     * @returns {object} cartesian point {x,y,z}
     * @memberof MapWrapper_cesium
     */
    latLonToCartesian(lat, lon) {
        return new this.cesium.Cartesian3.fromDegrees(lon, lat);
    }

    /**
     * create an imagery provider for a cesium raster layer
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
     *
     * @returns {object} cesium imagery provider
     * @memberof MapWrapper_cesium
     */
    createImageryProvider(layer, options) {
        switch (layer.get("handleAs")) {
            case appStrings.LAYER_GIBS_RASTER:
                return this.createGIBSWMTSProvider(layer, options);
            case appStrings.LAYER_WMTS_RASTER:
                return this.createGenericWMTSProvider(layer, options);
            case appStrings.LAYER_XYZ_RASTER:
                return this.createGenericXYZProvider(layer, options);
            default:
                console.warn(
                    "Error in MapWrapper_cesium.createImageryProvider: unknown layer type - " +
                        layer.get("handleAs")
                );
                return false;
        }
    }

    /**
     * Create a cesium tiling scheme for a tiled raster layer
     *
     * @param {object} options specifications for the tiling scheme
     * - projection - {string} mapping projection of the tiling scheme
     * - handleAs - {string} type of raster layer (GIBS_raster|wmts_raster|xyz_raster)
     * @param {object} tileSchemeOptions additional wmts options
     * @returns {object} cesium tiling scheme
     * @memberof MapWrapper_cesium
     */
    createTilingScheme(options, tileSchemeOptions) {
        if (options.projection === appStrings.PROJECTIONS.latlon.code) {
            if (options.handleAs === appStrings.LAYER_GIBS_RASTER) {
                return new CesiumTilingScheme_GIBS(
                    { numberOfLevelZeroTilesX: 2, numberOfLevelZeroTilesY: 1 },
                    tileSchemeOptions
                );
            }
            return new this.cesium.GeographicTilingScheme();
        } else if (options.projection === appStrings.PROJECTIONS.webmercator.code) {
            return new this.cesium.WebMercatorTilingScheme();
        }
        return false;
    }

    /**
     * create GIBS specific wmts imagery provider
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options wmts layer options
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
     * @returns {object} cesium imagery provider
     * @memberof MapWrapper_cesium
     */
    createGIBSWMTSProvider(layer, options) {
        try {
            if (typeof options !== "undefined") {
                let west = this.cesium.Math.toRadians(-180);
                let south = this.cesium.Math.toRadians(-90);
                let east = this.cesium.Math.toRadians(180);
                let north = this.cesium.Math.toRadians(90);
                return new this.cesium.WebMapTileServiceImageryProvider({
                    url: options.url,
                    layer: options.layer,
                    format: options.format,
                    style: "",
                    tileMatrixSetID: options.matrixSet,
                    tileWidth: options.tileGrid.tileSize,
                    tileHeight: options.tileGrid.tileSize,
                    minimumLevel: options.tileGrid.minZoom,
                    maximumLevel: options.tileGrid.maxZoom,
                    tilingScheme: this.createTilingScheme(
                        {
                            handleAs: layer.get("handleAs"),
                            projection: options.projection
                        },
                        options
                    )
                });
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.createGIBSWMTSProvider:", err);
            return false;
        }
    }

    /**
     * create wmts imagery provider
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options wmts layer options
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
     * @returns {object} cesium imagery provider
     * @memberof MapWrapper_cesium
     */
    createGenericWMTSProvider(layer, options) {
        try {
            if (typeof options !== "undefined") {
                let west = this.cesium.Math.toRadians(-180);
                let south = this.cesium.Math.toRadians(-90);
                let east = this.cesium.Math.toRadians(180);
                let north = this.cesium.Math.toRadians(90);
                return new this.cesium.WebMapTileServiceImageryProvider({
                    url: options.url,
                    layer: options.layer,
                    format: options.format,
                    style: "",
                    tileMatrixSetID: options.matrixSet,
                    minimumLevel: options.tileGrid.minZoom,
                    maximumLevel: options.tileGrid.maxZoom,
                    tilingScheme: this.createTilingScheme(
                        {
                            handleAs: layer.get("handleAs"),
                            projection: options.projection
                        },
                        options
                    )
                });
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.createGenericWMTSProvider:", err);
            return false;
        }
    }

    /**
     * create xyz tiled imagery provider
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options xyz tiling options
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
     * @returns {object} cesium imagery provider
     * @memberof MapWrapper_cesium
     */
    createGenericXYZProvider(layer, options) {
        try {
            if (typeof options !== "undefined") {
                let west = this.cesium.Math.toRadians(-180);
                let south = this.cesium.Math.toRadians(-90);
                let east = this.cesium.Math.toRadians(180);
                let north = this.cesium.Math.toRadians(90);
                return new this.cesium.UrlTemplateImageryProvider({
                    url: options.url,
                    minimumLevel: options.tileGrid.minZoom,
                    maximumLevel: options.tileGrid.maxZoom,
                    tileWidth: options.tileGrid.tileSize,
                    tileHeight: options.tileGrid.tileSize,
                    tilingScheme: this.createTilingScheme(
                        {
                            handleAs: layer.get("handleAs"),
                            projection: options.projection
                        },
                        options
                    )
                });
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_cesium.createGenericXYZProvider:", err);
            return false;
        }
    }

    /**
     * create a cesium vector data source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options vector data source options
     * - url - {string} url for the data
     * @returns {object} a cesium vector data source
     * @memberof MapWrapper_cesium
     */
    createVectorSource(layer, options) {
        switch (layer.get("handleAs")) {
            case appStrings.LAYER_VECTOR_GEOJSON:
                return this.createGeoJsonSource(layer, options);
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.createGeoJsonSource(layer, options);
            case appStrings.LAYER_VECTOR_KML:
                return this.createKmlSource(layer, options);
            default:
                return false;
        }
    }

    /**
     * create a geojson vector data source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options vector data source options
     * - url - {string} url for the data
     * @returns {object} a cesium vector data source
     * @memberof MapWrapper_cesium
     */
    createGeoJsonSource(layer, options) {
        return this.cesium.GeoJsonDataSource.load(options.url, {
            stroke: this.cesium.Color.fromCssColorString("#1E90FF"),
            fill: this.cesium.Color.fromCssColorString("#FEFEFE").withAlpha(0.5),
            strokeWidth: 3,
            show: layer.get("isActive")
        });
    }

    /**
     * create a kml vector data source
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} options vector data source options
     * - url - {string} url for the data
     * @returns {object} a cesium vector data source
     * @memberof MapWrapper_cesium
     */
    createKmlSource(layer, options) {
        return this.cesium.KmlDataSource.load(options.url, {
            camera: this.map.scene.camera,
            canvas: this.map.scene.canvas,
            show: layer.get("isActive")
        });
    }

    /**
     * Handle loading a tile for a tile raster layer
     * This is used to override url creation and
     * data loading for raster layers.
     *
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @param {object} mapLayer cesium layer object
     * @param {number} x x grid value
     * @param {number} y y grid value
     * @param {number} level z grid value
     * @param {object} request cesium request object
     * @param {object} context wrapper context for this call
     * @returns {Promise} for tile request
     * @memberof MapWrapper_cesium
     */
    handleTileLoad(layer, mapLayer, x, y, level, request, context) {
        let url = layer.getIn(["wmtsOptions", "url"]);
        let customUrlFunction = this.tileHandler.getUrlFunction(
            layer.getIn(["wmtsOptions", "urlFunctions", appStrings.MAP_LIB_3D])
        );
        let customTileFunction = this.tileHandler.getTileFunction(
            layer.getIn(["wmtsOptions", "tileFunctions", appStrings.MAP_LIB_3D])
        );

        // have to override url to override tile load
        if (typeof customTileFunction === "function" && typeof customUrlFunction !== "function") {
            customUrlFunction = this.tileHandler.getUrlFunction(appStrings.DEFAULT_URL_FUNC);
        }

        if (typeof customUrlFunction === "function") {
            let tileFunc = () => {
                // use cesium's promise library
                let deferred = this.cesium.when.defer();
                let resolve = deferred.resolve;
                let reject = deferred.reject;

                // get the customized url
                let tileUrl = customUrlFunction({
                    layer: layer,
                    mapLayer: mapLayer,
                    origUrl: layer.getIn(["wmtsOptions", "url"]),
                    tileCoord: [level, x, y],
                    context: appStrings.MAP_LIB_3D
                });

                // run the customized tile creator
                if (typeof customTileFunction === "function") {
                    customTileFunction({
                        layer: layer,
                        mapLayer: mapLayer,
                        url: tileUrl,
                        tileCoord: [level, x, y],
                        success: resolve,
                        fail: reject
                    });
                } else {
                    // create a standard image and return it
                    let imgTile = new Image();
                    imgTile.onload = () => {
                        resolve(imgTile);
                    };
                    imgTile.onerror = err => {
                        reject(err);
                    };

                    if (this.miscUtil.urlIsCrossorigin(tileUrl)) {
                        imgTile.crossOrigin = "";
                    }
                    imgTile.src = tileUrl;
                }

                return deferred.promise;
            };

            // use Cesium's throttling to play nice with the rest of the system
            let tileRequest = typeof request !== "undefined" ? request : new this.cesium.Request();
            request.url = url;
            request.requestFunction = tileFunc;
            request.throttle = true;
            request.throttleByServer = true;

            return this.cesium.RequestScheduler.request(tileRequest);
        } else {
            return mapLayer.imageryProvider._origTileLoadFunc(x, y, level);
        }
    }

    /**
     * find the cesium map layer corresponding to the
     * map state layer within the provided cesium layer set
     *
     * @param {array} mapLayers list of cesium map layers
     * @param {ImmutableJS.Map} layer layer object from map state in redux
     * @returns {object|boolean} cesium map layer or false if not found
     * @memberof MapWrapper_cesium
     */
    findLayerInMapLayers(mapLayers, layer) {
        let layerId = layer.get("id");
        for (let i = 0; i < mapLayers.length; ++i) {
            let mapLayer = mapLayers.get(i);
            if (mapLayer._layerId === layerId) {
                return mapLayer;
            }
        }
        return false;
    }

    /**
     * Find the highest index for a layer to be displayed.
     * Data layers are displayed below reference layers and
     * above basemaps
     *
     * @param {array} mapLayers list of cesium map layers to search in
     * @param {object} mapLayer cesium map layer to compare
     * @returns {number} highest index within the provided list for a layer of this type
     * @memberof MapWrapper_cesium
     */
    findTopInsertIndexForLayer(mapLayers, mapLayer) {
        let index = mapLayers.length;

        if (mapLayer._layerType === appStrings.LAYER_GROUP_TYPE_REFERENCE) {
            // referece layers always on top
            return index;
        } else if (mapLayer._layerType === appStrings.LAYER_GROUP_TYPE_BASEMAP) {
            // basemaps always on bottom
            return 0;
        } else {
            // data layers in the middle
            for (let i = index - 1; i >= 0; --i) {
                let compareLayer = mapLayers.get(i);
                if (
                    compareLayer._layerType === appStrings.LAYER_GROUP_TYPE_DATA ||
                    compareLayer._layerType === appStrings.LAYER_GROUP_TYPE_BASEMAP
                ) {
                    return i + 1;
                }
            }
        }
        return index;
    }

    /**
     * return the set of layers matching the provided type
     *
     * @param {string} type (GIBS_raster|wmts_raster|xyz_raster|vector_geojson|vector_topojson|vector_kml)
     * @returns {array} list of matching cesium map layers
     * @memberof MapWrapper_cesium
     */
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
            case appStrings.LAYER_VECTOR_TOPOJSON:
                return this.map.dataSources;
            case appStrings.LAYER_VECTOR_KML:
                return this.map.dataSources;
            default:
                return this.map.imageryLayers;
        }
    }
}
