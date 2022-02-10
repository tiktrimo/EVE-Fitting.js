import React from "react";
import { CircularProgress, makeStyles, useTheme } from "@material-ui/core";
import { useState } from "react";
import { useLazyActivationInterval } from "../../services/intervalHooks";
import { useEffect } from "react";

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
    hiddenCircularTransition: {
      transition: theme.transitions.create("stroke-dashoffset", {
        easing: "linear",
        duration: `0s`,
      }),
    },
  }));

export default function ModuleReloading(props) {
  const theme = useTheme();
  const classes = useStyles(
    props.moduleSet[0].summary.activationInfo.reloadTime
  )();

  const [reloadTimer, setActivationCounter] = useState(0);
  const [flip, setFlip] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);

  useEffect(() => {
    if (
      props.moduleSet[0].summary.activationState.activationLeft === 0 &&
      props.moduleSet[0].summary.activationState.isActive === false
    ) {
      setActivationCounter(reloadTimer - 100);
      setFlip(!flip);
      setIsProgressing(true);
      props.setIsReloading(true);
    } else {
      setIsProgressing(false);
      props.setIsReloading(false);
    }
  }, [
    props.moduleSet[0].summary.activationState.isActive,
    props.moduleSet[0].summary.activationState.activationLeft,
  ]);

  useLazyActivationInterval(() => {
    //reloaded
    console.log("reloaded");

    // dispatch activation count
    props.dispatchSummaries({
      type: "activationLeft_active_charge",
      payload: { moduleSet: props.moduleSet },
    });
  }, getReloadTime(props));

  return (
    <React.Fragment>
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !isProgressing || flip
              ? "transparent"
              : theme.palette.action.disabled,
        }}
        className={classes.circularProrgess}
        classes={{
          circleDeterminate: flip
            ? classes.hiddenCircularTransition
            : classes.circularTransition,
        }}
        variant="determinate"
        value={reloadTimer}
      />
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !isProgressing || !flip
              ? "transparent"
              : theme.palette.action.disabled,
        }}
        className={classes.circularProrgess}
        classes={{
          circleDeterminate: !flip
            ? classes.hiddenCircularTransition
            : classes.circularTransition,
        }}
        variant="determinate"
        value={reloadTimer + 100}
      />
    </React.Fragment>
  );
}
function getReloadTime(props) {
  if (
    props.moduleSet[0].summary.activationState.activationLeft === 0 &&
    props.moduleSet[0].summary.activationState.isActive === false
  )
    return props.moduleSet[0].summary.activationInfo.reloadTime * 1000;

  return null;
}
