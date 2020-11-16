import React, { useState, useCallback } from "react";
import LinearProgressLabel from "./LinearProgressLabel";
import { AlphaIcon, DroneDamageSVG } from "../../Icons/damageIcons";
import { TurretIcon } from "../../Icons/resourceIcons";
import {
  Tooltip,
  Grid,
  makeStyles,
  Collapse,
  ListItem,
  List,
  useTheme,
} from "@material-ui/core";
import DamageRangeListItem from "./DamageRangeListItem";

const WeaponDps = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      backgroundColor={theme.palette.background.paper}
      Icon={
        <Tooltip title="Weapon DPS" placement="left" arrow>
          <div style={{ height: 24 }}>
            <TurretIcon color={theme.palette.text.primary} />
          </div>
        </Tooltip>
      }
      typographyProps={{
        style: {
          fontSize: 14,
          fontWeight: 700,
          color: theme.palette.text.primary,
        },
      }}
    />
  );
};
const WeaponAlpha = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      backgroundColor={theme.palette.background.paper}
      Icon={
        <Tooltip title="Alpha Damage" placement="left" arrow>
          <div style={{ height: 24 }}>
            <AlphaIcon color={theme.palette.text.primary} />
          </div>
        </Tooltip>
      }
      typographyProps={{
        style: {
          fontSize: 14,
          fontWeight: 700,
          color: theme.palette.text.primary,
        },
      }}
    />
  );
};
const DroneDps = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      backgroundColor={theme.palette.background.paper}
      Icon={
        <Tooltip title="Drone DPS" placement="left" arrow>
          <div style={{ height: 24 }}>
            <DroneDamageSVG
              color={
                props.isError
                  ? theme.palette.property.red
                  : theme.palette.text.primary
              }
            />
          </div>
        </Tooltip>
      }
      typographyProps={{
        style: {
          fontSize: 14,
          fontWeight: 700,
          color: props.isError
            ? theme.palette.property.red
            : theme.palette.text.primary,
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
  const theme = useTheme();

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
