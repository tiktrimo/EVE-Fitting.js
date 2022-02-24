import React, { useEffect } from "react";
import { CircularProgress, makeStyles, useTheme } from "@material-ui/core";
import { useState } from "react";
import { useProgressCircleInterval } from "../../services/intervalHooks";
import Simulator from "../FitCard/Stats/services/Simulator";
import { toPath } from "./ShipPanel.jsx";

const useStyles = makeStyles((theme) => ({
  circularProrgess: {
    position: "absolute",
    left: 8,
    top: 2,
  },
  circularTransition: (duration) => ({
    transition: theme.transitions.create("stroke-dashoffset", {
      easing: "linear",
      duration: `${duration}s`, // 0.05 is only for visual purpose.
    }),
  }),
  hiddenCircularTransition: {
    transition: theme.transitions.create("stroke-dashoffset", {
      easing: "linear",
      duration: `0s`,
    }),
  },
}));

export default /* React.memo( */ function ModuleActivation(props) {
  const theme = useTheme();
  const classes = useStyles(props.moduleSet[0].summary.activationInfo.duration);

  const [flip, setFlip] = useState(false);
  const [activationCounter, setActivationCounter] = useState(0);

  useProgressCircleInterval(
    () => {
      // these variables should assigned before dispatchActivation function call
      const isPosEdge =
        props.isActivating === true &&
        props.moduleSet[0].summary.activationState.isActive === false;
      const isNegEdge =
        props.isActivating === false &&
        props.moduleSet[0].summary.activationState.isActive === true;

      dispatchActivation(props);
      if (props.isActivating) {
        // visual effect(circling ring thingy)

        setActivationCounter(activationCounter + 100);
        setFlip(!flip);
      }
      if (isInstaActivationModule(props.moduleSet[0].summary)) {
        // Instant activation module such as shield booster, projectile, hybrid, launcher etc...
        if (!isNegEdge)
          activateModules(
            props.moduleSet,
            props.dispatchSummaries,
            props.dispatchTargetSummaries
          );
      } else {
        // Delayed activation module  such as armor repairer, nodferatu etc...
        if (!isPosEdge)
          activateModules(
            props.moduleSet,
            props.dispatchSummaries,
            props.dispatchTargetSummaries
          );
      }
    },
    props.isActivating
      ? props.moduleSet[0].summary.activationInfo.duration * 1000
      : null
  );

  // Module that changes stat of module or ship. shield hardener, afterburner, stasis webifier etc...
  useEffect(() => {
    updateSummaries(
      props.utils,
      props.moduleSet,
      props.dispatchSummaries,
      props.dispatchTargetSummaries
    );
  }, [props.moduleSet[0].summary.activationState.isActive]);

  return (
    <React.Fragment>
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color: getCircularProgressColor(props, !flip, theme, 1),
        }}
        className={classes.circularProrgess}
        classes={{
          circleDeterminate: !flip
            ? classes.hiddenCircularTransition
            : classes.circularTransition,
        }}
        variant="determinate"
        value={activationCounter}
      />
      <CircularProgress
        size={46}
        thickness={2}
        style={{
          color: getCircularProgressColor(props, flip, theme, 2),
        }}
        className={classes.circularProrgess}
        classes={{
          circleDeterminate: flip
            ? classes.hiddenCircularTransition
            : classes.circularTransition,
        }}
        variant="determinate"
        value={activationCounter + 100}
      />
    </React.Fragment>
  );
} /* , compareFunc); */

function compareFunc(prev, next) {
  if (prev.isActivating !== next.isActivating) return false;
  /*   if (prev.isActivating === true) return false; */

  return Object.keys(prev).every((key) => prev[key] === next[key]);
}

function updateSummaries(
  utils,
  moduleSet,
  dispatchSummaries,
  dispatchTargetSummaries
) {
  switch (moduleSet[0].summary.operation) {
    case "resistance":
    case "misc":
      dispatchSummaries({
        type: "summary_update_ship",
      });
      break;
    case "target":
      dispatchTargetSummaries({
        type: "summary_update_exSlots",
        payload: {
          exSlot: toPath(utils.fit, moduleSet[0].summary.path),
          isActive: moduleSet[0].summary.activationState.isActive,
        },
      });
      break;
    default:
      return;
  }
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
      dispatchCapacitor(moduleSet, dispatchSummaries, dispatchTargetSummaries);
      break;
  }
}

function dispatchCapacitor(
  moduleSet,
  dispatchSummaries,
  dispatchTargetSummaries
) {
  const delta = Simulator.simulate_capacitor_getDelta(moduleSet[0].summary);
  const isDispatch = getCapacitorDispatchNecessity(moduleSet[0].summary, delta);

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
}

function dispatchActivation(props) {
  if (props.moduleSet[0].summary.activationState.activationLeft === 0) {
    if (props.moduleSet[0].summary.activationInfo.isChargeNegligible !== true) {
      // runs out of ammo. needs reload. Except ancillary repair, booster.
      props.setIsActivating(false);
      props.dispatchSummaries({
        type: "moduleSet_update_activation",
        payload: { moduleSet: props.moduleSet, isActive: false },
      });

      return;
    } else {
      // ancillary repair, booster runs out of charge.
      props.dispatchSummaries({
        type: "summary_update_item",
        payload: { moduleSet: props.moduleSet },
      });
    }
  }

  if (props.isActivating) {
    // Check if activation cost is lower than capacitor load
    if (
      props.moduleSet[0].summary.activationInfo.activationCost *
        props.moduleSet.length >
      props.moduleSet[0].summary.root.summary.load.capacitor.HP
    ) {
      props.setIsActivating(false);
      props.dispatchSummaries({
        type: "moduleSet_update_activation",
        payload: { moduleSet: props.moduleSet, isActive: false },
      });

      return;
    }

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
  } else {
    // Player deactivated the module
    props.dispatchSummaries({
      type: "moduleSet_update_activation",
      payload: { moduleSet: props.moduleSet, isActive: false },
    });
  }
}

function isInstaActivationModule(summary) {
  if (
    summary.bonusPerAct?.self.armor > 0 ||
    summary.bonusPerAct?.self.structure > 0 ||
    summary.isNosferatu === true
  )
    return false;

  return true;
}
function getDamagePayload(moduleSet) {
  const defaultPayload = {
    armorDelta: 0,
    shieldDelta: 0,
    structureDelta: 0,
    summary: moduleSet[0].summary,
    debug: [],
  };

  const target = {
    summary: JSON.parse(JSON.stringify(moduleSet[0].summary.target.summary)),
  };

  return moduleSet
    .map((module) => {
      const delta = Simulator.simulate_damage_getDelta(module.summary, target);
      target.summary.load.shield.HP += delta.shieldDelta;
      target.summary.load.armor.HP += delta.armorDelta;
      target.summary.load.structure.HP += delta.structureDelta;

      return delta;
    })
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
function getCircularProgressColor(props, flip, theme, tag) {
  /* console.log(
    tag,
    !props.moduleSet[0].summary.activationState.isActive || flip
      ? "transparent"
      : props.isActivating
      ? theme.palette.text.primary
      : theme.palette.action.disabled
  ); */

  return !props.moduleSet[0].summary.activationState.isActive || flip
    ? "transparent"
    : props.isActivating
    ? theme.palette.text.primary
    : theme.palette.action.disabled;
}
