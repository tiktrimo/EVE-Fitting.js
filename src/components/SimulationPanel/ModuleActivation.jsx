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
        // change state of moduleSet
        if (props.moduleSet[0].summary.activationState.isActive === false)
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

        // visual effect(circling ring thingy)
        setActivationCounter(activationCounter + 100);
        setFlip(!flip);
      } else if (props.moduleSet[0].summary.activationState.isActive === true) {
        props.dispatchSummaries({
          type: "moduleSet_update_activation",
          payload: { moduleSet: props.moduleSet, isActive: false },
        });
      }
    },
    props.isActivating
      ? props.moduleSet[0].summary.activationInfo.duration * 1000
      : null
  );

  useInstaActivationInterval(() => {
    activateModules(
      props.moduleSet,
      props.dispatchSummaries,
      props.dispatchTargetSummaries
    );

    if (props.moduleSet[0].summary.activationState.activationLeft === 0)
      props.setIsActivating(false);
  }, getInstaActivationDelay(props.moduleSet[0].summary));

  useLazyActivationInterval(() => {
    activateModules(
      props.moduleSet,
      props.dispatchSummaries,
      props.dispatchTargetSummaries
    );
  }, getLazyActivationDelay(props.moduleSet[0].summary));

  useEffect(() => {
    if (["resistance", "misc"].includes(props.moduleSet[0].summary.operation))
      props.dispatchSummaries({
        type: "summary_update_ship",
      });
  }, [props.moduleSet[0].summary.activationState.isActive]);

  return (
    <React.Fragment>
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !props.moduleSet[0].summary.activationState.isActive || !flip
              ? "transparent"
              : props.isActivating
              ? theme.palette.text.primary
              : theme.palette.action.disabled,
        }}
        className={classes.circularProrgess}
        classes={{
          circleDeterminate: classes.circularTransition,
        }}
        variant="determinate"
        value={activationCounter}
      />
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color:
            !props.moduleSet[0].summary.activationState.isActive || flip
              ? "transparent"
              : props.isActivating
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
        }}
        className={classes.circularProrgess}
        classes={{
          circleDeterminate: classes.circularTransition,
        }}
        variant="determinate"
        value={activationCounter + 100}
      />
    </React.Fragment>
  );
}

function activateModules(
  moduleSet,
  dispatchSummaries,
  dispatchTargetSummaries
) {
  switch (moduleSet[0].summary.operation) {
    case "damage":
      dispatchTargetSummaries({
        type: "summary_load_apply_delta",
        payload: getDamagePayload(moduleSet),
        operation: moduleSet[0].summary.operation,
      });
      break;
    case "defense":
      dispatchSummaries({
        type: "summary_load_apply_delta",
        payload: getDefensePayload(moduleSet),
        operation: moduleSet[0].summary.operation,
      });
      break;
    case "capacitor":
      const delta = Simulator.simulate_capacitor_getDelta(moduleSet[0].summary);
      const isDispatch = getCapacitorDispatchNecessity(
        moduleSet[0].summary,
        delta
      );

      if (isDispatch.self)
        dispatchSummaries({
          type: "summary_load_apply_delta",
          payload: {
            summary: moduleSet[0].summary,
            capacitorDelta: delta.self.capacitorDelta,
          },
          operation: moduleSet[0].summary.operation,
        });

      if (isDispatch.target)
        dispatchTargetSummaries({
          type: "summary_load_apply_delta",
          payload: {
            summary: moduleSet[0].summary,
            capacitorDelta: delta.target.capacitorDelta,
          },
          operation: moduleSet[0].summary.operation,
        });
      break;
  }
}
function getInstaActivationDelay(summary) {
  if (
    summary.bonusPerAct?.self.armor > 0 ||
    summary.bonusPerAct?.self.structure > 0 ||
    summary.isNosferatu === true
  )
    return null;

  return summary.activationState.isActive
    ? summary.activationInfo.duration * 1000
    : null;
}
function getLazyActivationDelay(summary) {
  if (getInstaActivationDelay(summary) != null) return null;

  return summary.activationState.isActive
    ? summary.activationInfo.duration * 1000
    : null;
}
function getDamagePayload(moduleSet) {
  const defaultPayload = {
    armorDelta: 0,
    shieldDelta: 0,
    structureDelta: 0,
    summary: moduleSet[0].summary,
    debug: [],
  };

  return moduleSet
    .map((module) => Simulator.simulate_damage_getDelta(module.summary))
    .reduce((payload, delta) => {
      payload.armorDelta += delta.armorDelta;
      payload.shieldDelta += delta.shieldDelta;
      payload.structureDelta += delta.structureDelta;
      payload.debug = payload.debug.concat(delta.debug);
      return payload;
    }, defaultPayload);
}
function getDefensePayload(moduleSet) {
  return {
    ...Simulator.simulate_defense_getDelta(moduleSet[0].summary),
    summary: moduleSet[0].summary,
  };
}
function getCapacitorDispatchNecessity(summary) {
  const isCapBoosterOrNeut =
    !summary.isNosferatuBloodRaiderOverriden &&
    !summary.isCapacitorTransmitter &&
    !summary.isNosferatu;

  // Neut don't have chargeID as it dont need any ammo
  if (isCapBoosterOrNeut && !!summary.chargeID)
    return { target: false, self: true };
  else if (summary.isNosferatu) return { target: true, self: true };
  else return { target: true, self: false };
}
