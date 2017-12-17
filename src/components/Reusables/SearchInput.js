import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { IconButton } from "react-toolbox/lib/button";
import { FontIcon } from "react-toolbox/lib/font_icon";
import MiscUtil from "_core/utils/MiscUtil";
import { Input } from "react-toolbox/lib/input";

const miscUtil = new MiscUtil();

export class SearchInput extends Component {
  constructor(props) {
    super(props);
    this.value = this.props.value;
    // this.isValid = true;
    this.updateValueFromInternal = false;
  }
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.value !== this.props.value ||
      nextProps.value !== this.value ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.actionIconPrimary !== this.props.actionIconPrimary
    );
  }
  // componentDidUpdate(nextProps) {
  //   this.isValid = true;
  // }
  // handleKeyPress(evt) {
  //   // let value = this.value;
  //   // if (evt.charCode === 13) {
  //   //   // enter key
  //   //   this.submitValue(value);
  //   // }
  // }
  // handleKeyUp(evt) {
  //   if (evt.which === 27) {
  //     // escape key
  //     this.blur();
  //     this.handleBlur(evt);
  //     this.props.onEscape();
  //   }
  // }
  // handleFocus(evt) {
  //   this.props.onFocus();
  //   this.forceUpdate();
  // }
  handleChange(value) {
    this.value = value;
    this.updateValueFromInternal = true;
    this.props.onUpdate(value);
    this.forceUpdate();
  }
  // submitValue(value) {
  //   this.props.onUpdate(value);
  //   // if the update failed
  //   // force a re-render the go back to previous valid state
  //   if (this.value !== this.props.value) {
  //     this.forceUpdate();
  //   }
  // }
  handleActionButtonClick() {
    if (typeof this.props.onActionIconClick !== "undefined") {
      this.props.onActionIconClick();
    }
  }

  render() {
    let containerClasses =
      miscUtil.generateStringFromSet({
        "search-input": true
      }) + (this.props.className ? " " + this.props.className : "");
    let value = this.updateValueFromInternal ? this.value : this.props.value;
    this.value = value;
    this.updateValueFromInternal = false;
    let actionIcon = "";
    let actionButtonClasses = miscUtil.generateStringFromSet({
      "search-input-action-button no-padding mini-xs-waysmall": true,
      hidden: typeof this.props.actionIcon === "undefined"
    });
    if (this.props.actionIcon) {
      actionIcon = (
        <span className="search-input-action-button-container">
          <IconButton
            neutral
            primary={this.props.actionIconPrimary}
            disabled={
              typeof this.props.actionIcon === "undefined" ||
              this.props.disabled
            }
            icon={this.props.actionIcon}
            className={actionButtonClasses}
            data-tip={this.props.actionDataTip}
            data-place={this.props.actionDataPlace}
            theme={{ primary: "button-primary", neutral: "button-neutral" }}
            onClick={() => this.handleActionButtonClick()}
          />
        </span>
      );
    }
    return (
      <span className={containerClasses}>
        {actionIcon}
        <span onClick={() => this.input.getWrappedInstance().focus()}>
          <Input
            ref={input => {
              this.input = input;
            }}
            type="text"
            disabled={this.props.disabled}
            onChange={evt => this.handleChange(evt)}
            value={value}
            hint={this.props.placeholder}
            label=""
            icon={
              <FontIcon
                value={this.props.icon}
                data-tip={this.props.primaryDataTip}
                data-place={this.props.primaryDataPlace}
              />
            }
            theme={{ hint: "hint", bar: "bar", icon: "left-icon" }}
          />
        </span>
      </span>
    );
  }
}

SearchInput.propTypes = {
  icon: PropTypes.string.isRequired,
  actionIcon: PropTypes.string,
  onActionIconClick: PropTypes.func,
  actionIconPrimary: PropTypes.bool,
  actionDataTip: PropTypes.string,
  actionDataPlace: PropTypes.string,
  primaryDataTip: PropTypes.string,
  primaryDataPlace: PropTypes.string,
  value: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string.isRequired
};
export default connect()(SearchInput);
