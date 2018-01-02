import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Tooltip from "material-ui/Tooltip";
import HelpIcon from "material-ui-icons/Help";
import ShareIcon from "material-ui-icons/Share";
import SettingsIcon from "material-ui-icons/Settings";
import { IconButtonSmall } from "_core/components/Reusables";
import { FullscreenButton } from "_core/components/AppBar";
import * as actions from "_core/actions/AppActions";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/AppBar/AppButtons.scss";

export class AppButtons extends Component {
    render() {
        let { className, actions, ...other } = this.props;

        let rootClasses = MiscUtil.generateStringFromSet({
            [className]: typeof className !== "undefined"
        });

        return (
            <div className={rootClasses} {...other}>
                <Tooltip title="Help" placement="bottom" className={styles.btnWrapper}>
                    <IconButtonSmall
                        color="contrast"
                        className={styles.btn}
                        onClick={() => actions.setHelpOpen(true)}
                    >
                        <HelpIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip title="Share" placement="bottom" className={styles.btnWrapper}>
                    <IconButtonSmall
                        color="contrast"
                        className={styles.btn}
                        onClick={() => actions.setShareOpen(true)}
                    >
                        <ShareIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip title="Settings" placement="bottom" className={styles.btnWrapper}>
                    <IconButtonSmall
                        color="contrast"
                        className={styles.btn}
                        onClick={() => actions.setSettingsOpen(true)}
                    >
                        <SettingsIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip title="Fullscreen" placement="bottom" className={styles.btnWrapper}>
                    <FullscreenButton className={styles.btn} />
                </Tooltip>
            </div>
        );
    }
}

AppButtons.propTypes = {
    actions: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(AppButtons);
