import { Button, Radio, Typography } from "@material-ui/core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { ModalMenu } from "_core/components/ModalMenu";
import MiscUtil from "_core/utils/MiscUtil";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsExtended from "actions/mapActions";
import styles from "components/HomeAreaPicker/HomeAreaPickerContainerStyles.scss";
import * as MSFTypes from "constants/MSFTypes";

const LOCATION_OPTIONS = [
    {
        key: "permian",
        label: "Permian Basin, Texas/New Mexico",
        location: MSFTypes.HOME_AREA_PERMIAN_BASIN,
        extent: MSFTypes.EXTENTS_PERMIAN_BASIN
    },
    {
        key: "la",
        label: "Los Angeles, California",
        location: MSFTypes.HOME_AREA_LOS_ANGELES,
        extent: MSFTypes.EXTENTS_LOS_ANGELES
    },
    {
        key: "sfBay",
        label: "San Francisco Bay Area, California",
        location: MSFTypes.HOME_AREA_SF_BAY,
        extent: MSFTypes.EXTENTS_SF_BAY
    }
];

export class HomeAreaPickerContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { selectedHomeArea: "permian" };
    }

    selectHomeArea(location) {
        return _ => {
            this.setState({ selectedHomeArea: location.key });
            this.props.mapActionsExtended.setHomeArea(location.location, location.extent);
        };
    }

    closeModal() {
        this.props.mapActionsExtended.setHomeAreaPickerVisible(false);
    }

    goToHomeArea() {
        const homeArea = LOCATION_OPTIONS.find(
            location => location.key === this.state.selectedHomeArea
        );
        this.props.mapActions.setMapView({ extent: homeArea.extent }, true);
        this.closeModal();
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.shareContainer]: true,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <ModalMenu
                title="Choose a Home Area"
                active={this.props.isOpen}
                closeFunc={() => this.closeModal()}
            >
                <div className={containerClasses}>
                    <p>Welcome to Methane Source Finder! </p>
                    <p>
                        To get started, choose which area you would like to use as your Home. You
                        can change this later using the Settings icon in the upper right.
                    </p>
                    <div className={styles.formControl}>
                        {LOCATION_OPTIONS.map(locationOption => (
                            <div
                                onClick={this.selectHomeArea(locationOption)}
                                key={locationOption.key}
                                className={styles.formControlLabel}
                            >
                                <Radio
                                    value={locationOption.key}
                                    checked={this.state.selectedHomeArea === locationOption.key}
                                />
                                <Typography className={styles.radioLabel}>
                                    {locationOption.label}
                                </Typography>
                            </div>
                        ))}
                    </div>
                    <p>Your choice will be saved as a browser-cookie.</p>
                    <div className={styles.modalAction}>
                        <Button
                            color="primary"
                            variant="raised"
                            onClick={_ => this.goToHomeArea()}
                            className={styles.submitButton}
                        >
                            Go to Home Area
                        </Button>
                    </div>
                </div>
            </ModalMenu>
        );
    }
}

HomeAreaPickerContainer.propTypes = {
    mapActions: PropTypes.object.isRequired,
    mapActionsExtended: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        isOpen: state.map.get("chooseHomeAreaModalVisible")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeAreaPickerContainer);
