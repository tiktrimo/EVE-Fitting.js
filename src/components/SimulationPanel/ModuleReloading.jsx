import React from "react";
import { CircularProgress, makeStyles, useTheme } from "@material-ui/core";
import { useState } from "react";
import { useLazyActivationInterval } from "../../services/intervalHooks";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  circularProrgess: {
    position: "absolute",
    left: 8,
    top: 2,
  },
  circularTransition: (duration) => ({
    transition: theme.transitions.create("stroke-dashoffset", {
      easing: "linear",
      duration: `${duration}s`,
    }),
  }),
  hiddenCircularTransition: {
    transition: theme.transitions.create("stroke-dashoffset", {
      easing: "linear",
      duration: `0s`,
    }),
  },
}));

export default /* React.memo( */ function ModuleReloading(props) {
  const theme = useTheme();
  const classes = useStyles(
    props.moduleSet[0].summary.activationInfo.reloadTime
  );

  const [forceReset, setForceReset] = useState(false);
  const [reloadTimer, setActivationCounter] = useState(0);
  const [flip, setFlip] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);

  useEffect(() => {
    if (isStartReload(props)) {
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

  useLazyActivationInterval(
    () => {
      // Ancillary booster/repairer
      if (props.moduleSet[0].summary.activationInfo.isChargeNegligible)
        props.dispatchSummaries({
          type: "summary_update_item",
          payload: { moduleSet: props.moduleSet },
        });

      // dispatch activation count
      props.dispatchSummaries({
        type: "activationLeft_active_charge",
        payload: { moduleSet: props.moduleSet },
      });
    },
    getReloadTime(props),
    forceReset
  );

  useEffect(() => {
    setForceReset(!forceReset);
    setIsProgressing(false);
    props.setIsReloading(false);
  }, [props.updateFlag]);

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
} /* , compareFunc); */
function compareFunc(prev, next) {
  if (
    (prev.moduleSet[0].summary.activationState.isActive === true &&
      next.moduleSet[0].summary.activationState.activationLeft === 0) ||
    prev.updateFlag !== next.updateFlag
  )
    return false;
  return Object.keys(prev).every((key) => prev[key] === next[key]);
}

function getReloadTime(props) {
  if (isStartReload(props))
    return props.moduleSet[0].summary.activationInfo.reloadTime * 1000;

  return null;
}

function isStartReload(props) {
  if (props.moduleSet[0].summary.activationState.isActive === true)
    return false;
  return (
    props.moduleSet[0].summary.activationState.activationLeft === 0 ||
    (props.moduleSet[0].summary.activationInfo.isChargeNegligible &&
      props.moduleSet[0].summary.activationState.activationLeft === Infinity)
  );
}
