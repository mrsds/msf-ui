import React from "react";
import PropTypes from "prop-types";
import { IconButtonSmall } from "_core/components/Reusables";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import ChevronLeftIcon from "material-ui-icons/ChevronLeft";
import ChevronRightIcon from "material-ui-icons/ChevronRight";
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

    return (
        <React.Fragment>
            <Divider />
            <div className={styles.root}>
                <Typography type="caption" className={styles.label}>
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
        </React.Fragment>
    );
};

PageControls.propTypes = {
    resultCount: PropTypes.number,
    currentPageIndex: PropTypes.number,
    onPageBackward: PropTypes.func,
    onPageForward: PropTypes.func
};

export default PageControls;
