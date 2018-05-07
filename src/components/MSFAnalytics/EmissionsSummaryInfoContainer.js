import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

export class EmissionsSummaryInfoContainer extends Component {
    render() {
        return (
            <div>
                “If I were asked to give a commencement speech (which I'll never be), I'd say
                basically: They're all gonna laugh at you. Life is pretty much like Carrie's prom.
                So ... stay secret.” <i>― Mark Leyner, Gone with the Mind</i>
            </div>
        );
    }
}

export default connect(null, null)(EmissionsSummaryInfoContainer);
