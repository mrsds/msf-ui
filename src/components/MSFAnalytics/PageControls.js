import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { IconButtonSmall } from "_core/components/Reusables";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import styles from "components/MSFAnalytics/PageControlsStyles.scss";

export const PageControls = props => {
    if (props.resultCount === 0) {
        return <div />;
    }

    const startIndex = props.currentPageIndex + 1;
    const moreResults = startIndex + props.resultsPerPage <= props.resultCount;
    const endIndex = moreResults
        ? props.currentPageIndex + props.resultsPerPage
        : props.resultCount;
    const counterLabel =
        props.resultCount !== 0
            ? `${startIndex} – ${endIndex} of ${props.resultCount} results`
            : "No sources found";

    return (
        <React.Fragment>
            <Divider />
            <div className={styles.root}>
                <div className={styles.rightSide}>
                    <Typography variant="caption" className={styles.label}>
                        {counterLabel}
                    </Typography>
                    <div className={styles.buttons}>
                        <IconButtonSmall
                            key="chevronLeft"
                            onClick={() =>
                                props.onPageBackward(props.currentPageIndex - props.resultsPerPage)
                            }
                            disabled={props.currentPageIndex === 0}
                        >
                            <ChevronLeftIcon />
                        </IconButtonSmall>
                        <IconButtonSmall
                            key="chevronRight"
                            onClick={() =>
                                props.onPageForward(props.currentPageIndex + props.resultsPerPage)
                            }
                            disabled={!moreResults}
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
    resultsPerPage: PropTypes.number
};

export default PageControls;
