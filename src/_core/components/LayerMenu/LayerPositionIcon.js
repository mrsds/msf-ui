import React from "react";
import PropTypes from "prop-types";
import { IconButtonSmall } from "_core/components/Reusables";
import {
    LayerIconTop,
    LayerIconMiddle,
    LayerIconBottom
} from "_core/components/Reusables/CustomIcons";
import styles from "_core/components/LayerMenu/LayerPositionIcon.scss";

const LayerPositionIcon = props => {
    let { displayIndex, activeNum, ...other } = props;

    let layerOrderIcon =
        props.displayIndex === 1 ? (
            <LayerIconTop />
        ) : props.displayIndex === props.activeNum ? (
            <LayerIconBottom />
        ) : (
            <LayerIconMiddle />
        );

    return (
        <IconButtonSmall {...other}>
            {layerOrderIcon}
            <span className={styles.orderLabel}>{props.displayIndex}</span>
        </IconButtonSmall>
    );
};

LayerPositionIcon.propTypes = {
    displayIndex: PropTypes.number.isRequired,
    activeNum: PropTypes.number.isRequired
};

export default LayerPositionIcon;
