import React, { useState, useEffect, useCallback } from "react";
import LinearProgressLabel from "./LinearProgressLabel";
import { alphaSVG, DroneDamageSVG } from "../../Icons/damageIcons";
import { turretSVG } from "../../Icons/resourceIcons";
import {
  Tooltip,
  Grid,
  makeStyles,
  Collapse,
  ListItem,
  List,
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import DamageRangeListItem from "./DamageRangeListItem";

const WeaponDps = (props) => {
  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      backgroundColor={"#ffffff"}
      Icon={
        <Tooltip title="Weapon DPS" placement="left" arrow>
          {turretSVG}
        </Tooltip>
      }
      typographyProps={{
        style: { fontSize: 14, fontWeight: 700, color: "#000000" },
      }}
    />
  );
};
const WeaponAlpha = (props) => {
  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      backgroundColor={"#ffffff"}
      Icon={
        <Tooltip title="Alpha Damage" placement="left" arrow>
          {alphaSVG}
        </Tooltip>
      }
      typographyProps={{
        style: { fontSize: 14, fontWeight: 700, color: "#000000" },
      }}
    />
  );
};
const DroneDps = (props) => {
  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      backgroundColor={"#ffffff"}
      Icon={
        <Tooltip title="Drone DPS" placement="left" arrow>
          <div style={{ height: 24 }}>
            <DroneDamageSVG color={props.isError ? red[500] : "#000000"} />
          </div>
        </Tooltip>
      }
      typographyProps={{
        style: {
          fontSize: 14,
          fontWeight: 700,
          color: props.isError ? red[500] : "#000000",
        },
      }}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: 0,
    margin: 0,
  },
  rootChild: {
    height: 20,
    width: "100%",
    padding: "0px 0px 0px 0px",
  },

  nested: {
    padding: 0,
    margin: 0,
  },
}));

export default function Damage(props) {
  const classes = useStyles();

  const [open, setOpen] = useState(true);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <Grid container>
      <List className={classes.root}>
        <ListItem className={classes.rootChild} dense onClick={handleClick}>
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <WeaponDps
              label={`${props.stat.damage.turretLauncherDamage.effective.toFixed(
                0
              )}`}
            />
          </Grid>
          <Grid item xs={2}>
            <WeaponAlpha
              label={`${props.stat.damage.turretLauncherDamage.alpha.toFixed(
                0
              )}`}
            />
          </Grid>
          <Grid item xs={4}>
            <DroneDps
              label={`${props.stat.damage.droneDamage.max.toFixed(0)}`}
              isError={
                props.stat.resource.load.droneActive >
                props.stat.resource.capacity.droneActive
              }
            />
          </Grid>
          <Grid item xs={1}></Grid>
        </ListItem>
        <Collapse in={open} timeout="auto">
          <DamageRangeListItem stat={props.stat} />
        </Collapse>
      </List>
    </Grid>
  );
}
