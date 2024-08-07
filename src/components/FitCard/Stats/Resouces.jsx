import React, { useEffect } from "react";
import {
  makeStyles,
  Grid,
  Tooltip,
  List,
  ListItem,
  Collapse,
  useTheme,
} from "@material-ui/core";
import { useState } from "react";
import LinearProgressLabel from "./LinearProgressLabel";
import {
  TurretIcon,
  LauncherIcon,
  CalibrationIcon,
  DroneBayIcon,
  DroneBandwidthIcon,
} from "../../Icons/resourceIcons";
import Stat from "./services/Stat";
import { useCallback } from "react";
import ResourcesMiscellaneousListItem from "./ResourcesMiscellaneousListItem";
import { useRef } from "react";

const TurretHardpoint = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      Icon={
        <Tooltip title="Turret Hardpoints" placement="left" arrow>
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
const LauncherHardpoint = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      Icon={
        <Tooltip title="Launcher Hardpoints" placement="left" arrow>
          <div style={{ height: 24 }}>
            <LauncherIcon color={theme.palette.text.primary} />
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
const Calibration = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={0}
      label={props.label}
      Icon={
        <Tooltip title="Calibration" placement="left" arrow>
          <div style={{ height: 24 }}>
            <CalibrationIcon color={theme.palette.text.primary} />
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
const DroneBandwidth = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={props.value}
      label={props.label}
      Icon={
        <Tooltip title="Drone Bandwidth" placement="left" arrow>
          <div style={{ height: 24 }}>
            <DroneBandwidthIcon
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
const DroneBay = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={props.value}
      label={props.label}
      Icon={
        <Tooltip title="Drone Bay" placement="left" arrow>
          <div style={{ height: 24 }}>
            <DroneBayIcon
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
    width: "100%",
    padding: "0px 0px 0px 0px",
  },
  expand: {
    transform: "rotate(0deg)",
    right: "10%",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    right: "10%",
    transform: "rotate(180deg)",
  },
  nested: {
    padding: 0,
    margin: 0,
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function Hardpoints(props) {
  const classes = useStyles();
  const widthRef = useRef(null);

  const [open, setOpen] = useState(true);
  const [load, setLoad] = useState(Stat.defaultStat.resource.load);
  const [capacity, setCapacity] = useState(Stat.defaultStat.resource.capacity);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    setIsCompact(widthRef.current?.offsetWidth < 400);
  }, [widthRef.current?.offsetWidth]);

  useEffect(() => {
    setLoad(props.stat.resource.load);
    setCapacity(props.stat.resource.capacity);
  }, [props.stat]);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <React.Fragment>
      <List className={classes.root}>
        <ListItem
          innerRef={widthRef}
          className={classes.rootChild}
          dense
          onClick={handleClick}
        >
          <Grid container item alignContent="center">
            <Grid item xs={isCompact ? 4 : 2}>
              <TurretHardpoint label={`${load.turret}/${capacity.turret}`} />
            </Grid>
            <Grid item xs={isCompact ? 4 : 2}>
              <LauncherHardpoint
                label={`${load.launcher}/${capacity.launcher}`}
              />
            </Grid>

            <Grid item xs={isCompact ? 4 : 2}>
              <Calibration
                label={`${load.calibration}/${capacity.calibration}`}
              />
            </Grid>

            <Grid item xs={isCompact ? 6 : 3}>
              <DroneBay
                value={load.droneBay / capacity.droneBay}
                label={`${load.droneBay}/${capacity.droneBay}m3`}
                isError={load.droneBay > capacity.droneBay}
              />
            </Grid>
            <Grid item xs={isCompact ? 6 : 3}>
              <DroneBandwidth
                value={load.droneBandwidth / capacity.droneBandwidth}
                label={`${load.droneBandwidth}/${capacity.droneBandwidth}Mbit/s`}
                isError={load.droneBandwidth > capacity.droneBandwidth}
              />
            </Grid>
          </Grid>
        </ListItem>
        <Collapse in={open} timeout="auto">
          <ResourcesMiscellaneousListItem stat={props.stat} />
        </Collapse>
      </List>
    </React.Fragment>
  );
}
