import { Grid } from "@material-ui/core";
import React, { useReducer, useEffect, useState, useRef } from "react";
import Fit from "../../fitter/src/Fit";
import { HAL } from "../FitCard/Stats/services/Simulator";
import Summary from "../FitCard/Stats/services/Summary";
import ContorlPanel from "./ContorlPanel";
import ShipStatusPanel from "./ShipStatusPanel";

// TODO: pause simulation on page exit. (4)
// TODO: sorting capacitor booster charge is not working (3) ancillary shield booster not working(small)
// TODO: Rig dont get deleted! even if they are not fit in(different size)
// TODO: log overflow. log not showing correctly (1)

const summariesReducer = /* (props) => */ (state, action) => {
  switch (action.type) {
    case "initialize":
      return action.payload;

    case "update_dispatchLog":
      return { ...state, dispatchLog: action.payload };

    case "moduleSet_update_activation":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.isActive = action.payload.isActive;
      });

      return { ...state };

    case "activationLeft_active_discharge":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.activationLeft = Math.max(
          module.summary.activationState.activationLeft - 1,
          0
        );
      });

      return { ...state };

    case "activationLeft_active_charge":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.activationLeft =
          module.summary.activationInfo.activationLimit;
      });

      return { ...state };

    case "summary_load_apply_delta":
      const oldSum = getSum(state);
      state.summary.load.shield.HP = calculateHP(state, action, "shield");
      state.summary.load.armor.HP = calculateHP(state, action, "armor");
      state.summary.load.structure.HP = calculateHP(state, action, "structure");
      state.summary.load.capacitor.HP = calculateHP(state, action, "capacitor");

      if (!!action.operation) {
        const delta = getSum(state) - oldSum;
        state.dispatchLog({
          type: "update",
          payload: getLog(state, action, delta),
        });
      }

      return { ...state };

    case "summary_update_ship":
      const shipSummary = getUpdatedShipSummary(state);
      state.summary.capacity = shipSummary.capacity;
      return { ...state };

    case "summary_update_item":
      // Currently only used for updating information about ancillary booster/repairer
      const itemSummary = getUpdatedItemSummary(state, action.payload);
      const slot = toPath(state, itemSummary.path);
      itemSummary.load = slot.summary.load;
      itemSummary.root = slot.summary.root;
      itemSummary.target = slot.summary.target;
      slot.summary = itemSummary;

      return { ...state };

    case "summary_update_location":
      if (!!state.summary?.location) {
        state.summary.location = action.payload;
        return { ...state };
      }
      return state;

    default:
      console.error("ERR NO KNOWN CASE IN ShipPanel.js");
      return state;
  }
};

export default function ShipPanel(props) {
  const [summaries, dispatchSummaries] = useReducer(summariesReducer, false);
  const [updateFlag, setUpdateFlag] = useState(false);

  useEffect(() => {
    if (!!summaries && !!props.dispatchLog)
      dispatchSummaries({
        type: "update_dispatchLog",
        payload: props.dispatchLog,
      });
  }, [props.dispatchLog]);

  useEffect(() => {
    props.shareDispatchSummaries(() => dispatchSummaries);
  }, [dispatchSummaries]);

  //Initialize
  useEffect(() => {
    if (!props.slots) return;

    const newSummaries = Summary.getSummaries(props.slots, props.location);
    //prettier-ignore
    /* newSummaries.resistanceTable = Summary.getResistanceTable(newSummaries, props.slots); */
    newSummaries.dispatchLog = props.dispatchLog;
    dispatchSummaries({ type: "initialize", payload: newSummaries });
    props.shareSummaries(newSummaries);
    setUpdateFlag(!updateFlag);
  }, [props.updateFlag]);

  //Update location
  useEffect(() => {
    dispatchSummaries({
      type: "summary_update_location",
      payload: props.location,
    });
  }, [props.location]);

  // Update sharedSummary if shipSummary is updated
  useEffect(() => {
    if (!!summaries.summary) props.shareSummaries(summaries);
  }, [summaries.summary?.capacity]);

  //Set target
  useEffect(() => {
    HAL.getSchedules_setTarget(summaries, props.targetSummaries);
  }, [props.targetSummaries]);

  return (
    <React.Fragment>
      <Grid xs={12} container item justifyContent="center">
        <ShipStatusPanel summaries={summaries} />
      </Grid>
      <Grid xs={12} container item justifyContent="center">
        <ContorlPanel
          summaries={summaries}
          dispatchSummaries={dispatchSummaries}
          dispatchTargetSummaries={props.dispatchTargetSummaries}
          updateFlag={updateFlag}
        />
      </Grid>
    </React.Fragment>
  );
}

function calculateHP(state, action, type) {
  const currentValue = state.summary.load[`${type}`].HP;
  const deltaValue = action.payload[`${type}Delta`];
  const maxValue = state.summary.capacity[`${type}`].HP;

  if (!deltaValue) return currentValue;

  const result = currentValue + deltaValue;
  if (result > maxValue) return maxValue;
  else if (result < 0) return 0;
  else return result;
}
function updateResistance(state) {
  const resistanceSlots = Fit.mapSlots(
    state,
    (slot) => {
      if (slot?.summary?.operation === "resistance") return slot;
      else return false;
    },
    {
      isIterate: {
        midSlots: true,
        lowSlots: true,
      },
    }
  ).filter((slot) => !!slot);
  const resistanceTag = resistanceSlots
    .reduce((acc, slot) => {
      return acc.concat(
        `${slot.summary.path}.${
          slot.summary.activationState.isActive ? "activation" : "passive"
        }|`
      );
    }, "")
    .slice(0, -1);

  // Serious mutation
  state.summary.capacity = {
    ...state.summary.capacity,
    ...state.resistanceTable[resistanceTag],
  };
}

function getUpdatedShipSummary(summaries) {
  Fit.mapSlots(
    summaries,
    (summerizedSlot) => {
      if (!summerizedSlot.summary) return;

      const slot = toPath(summaries.slots, summerizedSlot.summary.path);
      if (!!slot.item.typeState && !!summerizedSlot.summary.activationState)
        slot.item.typeState = summerizedSlot.summary.activationState.isActive
          ? "activation"
          : "passive";
    },
    {
      isIterate: {
        midSlots: true,
        lowSlots: true,
        highSlots: true,
      },
    }
  );

  const fit = Fit.apply(summaries.slots);
  const shipSummary = Summary.getSummary_ship(fit, summaries.summary.location);

  return shipSummary;
}

function getUpdatedItemSummary(summaries, payload) {
  const slot = toPath(summaries.slots, payload.moduleSet[0].summary.path);
  const savedCharge = slot.charge;

  // Unrendered mutation. after calculation of fit it will recover data from savedCharge.
  if (payload.moduleSet[0].summary.activationState.activationLeft === 0)
    slot.charge = false;

  const fit = Fit.apply(summaries.slots);
  slot.charge = savedCharge;

  const itemSummary = Summary.getSummary_module(
    toPath(fit, payload.moduleSet[0].summary.path)
  );

  return itemSummary;
}

function toPath(slots, path) {
  if (!slots || !path) return {};
  return path.split(".").reduce((p, c) => (p && p[c]) || undefined, slots);
}

function getLog(state, action, delta) {
  return {
    rootID: state.summary.location.rootID,
    delta: delta,
    summary: action.payload.summary,
    ID: Date.now(),
    debug: action.payload.debug,
  };
}

function getSum(state) {
  return (
    state.summary.load.shield.HP +
    state.summary.load.armor.HP +
    state.summary.load.structure.HP +
    state.summary.load.capacitor.HP
  );
}
