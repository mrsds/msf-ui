import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import Immutable from "immutable";
import { DataSet, Timeline } from "vis/index-timeline-graph2d";
import "vis/dist/vis-timeline-graph2d.min.css";
import { ResolutionStep } from "_core/components/Timeline";
import KeyboardArrowLeftIcon from "material-ui-icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "material-ui-icons/KeyboardArrowRight";
import Button from "material-ui/Button";
import * as mapActions from "_core/actions/mapActions";
import * as mapActionsMSF from "actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import MiscUtil from "_core/utils/MiscUtil";
import MiscUtilExtended from "utils/MiscUtilExtended";
import MetadataUtil from "utils/MetadataUtil";
import styles from "components/Timeline/TimelineContainerStyles.scss";
import displayStyles from "_core/styles/display.scss";

let util = require("vis/lib/util");
let TimeStep = require("vis/lib/timeline/TimeStep");
let DateUtil = require("vis/lib/timeline/DateUtil");

const DAY_IN_MS = 86400000;
const MIN_DATE_MOMENT = moment(appConfig.PLUME_START_DATE);
const MAX_DATE_MOMENT = moment(appConfig.PLUME_END_DATE);

// Bin sizes in ms for each date resolution
// TODO move this into config?
const BIN_SIZES_MS = {
    seconds: DAY_IN_MS / 48 / 48 / 48,
    minutes: DAY_IN_MS / 48 / 48,
    hours: DAY_IN_MS / 48,
    days: DAY_IN_MS,
    months: DAY_IN_MS * 15,
    years: DAY_IN_MS * 100
};

// Mapping from date resolution values from config to scale values
// used by VisJS
const VIS_SCALE_SIZES = {
    seconds: "second",
    minutes: "minute",
    hours: "hour",
    days: "day",
    months: "month",
    years: "year"
};

// Offset of the item when scrolling an item into view
// as a proportion of the current windowsize
const ITEM_SCROLL_OFFSET = 0.2;

// margin for the timeline within it's container
// const CONTAINER_MARGIN = 64;
// const CONTAINER_MARGIN = 74;
// const CONTAINER_MARGIN = 64;
const CONTAINER_MARGIN = 0;

// id for the item indicating the current date
// const CURR_DATE_ITEM_ID = "_currentDateItem";

