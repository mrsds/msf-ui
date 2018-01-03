import React from "react";
import PropTypes from "prop-types";
import Popover from "material-ui/Popover";
import Grow from "material-ui/transitions/Grow";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import { Manager, Target, Popper } from "react-popper";
import Tooltip from "material-ui/Tooltip";
import { MapButton, MapToolsMenu } from "_core/components/Reusables";
import BuildIcon from "material-ui-icons/Build";
import mapControlsContainerStyles from "_core/components/Map/MapControlsContainer.scss";
import displayStyles from "_core/styles/display.scss";

const MapToolsButton = props => {
    return (
        <ClickAwayListener
            onClickAway={() => {
                if (props.isOpen) {
                    props.setOpen(false);
                }
            }}
        >
            <Manager>
                <Target>
                    <Tooltip title="Tools" placement="right">
                        <MapButton
                            color={props.isOpen ? "primary" : "default"}
                            onClick={() => {
                                props.setOpen(!props.isOpen);
                            }}
                            aria-label="Tools"
                            className={mapControlsContainerStyles.lastButton}
                        >
                            <BuildIcon />
                        </MapButton>
                    </Tooltip>
                </Target>
                <Popper
                    placement="left-end"
                    style={{ marginRight: "5px" }}
                    modifiers={{
                        computeStyle: {
                            gpuAcceleration: false
                        }
                    }}
                    eventsEnabled={props.isOpen}
                    className={!props.isOpen ? displayStyles.noPointer : ""}
                >
                    <Grow style={{ transformOrigin: "right" }} in={props.isOpen}>
                        <div>
                            <MapToolsMenu
                                handleRequestClose={() => {
                                    if (props.isOpen) {
                                        props.setOpen(false);
                                    }
                                }}
                            />
                        </div>
                    </Grow>
                </Popper>
            </Manager>
        </ClickAwayListener>
    );
};

MapToolsButton.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired
};

export default MapToolsButton;
