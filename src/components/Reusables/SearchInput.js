import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import IconButton from "material-ui/IconButton";
import Input, { InputLabel, InputAdornment } from "material-ui/Input";
import Visibility from "material-ui-icons/Visibility";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/Reusables/SearchInputStyles.scss";

export class SearchInput extends Component {
    constructor(props) {
        super(props);
        this.value = this.props.value;
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

    handleChange(value) {
        this.value = value;
        this.updateValueFromInternal = true;
        this.props.onUpdate(value);
        this.forceUpdate();
    }

    handleActionButtonClick() {
        if (typeof this.props.onActionIconClick !== "undefined") {
            this.props.onActionIconClick();
        }
    }

    render() {
        let value = this.updateValueFromInternal ? this.value : this.props.value;
        this.value = value;
        this.updateValueFromInternal = false;
        let actionIcon = "";
        if (this.props.actionIcon) {
            actionIcon = (
                <span className="search-input-action-button-container">
                    <IconButton
                        color={this.props.actionIconPrimary ? "primary" : "default"}
                        disabled={
                            typeof this.props.actionIcon === "undefined" || this.props.disabled
                        }
                        onClick={() => this.handleActionButtonClick()}
                    >
                        {this.props.actionIcon}
                    </IconButton>
                </span>
            );
        }
        let rootStyles = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [this.props.className]: this.props.className ? true : false
        });
        return (
            <Input
                ref={input => {
                    this.input = input;
                }}
                disableUnderline={true}
                className={rootStyles}
                disabled={this.props.disabled}
                onChange={evt => this.handleChange(evt.target.value)}
                value={value}
                placeholder={this.props.placeholder}
                startAdornment={
                    <InputAdornment
                        classes={{ positionStart: styles.inputAdornmentPositionStart }}
                        position="start"
                    >
                        {this.props.icon}
                    </InputAdornment>
                }
                endAdornment={<InputAdornment position="end">{actionIcon}</InputAdornment>}
            />
        );
    }
}

SearchInput.propTypes = {
    icon: PropTypes.object.isRequired,
    actionIcon: PropTypes.object,
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
