/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/*********************/
/*    APP CONTAINER  */
/*********************/

/*
This is the main component container for your
application. It will instantiate all the major
sub-components of the application and perform
any startup operations required.

Create your own:
1. Copy the contents of `src/_core/components/App/AppContainer.js` here
2. Modify as needed with your custom components
3. Modify `src/index.js` to use this AppContainer instead of the _core version
*/

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { AlertsContainer } from "_core/components/Alerts";
import { AnalyticsContainer } from "_core/components/Analytics";
import { LayerInfoContainer_Extended as LayerInfoContainer } from "components/LayerInfo_Extended";
import { LoadingContainerExtended as LoadingContainer } from "components/Loading";
import { MapContextMenu, CoordinateTracker } from "_core/components/Map";
import { MouseFollowerContainer } from "_core/components/MouseFollower";
import { ShareContainer } from "_core/components/Share";
import { appColorPalette } from "styles/appColorPalette";
import AppBarContainer from "components/AppBar/AppBarContainer";
import CookieAcceptContainer from "components/CookieAccept/CookieAcceptContainer";
import FeatureDetailContainer from "components/FeatureDetail/FeatureDetailContainer";
import FeaturePicker from "components/FeaturePicker/FeaturePicker";
import HelpContainerExtended from "components/Help/HelpContainerExtended";
import KeyboardControlsContainerExtended from "components/KeyboardControls/KeyboardControlsContainerExtended";
import LayerMenuContainerExtended from "components/LayerMenu/LayerMenuContainerExtended";
import LayerSidebarContainer from "components/MethaneSidebar/LayerSidebarContainer";
import LocationInputContainer from "components/LocationInput/LocationInputContainer";
import HomeAreaPickerContainer from "components/HomeAreaPicker/HomeAreaPickerContainer";
import MSFAnalyticsContainer from "components/MSFAnalytics/MSFAnalyticsContainer";
import * as MSFTypes from "constants/MSFTypes";
import MapContainerExtended from "components/Map/MapContainerExtended";
import MapControlsContainerExtended from "components/Map/MapControlsContainerExtended";
import MiscUtil from "_core/utils/MiscUtil";
import SettingsContainerExtended from "components/Settings/SettingsContainerExtended";
import TimelineContainer from "components/Timeline/TimelineContainer";
import * as appActions from "_core/actions/appActions";
import * as appStrings from "_core/constants/appStrings";
import displayStyles from "_core/styles/display.scss";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsMSF from "actions/mapActions";
import styles from "components/App/AppContainerStyles.scss";

const theme = createMuiTheme({
    typography: {
        htmlFontSize: 10
    },
    palette: {
        primary: appColorPalette,
        secondary: appColorPalette
    }
});

export class AppContainer extends Component {
    constructor(props) {
        super(props);

        // Setting urlParams as a local variable avoids setting application state before
        // we know if we want to set state via urlParams. If you set urlParams in state,
        // you'd need to set app state to default and then check for urlParams and configure,
        // but that would change the urlParams, wiping out desired urlParams.

        // Generally speaking, however, it is not recommended to rely on instance variables inside of
        // components since they lie outside of the application state and Redux paradigm.
        this.urlParams = MiscUtil.getUrlParams();
    }

    componentDidMount() {
        // disable the right click listener
        document.addEventListener(
            "contextmenu",
            function(e) {
                e.preventDefault();
            },
            false
        );

        // Perform initial browser functionality check
        this.props.checkBrowserFunctionalities();

        // load in initial data
        this.props.loadInitialData(() => {
            // initialize the map. I know this is hacky, but there simply doesn't seem to be a good way to
            // wait for the DOM to complete rendering.
            // see: http://stackoverflow.com/a/34999925
            window.requestAnimationFrame(() => {
                setTimeout(() => {
                    // initialize the maps
                    this.props.initializeMap(appStrings.MAP_LIB_2D, "map2D");
                    // this.props.initializeMap(appStrings.MAP_LIB_3D, "map3D");

                    // set initial view
                    this.props.setInitialHomeArea();

                    // activate default/url params
                    if (this.urlParams.length === 0) {
                        this.props.activateDefaultLayers();
                    } else {
                        this.props.runUrlConfig(this.urlParams);
                    }

                    // signal complete
                    this.props.completeInitialLoad();
                    this.props.updateFeatureList_Map();
                }, 0);
            });
        });
    }

