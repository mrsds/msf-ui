import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { ModalMenu } from "_core/components/ModalMenu";
import MiscUtil from "_core/utils/MiscUtil";
import * as mapActionsExtended from "actions/mapActions";
import styles from "components/LocationInput/LocationInputContainerStyles.scss";

export class LocationInputContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputBuffer: ""
        };
    }

    focusTextArea() {
        this.urlText.select();
        this.urlText.focus();
    }

    setInputBuffer(e) {
        // eslint-disable-next-line react/no-set-state
        this.setState({
            inputBuffer: e.target.value,
            errMsg: null
        });
    }

    getLatLong() {
        const splitString = this.state.inputBuffer.split(",");
        if (splitString.length === 2 && splitString.every(val => !isNaN(val))) {
            return splitString.map(parseFloat);
        }
        return false;
    }

    locationSearch() {
        return new Promise((resolve, reject) => {
            fetch(
                `https://nominatim.openstreetmap.org/search/${
                    this.state.inputBuffer
                }?format=json&limit=1`
            )
                .then(res => res.json())
                .then(results => {
                    if (!results.length) return reject();
                    return resolve([results[0].lat, results[0].lon].map(parseFloat));
                });
        });
    }

    async submitLocation() {
        let coords = this.getLatLong();

        if (!coords) {
            try {
                coords = await this.locationSearch();
            } catch (e) {
                coords = null;
            }
        }

        if (coords) {
            this.props.mapActionsExtended.openMapToLatLong(...coords);
            this.setState({ inputBuffer: "", errMsg: null }); // eslint-disable-line react/no-set-state
            this.props.mapActionsExtended.toggleLocationInputModal(false);
        } else {
            // eslint-disable-next-line react/no-set-state
            this.setState({
                errMsg: "Could not find location for that search."
            });
        }
    }

    closeModal() {
        this.props.mapActionsExtended.toggleLocationInputModal(false);
        // eslint-disable-next-line react/no-set-state
        this.setState({
            inputBuffer: "",
            errMsg: null
        });
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.shareContainer]: true,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <ModalMenu
                small
                title="Input Location"
                active={this.props.isOpen}
                closeFunc={() => this.closeModal()}
                onRendered={() => {
                    this.focusTextArea();
                }}
            >
                <div className={containerClasses}>
                    <p>
                        Enter map coordinates (lat, long) or a place name/address to zoom to that
                        spot on the map.
                    </p>
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            onChange={e => this.setInputBuffer(e)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    return this.submitLocation();
                                }
                            }}
                            value={this.state.inputBuffer}
                            className={styles.permalink}
                            ref={input => {
                                if (typeof input !== "undefined") {
                                    this.urlText = input;
                                }
                            }}
                        />
                        <Button
                            color="primary"
                            variant="raised"
                            onClick={_ => this.submitLocation()}
                            className={styles.submitButton}
                        >
                            Go
                        </Button>
                    </div>
                    <div className={styles.errorRow}>{this.state.errMsg}</div>
                </div>
            </ModalMenu>
        );
    }
}

LocationInputContainer.propTypes = {
    mapActionsExtended: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        isOpen: state.map.get("locationInputModalVisible")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActionsExtended: bindActionCreators(mapActionsExtended, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationInputContainer);
