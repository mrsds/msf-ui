import Immutable from "immutable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Dialog, { DialogContent } from "material-ui/Dialog";
import { CircularProgress } from "material-ui/Progress";
import List, { ListItem, ListItemText, ListItemIcon } from "material-ui/List";
import Divider from "material-ui/Divider";
import Icon from "material-ui/Icon";
import ErrorOutlineIcon from "material-ui-icons/ErrorOutline";
import AccessTimeIcon from "material-ui-icons/AccessTime";
import Typography from "material-ui/Typography";
import { AsyncImage } from "_core/components/AsyncImage";
import * as actions from "_core/actions/AppActions";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/LayerInfo/LayerInfoContainer.scss";

const defaultData = Immutable.Map({
    title: "Title Unknown",
    platform: "Platform Unknown",
    spatialResolution: "Spatial Resolution Unknown",
    dateRange: "Date Range Unknown",
    description: "Description Unknown"
});

export class LayerInfoContainer extends Component {
    render() {
        let metadata = defaultData.merge(this.props.metadata.get("content"));

        let loadingClasses = MiscUtil.generateStringFromSet({
            [styles.layerInfoLoading]: true,
            [styles.active]: this.props.layerMetadataAsync.get("loading")
        });

        let errorClasses = MiscUtil.generateStringFromSet({
            [styles.layerInfoError]: true,
            [styles.active]:
                !this.props.metadata.get("content") &&
                !this.props.layerMetadataAsync.get("loading") &&
                this.props.layerMetadataAsync.get("failed")
        });

        return (
            <Dialog
                classes={{ paper: styles.paper }}
                open={this.props.isOpen}
                onClose={this.props.actions.closeLayerInfo}
            >
                <DialogContent className={styles.root}>
                    <AsyncImage className={styles.thumbnailImage} src={this.props.thumbnailUrl} />
                    <div className={styles.layerInfoContent}>
                        <div className={loadingClasses}>
                            <CircularProgress className={styles.layerInfoSpinner} />
                        </div>
                        <div className={errorClasses}>
                            <div className={styles.errorContent}>
                                <ErrorOutlineIcon />
                                <Typography type="subheading" color="default">
                                    No Metadata Available
                                </Typography>
                            </div>
                        </div>
                        <Typography type="headline" color="inherit">
                            {metadata.get("title")}
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <Icon>
                                        <i className={styles.layerInfoIcon + " ms ms-satellite"} />
                                    </Icon>
                                </ListItemIcon>
                                <ListItemText
                                    primary={metadata.get("platform")}
                                    secondary="Platform"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Icon>
                                        <i className={styles.layerInfoIcon + " ms ms-merge"} />
                                    </Icon>
                                </ListItemIcon>
                                <ListItemText
                                    primary={metadata.get("spatialResolution")}
                                    secondary="Spatial Resolution"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <AccessTimeIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={metadata.get("dateRange")}
                                    secondary="Date Range"
                                />
                            </ListItem>
                            <Divider />
                        </List>
                        <Typography type="subheading">Description</Typography>
                        <Typography type="body1">{metadata.get("description")}</Typography>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
}

LayerInfoContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    layerId: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    metadata: PropTypes.object.isRequired,
    layerMetadataAsync: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        isOpen: state.layerInfo.get("isOpen"),
        layerId: state.layerInfo.get("activeLayerId"),
        thumbnailUrl: state.layerInfo.get("activeThumbnailUrl"),
        metadata: state.layerInfo.get("metadata"),
        layerMetadataAsync: state.asynchronous.get("layerMetadataAsync")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerInfoContainer);