export class TimelineContainerStyles extends Component {
    componentDidMount() {
        this.isDragging = false;
        // this.previouslySelectedItem = null;

        // get the default items
        this.items = this.getTimelineItems();

        // Best guess width, will be off if other sibling elements around timeline have not
        // rendered yet.
        this.timelineContainerStylesWidth = this.getContainerWidth();

        // Create a timeline
        this.timeline = new Timeline(
            this.timelineContainerStylesRef,
            this.items,
            this.getTimelineOptions()
        );

        this.initializeTimelineListeners();

        // Listen window resize events and trigger resize of timeline
        window.onresize = evt => {
            this.handleWindowResize(evt);
        };

        // horrible annoying override of an entire vis function just to add a single
        // classname to that sticky left major axis label ugh.
        this.timeline.timeAxis._repaintLabels = function() {
            let orientation = this.options.orientation.axis;

            // calculate range and step (step such that we have space for 7 characters per label)
            let start = util.convert(this.body.range.start, "Number");
            let end = util.convert(this.body.range.end, "Number");
            let timeLabelsize = this.body.util
                .toTime((this.props.minorCharWidth || 10) * this.options.maxMinorChars) // eslint-disable-line react/prop-types
                .valueOf();
            let minimumStep =
                timeLabelsize -
                DateUtil.getHiddenDurationBefore(
                    this.options.moment,
                    this.body.hiddenDates,
                    this.body.range,
                    timeLabelsize
                );
            minimumStep -= this.body.util.toTime(0).valueOf();

            let step = new TimeStep(
                new Date(start),
                new Date(end),
                minimumStep,
                this.body.hiddenDates,
                this.options
            );
            step.setMoment(this.options.moment);
            if (this.options.format) {
                step.setFormat(this.options.format);
            }
            if (this.options.timeAxis) {
                step.setScale(this.options.timeAxis);
            }
            this.step = step;

            // Move all DOM elements to a "redundant" list, where they
            // can be picked for re-use, and clear the lists with lines and texts.
            // At the end of the function _repaintLabels, left over elements will be cleaned up
            let dom = this.dom;
            dom.redundant.lines = dom.lines;
            dom.redundant.majorTexts = dom.majorTexts;
            dom.redundant.minorTexts = dom.minorTexts;
            dom.lines = [];
            dom.majorTexts = [];
            dom.minorTexts = [];

            let current; // eslint-disable-line no-unused-vars
            let next;
            let x;
            let xNext;
            let isMajor;
            let nextIsMajor; // eslint-disable-line no-unused-vars
            let showMinorGrid;
            let width = 0,
                prevWidth;
            let line;
            let labelMinor;
            let xFirstMajorLabel = undefined;
            let count = 0;
            const MAX = 1000;
            let className;

            step.start();
            next = step.getCurrent();
            xNext = this.body.util.toScreen(next);
            while (step.hasNext() && count < MAX) {
                count++;

                isMajor = step.isMajor();
                // className = step.getClassName();
                className = ""; // APLAVE PERFORMANCE MODIFICATION
                labelMinor = step.getLabelMinor();

                current = next;
                x = xNext;

                step.next();
                next = step.getCurrent();
                nextIsMajor = step.isMajor();
                xNext = this.body.util.toScreen(next);

                prevWidth = width;
                width = xNext - x;
                switch (step.scale) {
                    case "week":
                        showMinorGrid = true;
                        break;
                    default:
                        showMinorGrid = width >= prevWidth * 0.4;
                        break; // prevent displaying of the 31th of the month on a scale of 5 days
                }
                let label = "";
                if (this.options.showMinorLabels && showMinorGrid) {
                    label = this._repaintMinorText(x, labelMinor, orientation, className);
                    label.style.width = width + "px"; // set width to prevent overflow
                }

                if (isMajor && this.options.showMajorLabels) {
                    if (x > 0) {
                        if (xFirstMajorLabel == undefined) {
                            xFirstMajorLabel = x;
                        }
                        label = this._repaintMajorText(
                            x,
                            step.getLabelMajor(),
                            orientation,
                            className
                        );
                    }
                    line = this._repaintMajorLine(x, width, orientation, className);
                } else {
                    // minor line
                    if (showMinorGrid) {
                        line = this._repaintMinorLine(x, width, orientation, className);
                    } else {
                        if (line) {
                            // adjust the width of the previous grid
                            line.style.width = parseInt(line.style.width) + width + "px";
                        }
                    }
                }
            }

            // if (count === MAX && !warnedForOverflow) {
            //     console.warn(`Something is wrong with the Timeline scale. Limited drawing of grid lines to ${MAX} lines.`);
            //     warnedForOverflow = true;
            // }

            // create a major label on the left when needed
            if (this.options.showMajorLabels) {
                let leftTime = this.body.util.toTime(0),
                    leftText = step.getLabelMajor(leftTime),
                    // upper bound estimation
                    widthText = leftText.length * (this.props.majorCharWidth || 10) + 10; // eslint-disable-line react/prop-types

                if (xFirstMajorLabel == undefined || widthText < xFirstMajorLabel) {
                    this._repaintMajorText(0, leftText, orientation, className + " left-label");
                }
            }

            // Cleanup leftover DOM elements from the redundant list
            util.forEach(this.dom.redundant, function(arr) {
                while (arr.length) {
                    let elem = arr.pop();
                    if (elem && elem.parentNode) {
                        elem.parentNode.removeChild(elem);
                    }
                }
            });
        };
    }

    componentDidUpdate(prevProps) {
        this.items = this.getTimelineItems();

        this.timeline.setData({
            items: this.items
        });
        let currDate = this.props.date;
        // let prevDate = prevProps.date;
        let currRes = this.props.dateSliderTimeResolution.get("resolution");
        let prevRes = prevProps.dateSliderTimeResolution.get("resolution");

        // If date resolution has changed, configure timeline for the new resolution
        if (prevRes !== currRes) {
            // Calculate new start, end window, set new timeAxis values
            let { start, end } = this.calculateTimelineRange(moment(currDate));
            this.timeline.setOptions({
                timeAxis: {
                    scale: VIS_SCALE_SIZES[currRes],
                    step: 1
                },
                start: start,
                end: end
            });

            // Focus on first item in dataset for now
            let firstItem = this.items.min("start");
            if (firstItem) {
                this.focusOnItem(firstItem.id);
            }
        }
    }

