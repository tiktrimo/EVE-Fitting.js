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
  root: {
    height: 20,
    position: "relative",
    width: "100%",
  },
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
  rootProgress: (props) => ({
    width: "100%",
    height: "100%",
    backgroundColor: !!props.backgroundColor
      ? props.backgroundColor
      : theme.palette.background.paper,
  }),
  rootBar: (props) => ({
    backgroundColor: !!props.color
      ? props.color
      : theme.palette.background.paper,
  }),
  dashedBar: (props) => ({
    borderRight: `dashed ${theme.palette.text.primary} 0.1px`,
    backgroundColor: !!props.color
      ? props.color
      : theme.palette.background.paper,
  }),
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
  description: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.palette.text.secondary,
  },
}));

export default function LinearProgressLabel(props) {
  const classes = useStyles(props);

  return (
    <Grid className={classes.root}>
      <Grid className={classes.rootGrid}>
        <LinearProgress
          classes={{
            root: classes.rootProgress,
            bar: !props.showDivider ? classes.rootBar : classes.dashedBar,
          }}
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
        <Typography
          className={classes.description}
          style={{ paddingLeft: !!props.description ? 5 : 0 }}
        >
          {props.description}
        </Typography>
      </Grid>
    </Grid>
  );
}
