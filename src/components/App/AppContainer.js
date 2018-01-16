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

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
import { appColorPalette } from "styles/appColorPalette";
import * as appActions from "_core/actions/appActions";
import * as mapActionsMSF from "actions/mapActions";
import * as mapActions from "_core/actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import {
    MapContainer,
    MapContextMenu,
    MapControlsContainer,
    CoordinateTracker
} from "_core/components/Map";
import { ShareContainer } from "_core/components/Share";
import { LayerInfoContainer } from "_core/components/LayerInfo";
import { LoadingContainer } from "_core/components/Loading";
import { HelpContainer } from "_core/components/Help";
import { AlertsContainer } from "_core/components/Alerts";
// import { LayerMenuContainer } from "_core/components/LayerMenu";
import { MouseFollowerContainer } from "_core/components/MouseFollower";
import { AnalyticsContainer } from "_core/components/Analytics";
import { KeyboardControlsContainer } from "_core/components/KeyboardControls";
import styles from "components/App/AppContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";
import SettingsContainerExtended from "components/Settings/SettingsContainerExtended";
import MapContainerExtended from "components/Map/MapContainerExtended";
import MapControlsContainerExtended from "components/Map/MapControlsContainerExtended";
// import DateSliderContainer from "_core/components/DateSlider/DateSliderContainer";
import TimelineContainer from "components/Timeline/TimelineContainer";
import LayerSidebarContainer from "components/MethaneSidebar/LayerSidebarContainer";
import AppBarContainer from "components/AppBar/AppBarContainer";
import LayerMenuContainerExtended from "components/LayerMenu/LayerMenuContainerExtended";
// import FeatureDetailContainer from "components/FeatureDetail/FeatureDetailContainer";

const theme = createMuiTheme({
    typography: {
        htmlFontSize: 10
    },
    palette: {
        primary: appColorPalette
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
                    this.props.setMapView({ extent: appConfig.DEFAULT_BBOX_EXTENT }, true);

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

    render() {
        let hideMouse = this.props.mapControlsHidden && this.props.distractionFreeMode;
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.appContainer]: true,
            [displayStyles.mouseVisible]: !hideMouse,
            [displayStyles.mouseHidden]: hideMouse
        });
        return (
            <MuiThemeProvider theme={theme}>
                <div className={containerClasses}>
                    <HelpContainer />
                    <LayerSidebarContainer />
                    <MapContainerExtended />
                    <AppBarContainer />
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
                    <KeyboardControlsContainer />
                    {/* <FeatureDetailContainer /> */}
                    <MapControlsContainerExtended />
                    <CoordinateTracker />
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
    mapControlsHidden: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsHidden: state.view.get("mapControlsHidden")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        completeInitialLoad: bindActionCreators(appActions.completeInitialLoad, dispatch),
        checkBrowserFunctionalities: bindActionCreators(
            appActions.checkBrowserFunctionalities,
            dispatch
        ),
        loadInitialData: bindActionCreators(mapActions.loadInitialData, dispatch),
        activateDefaultLayers: bindActionCreators(mapActions.activateDefaultLayers, dispatch),
        runUrlConfig: bindActionCreators(appActions.runUrlConfig, dispatch),
        initializeMap: bindActionCreators(mapActions.initializeMap, dispatch),
        setMapView: bindActionCreators(mapActions.setMapView, dispatch),
        updateFeatureList_Map: bindActionCreators(mapActionsMSF.updateFeatureList_Map, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