    getTimelineOptions() {
        // Calculate start and end timeline date window using appDate
        let appDate = moment(this.props.date);
        let { start, end } = this.calculateTimelineRange(appDate);
        let dateResolution = this.props.dateSliderTimeResolution.get("resolution");

        return {
            type: "point",
            showCurrentTime: false,
            showTooltips: false,
            zoomable: false,
            selectable: true,
            template: this.getTimelineTooltipFunc(),
            start: start, // Start date of timeline date range window
            end: end, // End date of timeline date range window
            height: "60px",
            min: MIN_DATE_MOMENT, // Min date of timeline
            max: MAX_DATE_MOMENT, // Max date of timeline
            width: "100%",
            timeAxis: {
                scale: VIS_SCALE_SIZES[dateResolution],
                step: 1
            },
            onInitialDrawComplete: () => {
                this.handleInitialDraw();
            }
        };
    }

    getContainerWidth() {
        return this.timelineContainerStylesRef.clientWidth - CONTAINER_MARGIN;
    }

    initializeTimelineListeners() {
        // this.timeline.on("click", props => {
        //     this.handleTimelineClick(props);
        // });

        this.timeline.on("rangechange", props => {
            this.handleTimelineDragging(props);
        });

        this.timeline.on("rangechanged", props => {
            this.handleTimelineDrag(props);
        });

        // this.timeline.on("itemover", props => {
        //     this.handleItemHoverOver(props);
        // });

        // this.timeline.on("itemout", props => {
        //     this.handleItemHoverOut(props);
        // });

        this.timeline.on("select", props => {
            this.handleItemSelect(props);
        });
    }

    handleWindowResize(evt) {
        this.resizeTimeline();
    }

    getTimelineItems() {
        // let appDate = moment(this.props.date);
        // let currentDateItem = { id: CURR_DATE_ITEM_ID, start: appDate };
        // this.props.dateSliderTimeResolution.get("resolution")
        // let resolution = VIS_SCALE_SIZES[this.props.dateSliderTimeResolution.get("resolution")];
        let resolution = this.props.dateSliderTimeResolution.get("resolution");
        let items = this.props.searchResults.reduce((acc, x) => {
            let datetime = moment(x.get("datetime"));
            let dateBin = "";
            let itemStart = "";

            // Determine date at precision of resolution
            switch (resolution) {
                case appStrings.SECONDS:
                    dateBin = dateBin = dateBin =
                        datetime.year() +
                        "_" +
                        datetime.month() +
                        "_" +
                        datetime.date() +
                        "_" +
                        datetime.hours() +
                        "_" +
                        datetime.minutes() +
                        "_" +
                        datetime.seconds();
                    itemStart = datetime.startOf("second");
                    break;
                case appStrings.MINUTES:
                    dateBin = dateBin =
                        datetime.year() +
                        "_" +
                        datetime.month() +
                        "_" +
                        datetime.date() +
                        "_" +
                        datetime.hours() +
                        "_" +
                        datetime.minutes();
                    itemStart = datetime.startOf("minute");
                    break;
                case appStrings.HOURS:
                    dateBin =
                        datetime.year() +
                        "_" +
                        datetime.month() +
                        "_" +
                        datetime.date() +
                        "_" +
                        datetime.hours();
                    itemStart = datetime.startOf("hour");
                    break;
                case appStrings.DAYS:
                    dateBin = datetime.year() + "_" + datetime.month() + "_" + datetime.date();
                    itemStart = datetime.startOf("day");
                    break;
                case appStrings.MONTHS:
                    dateBin = datetime.year() + "_" + datetime.month();
                    itemStart = datetime.startOf("month");
                    break;
                case appStrings.YEARS:
                    dateBin = datetime.year();
                    itemStart = datetime.startOf("year");
                    break;
                default:
                    console.warn("Warning: date resolution:", resolution, " not recognized");
                    break;
            }
            if (!acc.has(dateBin)) {
                acc = acc.set(dateBin, {
                    start: itemStart,
                    title: datetime.format(this.props.dateSliderTimeResolution.get("format")),
                    content: "",
                    // hover: false,
                    selected: false,
                    className: styles.defaultItem,
                    id: dateBin,
                    plumes: [],
                    plumeStatistics: {
                        avg: {
                            value: 0,
                            label: "kg/m<sup>2</sup>"
                        }
                    }
                });
            }
            acc = acc.update(dateBin, bin => {
                bin.plumes.push(x);
                return bin;
            });
            return acc;
        }, Immutable.Map());

        // Compute some statistics
        items = items.map(x => {
            let avg =
                x.plumes
                    .map(p => MetadataUtil.getPlumeIME(p))
                    .reduce((acc, i) => (acc += parseFloat(i)), 0) / x.plumes.length;
            x.plumeStatistics.avg.value = MiscUtilExtended.roundTo(avg, 1);
            return x;
        });

        // let items = this.props.searchResults.map(x => {
        //     let datetime = moment(x.get("datetime"));
        //     return {
        //         start: datetime,
        //         title: MiscUtilExtended.formatPlumeDatetime(datetime),
        //         content: "",
        //         hover: false,
        //         className: styles.defaultItem,
        //         id: x.get("id")
        //     };
        // });
        return new DataSet(items.toArray());
    }

