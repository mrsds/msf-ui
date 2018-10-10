import React, { Component } from "react";
import PropTypes from "prop-types";
import MenuItem from "@material-ui/core/MenuItem";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Paper from "@material-ui/core/Paper";
import MiscUtil from "_core/utils/MiscUtil";
import moment from "moment";
import { Arrow } from "react-popper";
import { LayerControlLabel } from "_core/components/LayerMenu";
import styles from "components/LayerMenu/LayerDateControlStyles.scss";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

export class LayerDateControl extends Component {
    incrementActive(period, goBack) {
        const currentDate = moment(this.props.griddedSettings.get("currentDate"));
        const availableDates = this.props.griddedSettings.get("availableDates");

        return goBack
            ? currentDate.isSame(availableDates[0], period)
            : currentDate.isSame(availableDates[availableDates.length - 1], period);
    }

    updateDatePart(event, period) {
        let value = event.target.value;
        const newDate = moment(this.props.griddedSettings.get("currentDate"));
        switch (period) {
            case "year":
                newDate.year(value);
                break;
            case "month":
                newDate.month(value);
                break;
            case "day":
                newDate.date(value);
                break;
        }
        if (this.props.griddedSettings.get("currentDate").isSame(newDate)) return;
        this.props.updateDate(newDate);
    }

    render() {
        const currentDate = this.props.griddedSettings.get("currentDate");
        const yearList = this.props.griddedSettings.get("availableDates").reduce((acc, date) => {
            if (!acc.includes(date.year())) acc.push(date.year());
            return acc;
        }, []);

        const monthList = this.props.griddedSettings
            .get("availableDates")
            .filter(date => date.isSame(currentDate, "year"))
            .reduce((acc, date) => {
                if (!acc.includes(date.format("MMM"))) acc.push(date.format("MMM"));
                return acc;
            }, []);

        const dayList = this.props.griddedSettings
            .get("availableDates")
            .filter(date => date.isSame(currentDate, "month"))
            .map(date => date.date());

        const yearClass = MiscUtil.generateStringFromSet({
            [styles.dateSelector]: true,
            [styles.yearSelector]: true
        });

        const monthClass = MiscUtil.generateStringFromSet({
            [styles.dateSelector]: true,
            [styles.monthSelector]: true
        });

        const dayClass = MiscUtil.generateStringFromSet({
            [styles.dateSelector]: true,
            [styles.daySelector]: true
        });

        return (
            <div>
                <Paper elevation={8} className={styles.dateControl}>
                    <LayerControlLabel>Gridded Methane Date</LayerControlLabel>
                    <FormGroup row>
                        <FormControl className={yearClass}>
                            <InputLabel htmlFor="year-select">
                                <IconButton
                                    className={styles.incrementButton}
                                    disabled={this.incrementActive("year", true)}
                                >
                                    <ChevronLeftIcon
                                        onClick={() => this.props.incrementDate("year", true)}
                                    />
                                </IconButton>
                                <span className={styles.incrementLabel}>Year</span>
                                <IconButton
                                    className={styles.incrementButton}
                                    disabled={this.incrementActive("year")}
                                >
                                    <ChevronRightIcon
                                        onClick={() => this.props.incrementDate("year")}
                                    />
                                </IconButton>
                            </InputLabel>
                            <Select
                                value={currentDate.year()}
                                autoWidth={true}
                                input={<Input name="Year" id="year-select" />}
                                onChange={event => this.updateDatePart(event, "year")}
                            >
                                {yearList.map(year => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl className={monthClass}>
                            <InputLabel htmlFor="month-select">
                                <IconButton
                                    className={styles.incrementButton}
                                    disabled={this.incrementActive("month", true)}
                                >
                                    <ChevronLeftIcon
                                        onClick={() => this.props.incrementDate("month", true)}
                                    />
                                </IconButton>
                                <span className={styles.incrementLabel}>Month</span>
                                <IconButton
                                    className={styles.incrementButton}
                                    disabled={this.incrementActive("month")}
                                >
                                    <ChevronRightIcon
                                        onClick={() => this.props.incrementDate("month")}
                                    />
                                </IconButton>
                            </InputLabel>
                            <Select
                                value={currentDate.format("MMM")}
                                autoWidth={true}
                                input={<Input name="Month" id="month-select" />}
                                onChange={event => this.updateDatePart(event, "month")}
                            >
                                {monthList.map(month => (
                                    <MenuItem key={month} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl className={dayClass}>
                            <InputLabel htmlFor="day-select">
                                <IconButton
                                    className={styles.incrementButton}
                                    disabled={this.incrementActive("day", true)}
                                >
                                    <ChevronLeftIcon
                                        onClick={() => this.props.incrementDate("day", true)}
                                    />
                                </IconButton>
                                <span className={styles.incrementLabel}>Day</span>
                                <IconButton
                                    className={styles.incrementButton}
                                    disabled={this.incrementActive("day")}
                                >
                                    <ChevronRightIcon
                                        onClick={() => this.props.incrementDate("day")}
                                    />
                                </IconButton>
                            </InputLabel>
                            <Select
                                value={currentDate.date()}
                                autoWidth={true}
                                input={<Input name="Day" id="day-select" />}
                                onChange={event => this.updateDatePart(event, "day")}
                            >
                                {dayList.map(day => (
                                    <MenuItem key={day} value={day}>
                                        {day}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </FormGroup>
                    <Button
                        color="primary"
                        className={styles.doneButton}
                        onClick={this.props.onClose}
                    >
                        Done
                    </Button>
                </Paper>
                <Arrow className={styles.popperArrow} />
            </div>
        );
    }
}

LayerDateControl.propTypes = {
    griddedSettings: PropTypes.object,
    updateDate: PropTypes.func,
    incrementDate: PropTypes.func,
    onClose: PropTypes.func
};

// function mapStateToProps(state) {
//     return {
//         griddedSettings: state.map.get("griddedSettings")
//     };
// }

export default LayerDateControl;
