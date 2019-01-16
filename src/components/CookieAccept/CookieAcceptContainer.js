import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import * as settingsActions from "actions/settingsActions";

export class CookieAcceptContainer extends Component {
    render() {
        if (!this.props.visible) return <div />;

        return (
            <Dialog open={this.props.visible} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Accept Cookies</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        In order to save a home area, we'll need to store cookies in your browser.
                        Is this ok?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => this.props.setCookieAccept(true)}
                        variant="raised"
                        color="primary"
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={() => this.props.setCookieAccept(false)}
                        variant="raised"
                        color="primary"
                    >
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

CookieAcceptContainer.propTypes = {
    visible: PropTypes.bool.isRequired,
    setCookieAccept: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        visible: state.settings.get("cookieAcceptModalOpen")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCookieAccept: bindActionCreators(settingsActions.setCookieAccept, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CookieAcceptContainer);
