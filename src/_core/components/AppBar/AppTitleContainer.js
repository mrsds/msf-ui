import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { AppTitle } from "_core/components/AppBar";

export class AppTitleContainer extends Component {
    render() {
        let { title, subtitle, className, ...other } = this.props;
        return <AppTitle title={title} version={subtitle} className={className} />;
    }
}

AppTitleContainer.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        title: state.view.get("title"),
        subtitle: state.view.get("subtitle")
    };
}

export default connect(mapStateToProps, null)(AppTitleContainer);
