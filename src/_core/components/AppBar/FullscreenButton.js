import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Modernizr from "modernizr";
import FullscreenIcon from "material-ui-icons/Fullscreen";
import FullscreenExitIcon from "material-ui-icons/FullscreenExit";
import * as actions from "_core/actions/AppActions";
import { IconButtonSmall } from "_core/components/Reusables";
import MiscUtil from "_core/utils/MiscUtil";

export class FullscreenButton extends Component {
    componentDidMount() {
        // have to retroactively sync the state given browser specific hardware options to enter/exit full screen
        document.addEventListener(
            "fullscreenchange",
            () => {
                this.handleFullScreenChange();
            },
            false
        );
        document.addEventListener(
            "webkitfullscreenchange",
            () => {
                this.handleFullScreenChange();
            },
            false
        );
        document.addEventListener(
            "mozfullscreenchange",
            () => {
                this.handleFullScreenChange();
            },
            false
        );
    }

    handleFullScreenChange() {
        if (MiscUtil.getIsInFullScreenMode()) {
            this.props.actions.setFullScreenMode(true);
        } else {
            this.props.actions.setFullScreenMode(false);
        }
    }

    render() {
        let { className, isFullscreen, actions, ...other } = this.props;

        let rootClasses = MiscUtil.generateStringFromSet({
            [className]: typeof className !== "undefined"
        });

        return (
            <IconButtonSmall
                color="contrast"
                className={rootClasses}
                onClick={() => this.props.actions.setFullScreenMode(!isFullscreen)}
                {...other}
            >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButtonSmall>
        );
    }
}

FullscreenButton.propTypes = {
    actions: PropTypes.object.isRequired,
    isFullscreen: PropTypes.bool.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        isFullscreen: state.view.get("isFullscreen")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenButton);
