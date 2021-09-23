import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { IconButtonSmall } from "_core/components/Reusables";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/PageControls/PageControlsStyles.scss";

export const PageControls = props => {
    if (props.resultCount === 0) {
        return <div />;
    }
    const startIndex = props.currentPageIndex * layerSidebarTypes.FEATURES_PER_PAGE;
    let endIndex;
    let moreResults;
    if ((props.currentPageIndex + 1) * layerSidebarTypes.FEATURES_PER_PAGE > props.resultCount) {
        endIndex = props.resultCount;
        moreResults = true;
    } else {
        endIndex = (props.currentPageIndex + 1) * layerSidebarTypes.FEATURES_PER_PAGE;
        moreResults = false;
    }
    const counterLabel =
        props.resultCount !== 0
            ? `${startIndex + 1} – ${endIndex} of ${props.resultCount} results`
            : "No features found in the current viewport";

    const hiddenResults = props.totalResults - props.resultCount;

    return (
        <React.Fragment>
            <Divider />
            <div className={styles.root}>
                <div hidden={!hiddenResults} className={styles.leftSide}>
                    <Typography variant="caption">
                        {hiddenResults} results excluded by filters
                        <a href="#" onClick={props.clearFilterFunc}>
                            clear
                        </a>
                    </Typography>
                </div>
                <div className={styles.rightSide}>
                    <Typography variant="caption" className={styles.label}>
                        {counterLabel}
                    </Typography>
                    <div className={styles.buttons}>
                        <IconButtonSmall
                            key="chevronLeft"
                            onClick={() => props.onPageBackward()}
                            disabled={props.currentPageIndex === 0}
                        >
                            <ChevronLeftIcon />
                        </IconButtonSmall>
                        <IconButtonSmall
                            key="chevronRight"
                            onClick={() => props.onPageForward()}
                            disabled={moreResults}
                        >
                            <ChevronRightIcon />
                        </IconButtonSmall>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

PageControls.propTypes = {
    resultCount: PropTypes.number,
    currentPageIndex: PropTypes.number,
    onPageBackward: PropTypes.func,
    onPageForward: PropTypes.func,
    totalResults: PropTypes.number,
    clearFilterFunc: PropTypes.func
};

export default PageControls;
