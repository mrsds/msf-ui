import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";
import KeyboardArrowUpIcon from "material-ui-icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "material-ui-icons/KeyboardArrowDown";
import Paper from "material-ui/Paper";
import { IncrementButton, IncrementIcon } from "_core/components/DatePicker";
import * as dateSliderActions from "_core/actions/dateSliderActions";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/Timeline/ResolutionStep.scss";

export class ResolutionStep extends Component {
    render() {
        let currentResolution = MiscUtil.findObjectWithIndexInArray(
            appConfig.DATE_SLIDER_RESOLUTIONS,
            "resolution",
            this.props.resolution.get("resolution")
        );
        let canIncrementStep =
            currentResolution.index < appConfig.DATE_SLIDER_RESOLUTIONS.length - 1;
        let canDecrementStep = currentResolution.index > 0;

        let higherResolutionComponent = "";
        if (canIncrementStep) {
            higherResolutionComponent = (
                <Button
                    classes={{ label: styles.stepButtonLabel }}
                    color="contrast"
                    onClick={() => {
                        this.props.dateSliderActions.setDateResolution(
                            appConfig.DATE_SLIDER_RESOLUTIONS[currentResolution.index + 1],
                            false
                        );
                    }}
                >
                    {appConfig.DATE_SLIDER_RESOLUTIONS[currentResolution.index + 1].label}
                    <span className={styles.stepIconContainer}>
                        <KeyboardArrowUpIcon />
                    </span>
                </Button>
            );
        }

        let lowerResolutionComponent = "";
        if (canDecrementStep) {
            lowerResolutionComponent = (
                <Button
                    classes={{ label: styles.stepButtonLabel }}
                    color="contrast"
                    onClick={() => {
                        this.props.dateSliderActions.setDateResolution(
                            appConfig.DATE_SLIDER_RESOLUTIONS[currentResolution.index - 1],
                            false
                        );
                    }}
                >
                    {appConfig.DATE_SLIDER_RESOLUTIONS[currentResolution.index - 1].label}
                    <span className={styles.stepIconContainer}>
                        <KeyboardArrowDownIcon />
                    </span>
                </Button>
            );
        }
        return (
            <div className={styles.container}>
                <Grid container spacing={0}>
                    <Grid item xs={12} className={styles.stepContainer}>
                        {higherResolutionComponent}
                    </Grid>
                    <Grid item xs={12} className={styles.currentStepContainer}>
                        <Paper classes={{ root: styles.currentStepPaper }}>
                            <Typography className={styles.currentStepLabel}>
                                {this.props.resolution.get("label")}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} className={styles.stepContainer}>
                        {lowerResolutionComponent}
                    </Grid>
                </Grid>
            </div>
        );
    }
}
ResolutionStep.propTypes = {
    dateSliderActions: PropTypes.object.isRequired,
    resolution: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        resolution: state.dateSlider.get("resolution")
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResolutionStep);