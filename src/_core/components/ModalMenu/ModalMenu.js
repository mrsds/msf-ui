import Immutable from "immutable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MiscUtil from "_core/utils/MiscUtil";
import Dialog, { DialogContent } from "material-ui/Dialog";
import AppBar from "material-ui/AppBar";
import Typography from "material-ui/Typography";
import Toolbar from "material-ui/Toolbar";
import Button from "material-ui/Button";
import IconButton from "material-ui/IconButton";
import CloseIcon from "material-ui-icons/Close";
import ArrowBackIcon from "material-ui-icons/ArrowBack";
import styles from "_core/components/ModalMenu/ModalMenu.scss";
import displayStyles from "_core/styles/display.scss";

export class ModalMenu extends Component {
    render() {
        let paperClasses = MiscUtil.generateStringFromSet({
            [styles.paper]: true,
            [this.props.className]: typeof this.props.className !== "undefined"
        });
        let backClasses = MiscUtil.generateStringFromSet({
            [styles.back]: true,
            [displayStyles.hidden]: !this.props.back
        });
        let closeClasses = MiscUtil.generateStringFromSet({
            [styles.close]: true
        });
        return (
            <Dialog
                classes={{ paper: paperClasses }}
                open={this.props.active}
                onRequestClose={this.props.closeFunc}
            >
                <AppBar className={styles.appbar}>
                    <Toolbar>
                        <IconButton
                            onClick={this.props.backFunc}
                            color="contrast"
                            className={backClasses}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography type="title" color="inherit" className={styles.flex}>
                            {this.props.title}
                        </Typography>
                        <IconButton
                            color="contrast"
                            onClick={this.props.closeFunc}
                            className={closeClasses}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent className={styles.root}>{this.props.children}</DialogContent>
            </Dialog>
        );
    }
}

ModalMenu.propTypes = {
    title: PropTypes.string,
    active: PropTypes.bool,
    back: PropTypes.bool,
    closeFunc: PropTypes.func,
    backFunc: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default connect()(ModalMenu);
