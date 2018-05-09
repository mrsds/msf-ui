import React, { Component } from "react";
import PropTypes from "prop-types";
import { MenuItem } from "material-ui/Menu";
import { connect } from "react-redux";
import Button from "material-ui/Button";
import { FormGroup, FormControl, FormHelperText } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import Select from "material-ui/Select";
import Paper from "material-ui/Paper";
import MiscUtil from "_core/utils/MiscUtil";
import moment from "moment";
import { Arrow } from "react-popper";
import { LayerControlLabel } from "_core/components/LayerMenu";
import styles from "components/LayerMenu/LayerDateControlStyles.scss";

export class PlumeDateFilterControl extends Component {
    updateDatePart(event, period) {
        let value = event.target.value;
        const newDate = moment(this.props.currentDate);
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
        if (this.props.currentDate.isSame(newDate)) return;
        this.props.updateDateFunction(newDate);
    }

    render() {
        const currentDate = this.props.currentDate;
        const duration = moment.duration(this.props.earliestDate.diff(this.props.latestDate));

        const yearList = [];
        for (let i = 0; i <= duration.years(); i++) {
            yearList.push(this.props.earliestDate.year() + i);
        }

        const startMonth = this.props.currentDate.isSame(this.props.earliestDate, "year")
            ? this.props.earliestDate.month()
            : 0;
        const endMonth = this.props.currentDate.isSame(this.props.latestDate, "year")
            ? this.props.latestDate.month()
            : 11;
        const monthList = moment.monthsShort().slice(startMonth, endMonth + 1);

        const startDay = this.props.currentDate.isSame(this.props.earliestDate, "month")
            ? this.props.earliestDate.date()
            : 1;
        const endDay = this.props.currentDate.isSame(this.props.latestDate, "month")
            ? this.props.latestDate.date()
            : this.props.currentDate.daysInMonth();
        const dayList = Array(endDay - startDay + 1)
            .fill()
            .map((_, idx) => startDay + idx);

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
                    <FormGroup row>
                        <FormControl className={yearClass}>
                            <InputLabel htmlFor="year-select">Year</InputLabel>
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
                            <InputLabel htmlFor="month-select">Month</InputLabel>
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
                            <InputLabel htmlFor="day-select">Day</InputLabel>
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

PlumeDateFilterControl.propTypes = {
    currentDate: PropTypes.object,
    earliestDate: PropTypes.object,
    latestDate: PropTypes.object,
    updateDateFunction: PropTypes.func,
    onClose: PropTypes.func
};

export default PlumeDateFilterControl;
