import React from "react";
import { CircularProgress, makeStyles, useTheme } from "@material-ui/core";
import { useState } from "react";
import { useLazyActivationInterval } from "../../services/intervalHooks";

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

export default function ModuleReloading(props) {
  const classes = useStyles(
    props.moduleSet[0].summary.activationInfo.reloadTime
  )();
  const theme = useTheme();

  const [reloadTimer, setActivationCounter] = useState(0);
  const [flip, setFlip] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);

  useLazyActivationInterval(() => {
    //reloaded
    console.log("reloaded");
    props.setIsReloading(false);
    setIsProgressing(false);

    // dispatch activation count
    props.dispatchSummaries({
      type: "activationLeft_active_charge",
      payload: { moduleSet: props.moduleSet },
    });
  }, getReloadDelay(props.moduleSet[0].summary));

  useLazyActivationInterval(() => {
    //reloading
    console.log("reloading");
    if (props.moduleSet[0].summary.activationState.activationLeft === 0) {
      setActivationCounter(reloadTimer - 100);
      setFlip(!flip);
      setIsProgressing(true);
      props.setIsReloading(true);
    } else setIsProgressing(false);
  }, getReloadDuration(props));

  return (
    <React.Fragment>
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !isProgressing || flip ? "transparent" : theme.palette.text.primary,
        }}
        className={classes.circularProrgess}
        classes={{
          circleStatic: classes.circularTransition,
        }}
        variant="static"
        value={reloadTimer}
      />
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !isProgressing || !flip
              ? "transparent"
              : theme.palette.text.primary,
        }}
        className={classes.circularProrgess}
        classes={{
          circleStatic: classes.circularTransition,
        }}
        variant="static"
        value={reloadTimer + 100}
      />
    </React.Fragment>
  );
}

function getReloadDuration(props) {
  return props.moduleSet[0].summary.activationState.activationLeft === 0
    ? props.moduleSet[0].summary.activationInfo.duration * 1000
    : null;
}
function getReloadDelay(summary) {
  return summary.activationState.activationLeft === 0
    ? (summary.activationInfo.reloadTime + summary.activationInfo.duration) *
        1000
    : null;
}
