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

export class LayerDateControl extends Component {
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

LayerDateControl.propTypes = {
    griddedSettings: PropTypes.object,
    updateDate: PropTypes.func,
    onClose: PropTypes.func
};

// function mapStateToProps(state) {
//     return {
//         griddedSettings: state.map.get("griddedSettings")
//     };
// }

export default LayerDateControl;
