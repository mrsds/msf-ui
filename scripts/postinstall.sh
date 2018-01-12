#!/bin/bash

# Remove and re-add assets folder
rm -rf ./assets && mkdir -p ./assets/assets

# Copy Cesium into lib and assets
mkdir ./assets/assets/cesium
cp -r ./node_modules/cesium/Build/Cesium/* ./assets/assets/cesium/

# Copy Cesium-drawhelper
mkdir -p ./assets/assets/CesiumDrawHelper/img
cp ./src/_core/styles/resources/img/CesiumDrawHelper/*.png ./assets/assets/CesiumDrawHelper/img

# Copy normalize.css
mkdir ./assets/assets/normalize/
cp ./node_modules/normalize.css/normalize.css ./assets/assets/normalize/

# Copy mapskin into assets
cp -r ./lib/mapskin ./assets/assets

# Copy arc into assets
cp -r ./lib/arc ./assets/assets
