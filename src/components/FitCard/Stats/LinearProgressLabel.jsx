import React from "react";
import {
  LinearProgress,
  Typography,
  Grid,
  withStyles,
} from "@material-ui/core";
import { useCallback } from "react";

export default function LinearProgressLabel(props) {
  const LinearProgressFixed = useCallback(
    withStyles(() => ({
      root: {
        width: "100%",
        height: "100%",
        backgroundColor: !!props.backgroundColor
          ? props.backgroundColor
          : "#ffffff",
      },
      bar: {
        backgroundColor: !!props.color ? props.color : "#ffffff",
      },
    }))(LinearProgress),
    [props.backgroundColor, props.color]
  );

  return (
    <Grid style={{ height: 20, position: "relative" }}>
      <Grid
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <LinearProgressFixed
          style={{
            width: "100%",
            height: "100%",
          }}
          variant="determinate"
          value={props.value}
        />
      </Grid>
      <Grid
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.Icon}
        <Typography
          style={{
            fontSize: 12,
            color: "#ffffff",
          }}
          {...props.typographyProps}
        >
          {props.label}
        </Typography>
      </Grid>
    </Grid>
  );
}
