import React from "react";
import PropTypes from "prop-types";
import Button from "material-ui/Button";
import Paper from "material-ui/Paper";
import { LayerControlLabel } from "_core/components/LayerMenu";
import { Arrow } from "react-popper";
import styles from "_core/components/LayerMenu/LayerPositionControl.scss";

const LayerPositionControl = props => {
    return (
        <div>
            <Paper elevation={8} className={styles.positionControl}>
                <LayerControlLabel>Layer Positioning</LayerControlLabel>
                <div className={styles.buttonRow}>
                    <Button
                        className={styles.positionButton}
                        color="primary"
                        onClick={() => props.moveToTop()}
                    >
                        Top
                    </Button>
                    <Button
                        className={styles.positionButton}
                        color="primary"
                        onClick={() => props.moveUp()}
                    >
                        Up
                    </Button>
                </div>
                <div className={styles.buttonRow}>
                    <Button
                        className={styles.positionButton}
                        color="primary"
                        onClick={() => props.moveToBottom()}
                    >
                        Bottom
                    </Button>
                    <Button
                        className={styles.positionButton}
                        color="primary"
                        onClick={() => props.moveDown()}
                    >
                        Down
                    </Button>
                </div>
            </Paper>
            <Arrow className={styles.popperArrow} />
        </div>
    );
};

LayerPositionControl.propTypes = {
    isActive: PropTypes.bool.isRequired,
    moveToTop: PropTypes.func.isRequired,
    moveToBottom: PropTypes.func.isRequired,
    moveUp: PropTypes.func.isRequired,
    moveDown: PropTypes.func.isRequired
};

export default LayerPositionControl;
