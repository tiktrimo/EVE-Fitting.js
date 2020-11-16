import React from "react";
import {
  LinearProgress,
  Typography,
  Grid,
  withStyles,
  useTheme,
  makeStyles,
} from "@material-ui/core";
import { useCallback } from "react";

const useStyles = makeStyles((theme) => ({
  rootGrid: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  progress: {
    width: "100%",
    height: "100%",
  },
  childGrid: {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#ffffff",
  },
}));

export default function LinearProgressLabel(props) {
  const classes = useStyles();
  const theme = useTheme();

  const LinearProgressFixed = useCallback(
    withStyles(() => ({
      root: {
        width: "100%",
        height: "100%",
        backgroundColor: !!props.backgroundColor
          ? props.backgroundColor
          : theme.palette.background.paper,
      },
      bar: {
        backgroundColor: !!props.color
          ? props.color
          : theme.palette.background.paper,
      },
    }))(LinearProgress),
    [props.backgroundColor, props.color, theme]
  );

  return (
    <Grid style={{ height: 20, position: "relative" }}>
      <Grid className={classes.rootGrid}>
        <LinearProgressFixed
          className={classes.progress}
          variant="determinate"
          value={props.value}
        />
      </Grid>
      <Grid className={classes.childGrid}>
        {props.Icon}
        <Typography className={classes.label} {...props.typographyProps}>
          {props.label}
        </Typography>
      </Grid>
    </Grid>
  );
}
