import React from "react";
import PropTypes from "prop-types";
import { MenuItem, MenuList } from "material-ui/Menu";
import { FormControl, FormHelperText } from "material-ui/Form";
import Paper from "material-ui/Paper";
import Input, { InputLabel } from "material-ui/Input";
import Select from "material-ui/Select";
import { ListItemText } from "material-ui/List";
import { withStyles } from "material-ui/styles";
import styles from "_core/components/Settings/BaseMapList.scss";
require("_core/styles/resources/img/no_tile.png");

const BaseMapList = props => {
    return (
        <Paper>
            <MenuList dense>
                {props.items.map(x => (
                    <MenuItem
                        onClick={() => props.onClick(x.value)}
                        value={x.value}
                        key={x.value}
                        selected={props.value === x.value}
                        className={styles.menuItemRoot}
                    >
                        <img
                            src={x.thumbnailImage ? x.thumbnailImage : "img/no_tile.png"}
                            className={styles.preview}
                            alt="basemap preview image"
                        />
                        <ListItemText inset style={{ padding: "0px" }} primary={x.label} />
                    </MenuItem>
                ))}
            </MenuList>
        </Paper>
    );
};

BaseMapList.propTypes = {
    value: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired
};

export default BaseMapList;
