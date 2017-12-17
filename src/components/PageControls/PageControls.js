import React from "react";
import PropTypes from "prop-types";
import { IconButton } from "react-toolbox/lib/button";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export const PageControls = props => {
  if (props.resultCount === 0) {
    return <div />;
  }
  const endIndex =
    props.currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE >
    props.resultCount
      ? props.resultCount
      : props.currentPageIndex + layerSidebarTypes.FEATURES_PER_PAGE;
  const counterLabel =
    props.resultCount !== 0
      ? `${props.currentPageIndex + 1} - ${endIndex} of ${
          props.resultCount
        } results`
      : "No features found in the current viewport";

  return (
    <div className="page-controls">
      <div className="page-controls-label">{counterLabel}</div>
      <div className="page-control-buttons">
        <IconButton
          icon="chevron_left"
          onClick={() => props.onPageBackward()}
          disabled={props.currentPageIndex === 0}
          theme={{ icon: "page-controls-icon" }}
        />
        <IconButton
          icon="chevron_right"
          onClick={() => props.onPageForward()}
          disabled={endIndex === props.resultCount}
          theme={{ icon: "page-controls-icon" }}
        />
      </div>
    </div>
  );
};

PageControls.propTypes = {
  resultCount: PropTypes.number,
  currentPageIndex: PropTypes.number,
  onPageBackward: PropTypes.func,
  onPageForward: PropTypes.func
};

export default PageControls;