    handleInitialDraw() {
        window.requestAnimationFrame(() => {
            // Redraw timeline after initial draw to adjust for actual size
            // since sibling DOM elements may have not been rendered at time of
            // initial timeline width calculation
            this.resizeTimeline();

            // Focus on appDate item
            // this.focusOnItem(CURR_DATE_ITEM_ID);

            this.timeline.redraw();
        });
    }

    handleTimelineDragging(props) {
        // this.setTimelineClassActive(styles.timelineDragging, true);
    }

    handleTimelineDrag(props) {
        // let visibleItems = this.timeline.getVisibleItems();
        let dataRange = this.timeline.getDataRange();
        // let timelineWindow = this.timeline.getWindow();
        if (props.start > dataRange.min) {
            // Show left jumper
            this.jumperLeft.classList.remove(styles.timelineJumperHidden);
        } else {
            this.jumperLeft.classList.add(styles.timelineJumperHidden);
            // Hide left jumper
        }
        if (props.end < dataRange.max) {
            // Show right jumper
            this.jumperRight.classList.remove(styles.timelineJumperHidden);
        } else {
            // Hide right jumper
            this.jumperRight.classList.add(styles.timelineJumperHidden);
        }
    }

    // handleItemHoverOver(props) {
    //     let item = this.items.get(props.item);
    // }

    // handleItemHoverOut(props) {
    //     let item = this.items.get(props.item);
    // }

    handleItemSelect(props) {
        // Clear old
        let item = this.items.get(props.items[0]);
        // Only operate on single plume data points
        if (item.plumes.length === 1) {
            this.props.mapActionsMSF.toggleFeatureLabel(
                layerSidebarTypes.CATEGORY_PLUMES,
                item.plumes[0]
            );
            this.items.update({ id: props.items[0], selected: true });
            this.timeline.setSelection(props.items[0]);
        }
    }

    getItemSnappingFunc() {
        return (date, scale, step) => {
            // snap to nearest second for smooth dragging
            let millisecond = 1000;
            return Math.round(date / millisecond) * millisecond;
        };
    }

    getTimelineTooltipFunc() {
        return (item, element, data) => {
            // Create tooltip by adding an element to item content
            let tooltipClasses = MiscUtil.generateStringFromSet({
                [styles.dotTooltip]: true
                // [styles.dotTooltipHidden]: !data.hover
            });
            let dotClasses = MiscUtil.generateStringFromSet({
                [styles.dot]: true,
                [styles.dotSelected]: data.selected
            });
            let plumeTitle = "";
            let plumeSubtitle = "";
            if (data.plumes.length === 1) {
                plumeTitle = MiscUtilExtended.formatPlumeDatetime(data.plumes[0].get("datetime"));
                // • or · ?
                plumeSubtitle = `${data.plumes.length} plume • ${data.plumeStatistics.avg.value} ${
                    data.plumeStatistics.avg.label
                }`;
            } else {
                plumeTitle = data.title;
                plumeSubtitle = `${data.plumes.length} plumes • ${data.plumeStatistics.avg.value} ${
                    data.plumeStatistics.avg.label
                } avg`;
            }
            // TODO get rid of hover data update and just use css
            return `<div><div class='${dotClasses}'></div><div class='${tooltipClasses}'><div class='${
                styles.dotTooltipTitle
            }'>${plumeTitle}</div><div class='${
                styles.dotTooltipSubtitle
            }'>${plumeSubtitle}</div></div></div>`;
        };
    }

    // setTimelineClassActive(classStr, active) {
    //     // Set dragging class on the axis
    //     let axis = this.getTimelineContainerStylesNode();
    //     if (active) {
    //         axis.classList.add(classStr);
    //     } else {
    //         axis.classList.remove(classStr);
    //     }
    // }

