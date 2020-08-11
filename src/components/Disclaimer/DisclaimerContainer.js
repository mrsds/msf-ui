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

export class DisclaimerContainer extends Component {
    constructor(props) {
        super(props);
        this.open = true;
    }

    closeDialog() {
        this.open = false;
        this.forceUpdate();
    }

    render() {
        if (!this.open) return <div />;

        return (
            <Dialog open={this.open} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Disclaimer</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Thank you for helping improve the Methane Source Finder web site!
                    </DialogContentText>
                    <br />
                    <DialogContentText>
                        Please DO NOT CITE, QUOTE, OR DISTRIBUTE. The data sets displayed here are
                        strictly intended to demonstrate and exercise the visualization capabilities
                        of this portal. The data and supporting calculations are undergoing to
                        validation, revision and peer-review. Access to this beta version is granted
                        to a limited audience of stakeholders to provide feedback to the developers
                        in order to improve utility.
                    </DialogContentText>
                    <br />
                    <DialogContentText>
                        Please contact Rob Tapella (<a href="mailto:rtapella@jpl.nasa.gov">
                            rtapella@jpl.nasa.gov
                        </a>) or Riley Duren (<a href="mailto:Riley.M.Duren@jpl.nasa.gov">
                            Riley.M.Duren@jpl.nasa.gov
                        </a>) at JPL, respectively, for questions regarding portal functionality or
                        data content or before sharing the login information for other colleagues.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.closeDialog()} variant="raised" color="primary">
                        I understand
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(null, null)(DisclaimerContainer);
