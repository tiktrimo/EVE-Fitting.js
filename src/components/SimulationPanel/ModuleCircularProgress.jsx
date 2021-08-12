import {
  Button,
  CircularProgress,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

const useStyles = (duration) =>
  makeStyles((theme) => ({
    circularProrgess: {
      position: "absolute",
      left: 8,
      top: 2,
    },
    circularTransition: {
      transition: theme.transitions.create("stroke-dashoffset", {
        easing: "linear",
        duration: `${duration}s`,
      }),
    },
  }));

export default function ModuleCircularProgress(props) {
  const classes = useStyles(props.summary.activationInfo.duration)();
  const theme = useTheme();

  const [activationCounter, setActivationCounter] = useState(0);
  const [flip, setFlip] = useState(false);

  useInterval(
    () => {
      if (props.summary.activationState.isActive == true) {
        setActivationCounter(activationCounter + 100);
        setFlip(!flip);
      }
    },
    props.summary.activationState.isActive
      ? props.summary.activationInfo.duration * 1000
      : null
  );

  return (
    <React.Fragment>
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color: !flip
            ? theme.palette.background.paper
            : theme.palette.text.primary,
        }}
        className={classes.circularProrgess}
        classes={{
          circleStatic: classes.circularTransition,
        }}
        variant="static"
        value={activationCounter}
      />
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color: flip
            ? theme.palette.background.paper
            : theme.palette.text.primary,
        }}
        className={classes.circularProrgess}
        classes={{
          circleStatic: classes.circularTransition,
        }}
        variant="static"
        value={activationCounter + 100}
      />
    </React.Fragment>
  );
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      tick();
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