    checkItemInView(itemId, options = {}) {
        return new Promise((resolve, reject) => {
            window.requestAnimationFrame(() => {
                let item = this.items.get(itemId);
                if (item) {
                    let { start, end } = this.timeline.getWindow();
                    let axisStep = this.timeline.timeAxis.step;
                    let bufferScale =
                        typeof options.bufferScale !== "undefined" ? options.bufferScale : 0.75;
                    let min = moment(start).add(axisStep.step * bufferScale, axisStep.scale);
                    let max = moment(end).subtract(axisStep.step * bufferScale, axisStep.scale);
                    let date = moment(item.start);
                    if (date.isBefore(min)) {
                        resolve({ left: true, right: false });
                    } else if (date.isAfter(max)) {
                        resolve({ left: false, right: true });
                    } else {
                        resolve({ left: false, right: false });
                    }
                }
            });
        });
    }

    bringItemIntoView(itemId, options = {}) {
        this.checkItemInView(itemId, options).then(
            data => {
                let duration = typeof options.duration !== "undefined" ? options.duration : 0;
                let item = this.timeline.itemsData.get(itemId);
                if (item) {
                    let { start, end } = this.timeline.getWindow();
                    let windowSizeMs = end - start;
                    if (data.left) {
                        let newStart = moment(item.start).subtract(
                            windowSizeMs * ITEM_SCROLL_OFFSET,
                            "milliseconds"
                        );
                        let newEnd = newStart.clone().add(windowSizeMs, "milliseconds");
                        this.timeline.setWindow(newStart, newEnd, {
                            animation: duration === 0 ? false : { duration: duration }
                        });
                    } else if (data.right) {
                        let newEnd = moment(item.start).add(
                            windowSizeMs * ITEM_SCROLL_OFFSET,
                            "milliseconds"
                        );
                        let newStart = newEnd.clone().subtract(windowSizeMs, "milliseconds");
                        this.timeline.setWindow(newStart, newEnd, {
                            animation: duration === 0 ? false : { duration: duration }
                        });
                    }
                } else {
                    console.warn(
                        "Error in TimelineContainerStyles.bringItemIntoView: failed to find item with id ",
                        itemId
                    );
                }
            },
            err => {
                console.warn("Error in TimelineContainerStyles.bringItemIntoView: ", err);
            }
        );
    }

    focusOnItem(itemId, duration = 0) {
        this.timeline.focus(itemId, { animation: duration === 0 ? false : { duration: duration } });
    }

    resizeTimeline() {
        this.timelineContainerStylesWidth = this.getContainerWidth();
        let { start, end } = this.calculateTimelineRange(moment(this.timeline.getWindow().start));
        this.timeline.setOptions({ start: start, end: end });
    }

    snapDate(date, resolution, clamp = true) {
        let newDate = moment(date);

        // Round to nearest date based on resolution
        switch (resolution) {
            case appStrings.SECONDS:
                if (newDate.milliseconds() >= 500) {
                    newDate.add(1, "second");
                }
                newDate = newDate.startOf("second");
                break;
            case appStrings.MINUTES:
                if (newDate.seconds() >= 30) {
                    newDate.add(1, "minute");
                }
                newDate = newDate.startOf("minute");
                break;
            case appStrings.HOURS:
                if (newDate.minutes() >= 30) {
                    newDate.add(1, "hour");
                }
                newDate = newDate.startOf("hour");
                break;
            case appStrings.DAYS:
                if (newDate.hour() >= 12) {
                    newDate.add(1, "day");
                }
                newDate = newDate.startOf("day");
                break;
            case appStrings.MONTHS:
                if (newDate.date() >= newDate.daysInMonth() / 2) {
                    newDate.add(1, "month");
                }
                newDate = newDate.startOf("month");
                break;
            case appStrings.YEARS:
                if (newDate.month() >= 5) {
                    newDate.add(1, "year");
                }
                newDate = newDate.startOf("year");
                break;
            default:
                console.warn("Warning: date snap resolution:", resolution, " not recognized");
                break;
        }
        if (clamp) {
            return this.clampDate(newDate);
        }
        return newDate;
    }

