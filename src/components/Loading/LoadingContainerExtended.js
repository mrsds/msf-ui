/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import displayStyles from "_core/styles/display.scss";

export class LoadingContainerExtended extends Component {
    showLoadingContainer(hide) {
        document.getElementById("loadingContainer").style.opacity = hide ? 0 : 1;
        setTimeout(() => {
            document.getElementById("loadingContainer").innerHTML = "";
            document.getElementById("loadingContainer").style.display = hide ? "none" : "block";
        }, 1000);
    }

    render() {
        this.showLoadingContainer(
            this.props.initialLoadComplete || this.props.landingPageLoadComplete
        );
        if (this.props.initialLoadComplete || this.props.landingPageLoadComplete)
            return <div className={displayStyles.hidden} />;

        return null;
    }
}

LoadingContainerExtended.propTypes = {
    initialLoadComplete: PropTypes.bool.isRequired,
    landingPageLoadComplete: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        landingPageLoadComplete: state.view.get("landingPageLoaded"),
        initialLoadComplete: state.view.get("initialLoadComplete")
    };
}

export default connect(mapStateToProps, null)(LoadingContainerExtended);
