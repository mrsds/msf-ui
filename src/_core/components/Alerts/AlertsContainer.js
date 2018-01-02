import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Divider from "material-ui/Divider";
import Typography from "material-ui/Typography";
import { ModalMenu } from "_core/components/ModalMenu";
import { AlertList } from "_core/components/Alerts";
import * as actions from "_core/actions/AppActions";
import styles from "_core/components/Alerts/AlertsContainer.scss";

export class AlertsContainer extends Component {
    render() {
        // process the alerts
        let alertsPresent = this.props.alerts.size > 0;

        // cache the groups for dismissal
        let alerts = alertsPresent ? this.props.alerts : this.prevGroups ? this.prevGroups : [];
        this.prevGroups = this.props.alerts;

        return (
            <ModalMenu
                title="Alert"
                active={alertsPresent}
                className={styles.root}
                closeFunc={() => {
                    this.props.actions.dismissAllAlerts(this.props.alerts);
                }}
            >
                <AlertList alerts={alerts} />
            </ModalMenu>
        );
    }
}

AlertsContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    alerts: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // find all the alerts from all the states
    let alerts = [];
    for (let subState in state) {
        if (state.hasOwnProperty(subState)) {
            let subStateAlerts = state[subState].get("alerts");
            if (typeof subStateAlerts !== "undefined") {
                if (alerts) {
                    alerts = subStateAlerts.concat(alerts);
                } else {
                    alerts = subStateAlerts;
                }
            }
        }
    }

    return {
        alerts: alerts
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertsContainer);
