import React from "react";
import PropTypes from "prop-types";
import { MenuItem } from "material-ui/Menu";
import { FormControl, FormHelperText } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import Select from "material-ui/Select";
import { withStyles } from "material-ui/styles";
import styles from "_core/components/Settings/BaseMapDropdown.scss";
require("_core/styles/resources/img/no_tile.png");

const BaseMapDropdown = props => {
    return (
        <FormControl fullWidth>
            <InputLabel shrink={true} htmlFor="basemap-select">
                Basemap
            </InputLabel>
            <Select
                value={props.value}
                onChange={props.onChange}
                input={<Input name="Basemap" id="basemap-select" />}
                displayEmpty={true}
                classes={{
                    selectMenu: styles.selectMenu,
                    icon: styles.selectMenuIcon
                }}
            >
                {props.items.map(x => (
                    <MenuItem value={x.value} key={x.value} className={styles.menuItemRoot}>
                        <img
                            src={x.thumbnailImage ? x.thumbnailImage : "img/no_tile.png"}
                            className={styles.preview}
                            alt="basemap preview image"
                        />
                        <span style={{ lineHeight: "54px" }}>{x.label}</span>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

BaseMapDropdown.propTypes = {
    value: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};

export default BaseMapDropdown;
