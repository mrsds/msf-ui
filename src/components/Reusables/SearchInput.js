import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import { IconButtonSmall } from "_core/components/Reusables";
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
        let actionIconClasses = MiscUtil.generateStringFromSet({
            [styles.actionIcon]: true,
            [styles.actionIconHidden]: !value
        });
        if (this.props.actionIcon) {
            actionIcon = (
                <span className={actionIconClasses}>
                    <IconButtonSmall
                        aria-label="Clear Filters"
                        disableRipple={true}
                        color={this.props.actionIconPrimary ? "primary" : "default"}
                        disabled={
                            typeof this.props.actionIcon === "undefined" || this.props.disabled
                        }
                        onClick={() => this.handleActionButtonClick()}
                    >
                        {this.props.actionIcon}
                    </IconButtonSmall>
                </span>
            );
        }
        let rootClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [this.props.className]: this.props.className ? true : false
        });
        return (
            <Input
                ref={input => {
                    this.input = input;
                }}
                id={this.props.SearchInputId}
                disableUnderline={true}
                className={rootClasses}
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
                endAdornment={
                    <InputAdornment className={styles.inputAdornmentPositionEnd} position="end">
                        {actionIcon}
                    </InputAdornment>
                }
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
    placeholder: PropTypes.string.isRequired,
    SearchInputId: PropTypes.string.isRequired
};
export default connect()(SearchInput);