    // maskDate(date, mDate, resolution) {
    //     date = moment(date);
    //     mDate = moment(mDate);
    //     switch (resolution) {
    //         case appStrings.SECONDS:
    //             date.second(mDate.second());
    //         // falls through
    //         case appStrings.MINUTES:
    //             date.minute(mDate.minute());
    //         // falls through
    //         case appStrings.HOURS:
    //             date.hour(mDate.hour());
    //         // falls through
    //         case appStrings.DAYS:
    //             date.month(mDate.month()); // handle 31/30 day wrap
    //             date.date(mDate.date());
    //         // falls through
    //         case appStrings.MONTHS:
    //             date.month(mDate.month());
    //         // falls through
    //         case appStrings.YEARS:
    //             date.year(mDate.year());
    //             break;
    //         default:
    //             console.warn("Error in TimeAxis.maskDate: unknown date resolution. ", resolution);
    //     }
    //     return date;
    // }

    jumpToNearest(direction) {
        // let visibleItems = this.timeline.getVisibleItems();
        let { start, end } = this.timeline.getWindow();
        // this.items.
        let nearestItem;
        if (direction === "left") {
            // Find first item to the left of the timeline window
            this.items.map(item => {
                if (item.start < start) {
                    if (!nearestItem) {
                        nearestItem = item;
                    } else {
                        if (item.start > nearestItem.start) {
                            nearestItem = item;
                        }
                    }
                }
            });
        } else if (direction === "right") {
            // Find first item to the right of the timeline window
            this.items.map(item => {
                if (item.start > end) {
                    if (!nearestItem) {
                        nearestItem = item;
                    } else {
                        if (item.start < nearestItem.start) {
                            nearestItem = item;
                        }
                    }
                }
            });
        }
        if (nearestItem) {
            this.bringItemIntoView(nearestItem.id, { duration: 250 });
            // this.focusOnItem(nearestItem.id, 250);
        }
    }

    clampDate(date) {
        let newDate = moment(date);
        // Clamp date to min and max dates of appConfig
        if (newDate.isAfter(appConfig.MAX_DATE)) {
            return MAX_DATE_MOMENT;
        } else if (newDate.isBefore(appConfig.MIN_DATE)) {
            return MIN_DATE_MOMENT;
        }
        return newDate;
    }

    calculateTimelineRange(start) {
        let binWidth = 30; // Pixel width of each tick bin (for Days)
        let end = start
            .clone()
            .add(
                this.timelineContainerStylesWidth /
                    binWidth *
                    BIN_SIZES_MS[this.props.dateSliderTimeResolution.get("resolution")]
            );
        return { start: start, end: end };
    }

    getTimelineContainerStylesNode() {
        return document.getElementsByClassName(styles.container)[0];
    }

    isActiveFeature(feature) {
        return (
            this.props.activeFeature.get("category") === layerSidebarTypes.CATEGORY_PLUMES &&
            feature.get("id") === this.props.activeFeature.getIn(["feature", "id"])
        );
    }

    render() {
        let stepSizeClass =
            styles["stepSize_" + this.props.dateSliderTimeResolution.get("resolution")];
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.elementsContainer]: true
        });
        let timelineClasses = MiscUtil.generateStringFromSet({
            [styles.timeline]: true,
            [stepSizeClass]: true
        });
        return (
            <div className={containerClasses}>
                <div className={styles.timelineBackground}>
                    <div
                        onClick={() => this.jumpToNearest("left")}
                        className={styles.timelineJumperLeft}
                        ref={ref => (this.jumperLeft = ref)}
                    >
                        <Button color="contrast">
                            <KeyboardArrowLeftIcon />
                        </Button>
                    </div>
                    <div className={styles.container}>
                        <div
                            className={timelineClasses}
                            ref={ref => (this.timelineContainerStylesRef = ref)}
                        />
                    </div>
                    <div
                        onClick={() => this.jumpToNearest("right")}
                        className={styles.timelineJumperRight}
                        ref={ref => (this.jumperRight = ref)}
                    >
                        <Button color="contrast">
                            <KeyboardArrowRightIcon />
                        </Button>
                    </div>
                    <div className={styles.resolutionStepWrapper}>
                        <ResolutionStep />
                    </div>
                </div>
            </div>
        );
    }
}

TimelineContainerStyles.propTypes = {
    date: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    searchResults: PropTypes.object.isRequired,
    activeFeature: PropTypes.object.isRequired,
    dateSliderTimeResolution: PropTypes.object.isRequired,
    mapActionsMSF: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        date: state.map.get("date"),
        activeFeature: state.map.get("activeFeature"),
        searchResults: state.layerSidebar.getIn([
            "searchState",
            layerSidebarTypes.CATEGORY_PLUMES,
            "searchResults"
        ]),
        dateSliderTimeResolution: state.dateSlider.get("resolution")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsMSF: bindActionCreators(mapActionsMSF, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineContainerStyles);
