import { Grid } from "@material-ui/core";
import React, { useReducer, useEffect, useState, useRef } from "react";
import Fit from "../../fitter/src/Fit";
import { HAL } from "../FitCard/Stats/services/Simulator";
import Summary from "../FitCard/Stats/services/Summary";
import ControlPanel from "./ControlPanel";
import ShipStatusPanel from "./ShipStatusPanel";

// TODO: pause simulation on page exit. (4)
// TODO: sorting capacitor booster charge is not working (3) ancillary shield booster not working(small)
// TODO: Rig dont get deleted! even if they are not fit in(different size)
// TODO: updating ship summary in electronic warfare is now done. start working on updating item summary (such as tracking disruptor)

const summariesReducer = /* (props) => */ (state, action) => {
  switch (action.type) {
    case "initialize":
      return action.payload;

    case "update_dispatchLog":
      return { ...state, utils: { dispatchLog: action.payload } };

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
        state.utils.dispatchLog({
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
      itemSummary.activationState.isActive =
        slot.summary.activationState.isActive;
      slot.summary = itemSummary;

      return { ...state };

    case "summary_update_exSlots":
      updateSummariesCapacity(state, action);

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
    if (!props.slots?.ship) return;

    const newSummaries = Summary.getSummaries(props.slots, props.location);
    newSummaries.utils.dispatchLog = props.dispatchLog;
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
    !!props.slots?.ship && (
      <React.Fragment>
        <Grid xs={12} container item justifyContent="center">
          <ShipStatusPanel summaries={summaries} color={props.color} />
        </Grid>
        <Grid xs={12} container item justifyContent="center">
          <ControlPanel
            summaries={summaries}
            dispatchSummaries={dispatchSummaries}
            dispatchTargetSummaries={props.dispatchTargetSummaries}
            updateFlag={updateFlag}
          />
        </Grid>
      </React.Fragment>
    )
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

function getUpdatedShipSummary(summaries) {
  Fit.mapSlots(
    summaries,
    (summerizedSlot) => {
      if (!summerizedSlot.summary) return;

      const slot = toPath(summaries.utils.slots, summerizedSlot.summary.path);
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

  const fit = Fit.apply(summaries.utils.slots);
  const shipSummary = Summary.getSummary_ship(fit, summaries.summary.location);

  return shipSummary;
}

function getUpdatedItemSummary(summaries, payload) {
  const slot = toPath(summaries.utils.slots, payload.moduleSet[0].summary.path);
  const savedCharge = slot.charge;

  // Unrendered mutation. after calculation of fit it will recover data from savedCharge.
  if (payload.moduleSet[0].summary.activationState.activationLeft === 0)
    slot.charge = false;

  const fit = Fit.apply(summaries.utils.slots);
  slot.charge = savedCharge;

  const itemSummary = Summary.getSummary_module(
    toPath(fit, payload.moduleSet[0].summary.path)
  );

  return itemSummary;
}

function updateSummariesCapacity(state, action) {
  if (!state.utils.slots.exSlots) state.utils.slots.exSlots = [];
  const indexOfSlot = state.utils.slots.exSlots.findIndex(
    (slot) =>
      slot.item.rootID === action.payload.exSlot.item.rootID &&
      slot.item.domainID === action.payload.exSlot.item.domainID
  );

  // add/remove corresponding exSlot
  if (action.payload.isActive === true) {
    if (indexOfSlot >= 0) return state;

    action.payload.exSlot.item.typeState = "activation";
    state.utils.slots.exSlots.push(action.payload.exSlot);
  } else {
    if (indexOfSlot < 0) return state;

    action.payload.exSlot.item.typeState = "passive";
    state.utils.slots.exSlots.splice(indexOfSlot, 1);
  }

  // update summaries
  const summaries = Summary.updateSummaries(
    state.utils.slots,
    state.summary.location
  );
  state.summary.capacity = summaries.summary.capacity;
  Fit.mapSlots(
    summaries,
    (summerizedSlot) => {
      if (!summerizedSlot.summary) return;

      const slot = toPath(state, summerizedSlot.summary.path);
      summerizedSlot.summary.activationInfo = slot.summary.activationInfo;
      summerizedSlot.summary.activationState = slot.summary.activationState;
      summerizedSlot.summary.load = slot.summary.load;
      summerizedSlot.summary.root = slot.summary.root;
      summerizedSlot.summary.target = slot.summary.target;
      slot.summary = summerizedSlot.summary;
    },
    {
      isIterate: {
        midSlots: true,
        lowSlots: true,
        highSlots: true,
        droneSlots: true,
      },
    }
  );
}

export function toPath(slots, path) {
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