    componentDidUpdate() {
        // If we're displaying the map again after having it hidden, poke OpenLayers to redraw the map in case the window has been resized.
        if (
            this.props.appMode === MSFTypes.APP_MODE_MAP &&
            this.previousAppMode !== MSFTypes.APP_MODE_MAP
        )
            this.props.resizeMap();
        this.previousAppMode = this.props.appMode;
    }

    render() {
        let hideMouse = this.props.mapControlsHidden && this.props.distractionFreeMode;
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.appContainer]: true,
            [displayStyles.mouseVisible]: !hideMouse,
            [displayStyles.mouseHidden]: hideMouse
        });
        const mapContainerStyle =
            this.props.appMode === MSFTypes.APP_MODE_MAP ? containerClasses : displayStyles.hidden;
        const analyticsContainerStyle =
            this.props.appMode === MSFTypes.APP_MODE_ANALYTICS
                ? containerClasses
                : displayStyles.hidden;
        return (
            <MuiThemeProvider theme={theme}>
                <div className={containerClasses}>
                    <AppBarContainer />
                    <CookieAcceptContainer />
                    <div className={mapContainerStyle}>
                        <HelpContainerExtended />
                        <LayerSidebarContainer />
                        <MapContainerExtended />
                        <SettingsContainerExtended />
                        <ShareContainer />
                        <LayerInfoContainer />
                        <LayerMenuContainerExtended />
                        <TimelineContainer />
                        <AlertsContainer />
                        <LoadingContainer />
                        <MapContextMenu />
                        <MouseFollowerContainer />
                        <AnalyticsContainer />
                        <KeyboardControlsContainerExtended />
                        <FeatureDetailContainer />
                        <MapControlsContainerExtended />
                        <CoordinateTracker />
                        <FeaturePicker />
                        <LocationInputContainer />
                        <HomeAreaPickerContainer />
                    </div>
                    <div className={analyticsContainerStyle}>
                        <MSFAnalyticsContainer />
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

AppContainer.propTypes = {
    completeInitialLoad: PropTypes.func.isRequired,
    checkBrowserFunctionalities: PropTypes.func.isRequired,
    loadInitialData: PropTypes.func.isRequired,
    activateDefaultLayers: PropTypes.func.isRequired,
    runUrlConfig: PropTypes.func.isRequired,
    initializeMap: PropTypes.func.isRequired,
    setMapView: PropTypes.func.isRequired,
    updateFeatureList_Map: PropTypes.func.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapControlsHidden: PropTypes.bool.isRequired,
    appMode: PropTypes.number.isRequired,
    resizeMap: PropTypes.func.isRequired,
    setInitialHomeArea: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsHidden: state.view.get("mapControlsHidden"),
        appMode: state.view.get("appMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        completeInitialLoad: bindActionCreators(appActions.completeInitialLoad, dispatch),
        checkBrowserFunctionalities: bindActionCreators(
            appActions.checkBrowserFunctionalities,
            dispatch
        ),
        loadInitialData: bindActionCreators(mapActionsMSF.loadInitialData, dispatch),
        activateDefaultLayers: bindActionCreators(mapActions.activateDefaultLayers, dispatch),
        runUrlConfig: bindActionCreators(appActions.runUrlConfig, dispatch),
        initializeMap: bindActionCreators(mapActions.initializeMap, dispatch),
        setMapView: bindActionCreators(mapActions.setMapView, dispatch),
        updateFeatureList_Map: bindActionCreators(mapActionsMSF.updateFeatureList_Map, dispatch),
        resizeMap: bindActionCreators(mapActionsMSF.resizeMap, dispatch),
        setInitialHomeArea: bindActionCreators(mapActionsMSF.setInitialHomeArea, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
