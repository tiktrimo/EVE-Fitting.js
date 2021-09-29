import React, { useEffect } from "react";
import {
  Button,
  CircularProgress,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import { useState } from "react";
import {
  useInstaActivationInterval,
  useLazyActivationInterval,
  useProgressCircleInterval,
} from "../../services/intervalHooks";
import Simulator from "../FitCard/Stats/services/Simulator";

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

export default function ModuleActivation(props) {
  const classes = useStyles(
    props.moduleSet[0].summary.activationInfo.duration
  )();
  const theme = useTheme();

  const [flip, setFlip] = useState(false);
  const [activationCounter, setActivationCounter] = useState(0);

  useProgressCircleInterval(
    () => {
      if (props.isActivating) {
        setActivationCounter(activationCounter + 100);
        setFlip(!flip);

        // change state of moduleSet
        props.dispatchSummaries({
          type: "moduleSet_update_activation",
          payload: { moduleSet: props.moduleSet, isActive: true },
        });

        // dispatch activation cost
        props.dispatchSummaries({
          type: "summary_load_apply_delta",
          payload: {
            capacitorDelta:
              -props.moduleSet[0].summary.activationInfo.activationCost *
              props.moduleSet.length,
          },
        });

        // dispatch activation count
        props.dispatchSummaries({
          type: "activationLeft_active_discharge",
          payload: { moduleSet: props.moduleSet },
        });
      } else
        props.dispatchSummaries({
          type: "moduleSet_update_activation",
          payload: { moduleSet: props.moduleSet, isActive: false },
        });
    },
    props.isActivating
      ? props.moduleSet[0].summary.activationInfo.duration * 1000
      : null
  );

  useInstaActivationInterval(() => {
    props.moduleSet.map((module) => {
      activateModule(
        module.summary,
        props.dispatchSummaries,
        props.dispatchTargetSummaries
      );
    });

    if (props.moduleSet[0].summary.activationState.activationLeft === 0)
      props.setIsActivating(false);
  }, getInstaActivationDelay(props.moduleSet[0].summary, props.isActivating));

  useLazyActivationInterval(() => {
    props.moduleSet.forEach((module) => {
      activateModule(
        module.summary,
        props.dispatchSummaries,
        props.dispatchTargetSummaries
      );
    });
  }, getLazyActivationDelay(props.moduleSet[0].summary, props.isActivating));

  return (
    <React.Fragment>
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !props.moduleSet[0].summary.activationState.isActive || !flip
              ? "transparent"
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
          color:
            !props.moduleSet[0].summary.activationState.isActive || flip
              ? "transparent"
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

function activateModule(summary, dispatchSummaries, dispatchTargetSummaries) {
  switch (summary.operation) {
    case "damage":
      dispatchTargetSummaries({
        type: "summary_load_apply_delta",
        payload: Simulator.simulate_damage_getDelta(summary),
      });
      break;
    case "defense":
      dispatchSummaries({
        type: "summary_load_apply_delta",
        payload: Simulator.simulate_defense_getDelta(summary),
      });
      break;
    case "capacitor":
      const delta = Simulator.simulate_capacitor_getDelta(summary);
      dispatchSummaries({
        type: "summary_load_apply_delta",
        payload: { capacitorDelta: delta.self.capacitorDelta },
      });
      dispatchTargetSummaries({
        type: "summary_load_apply_delta",
        payload: { capacitorDelta: delta.target.capacitorDelta },
      });
      break;
  }
}
function getInstaActivationDelay(summary, isActivating) {
  if (
    summary.bonusPerAct?.self.armor > 0 ||
    summary.bonusPerAct?.self.structure > 0
  )
    return null;

  return isActivating ? summary.activationInfo.duration * 1000 : null;
}
function getLazyActivationDelay(summary, isActivating) {
  if (getInstaActivationDelay(summary) != null) return null;

  return isActivating ? summary.activationInfo.duration * 1000 : null;
}
