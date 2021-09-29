import { Grid } from "@material-ui/core";
import React, { useReducer, useEffect, useState, useRef } from "react";
import Fit from "../../fitter/src/Fit";
import { HAL } from "../FitCard/Stats/services/Simulator";
import Summary from "../FitCard/Stats/services/Summary";
import ContorlPanel from "./ContorlPanel";
import ShipStatusPanel from "./ShipStatusPanel";

//TODO: Finish temporary operation
const summariesReducer = (state, action) => {
  switch (action.type) {
    case "initialize":
      return action.payload;

    case "activationLeft_active_discharge":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.activationLeft--;
      });

      return { ...state };

    case "activationLeft_active_charge":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.activationLeft =
          module.summary.activationInfo.activationLimit;
      });

      return { ...state };

    case "capacitor_shield_passive_charge":
      state.summary.load.capacitor.HP = calculateHP(state, action, "capacitor");
      state.summary.load.shield.HP = calculateHP(state, action, "shield");

      return { ...state };

    case "capacitor_active_discharge":
      state.summary.load.capacitor.HP = calculateHP(state, action, "capacitor");

      return { ...state };

    case "damage":
      state.summary.load.shield.HP = calculateHP(state, action, "shield");
      state.summary.load.armor.HP = calculateHP(state, action, "armor");
      state.summary.load.structure.HP = calculateHP(state, action, "structure");

      return { ...state };

    case "defense":
      state.summary.load.shield.HP = calculateHP(state, action, "shield");
      state.summary.load.armor.HP = calculateHP(state, action, "armor");
      state.summary.load.structure.HP = calculateHP(state, action, "structure");

      return { ...state };

    case "capacitor":
      state.summary.load.capacitor.HP = calculateHP(state, action, "capacitor");

      return { ...state };
    default:
      return state;
  }
};

export default function ShipPanel(props) {
  //prettier-ignore
  const [summaries, dispatchSummaries] = useReducer(summariesReducer, false);
  const [updateFlag, setUpdateFlag] = useState(false);

  useEffect(() => {
    props.shareDispatchSummaries(() => dispatchSummaries);
  }, [dispatchSummaries]);

  //Initialize
  useEffect(() => {
    if (!props.slots) return;

    const _summaries = Summary.getSummaries(props.slots, props.location);
    //prettier-ignore
    _summaries.resistanceTable = Summary.getResistanceTable(_summaries, props.slots);
    _summaries.skills = undefined;

    console.log(_summaries);

    dispatchSummaries({ type: "initialize", payload: _summaries });
    props.shareSummaries(_summaries);
    setUpdateFlag(!updateFlag);
  }, [props.updateFlag]);

  //Set target
  useEffect(() => {
    HAL.getSchedules_setTarget(summaries, props.targetSummaries);
  }, [props.targetSummaries]);

  return (
    <React.Fragment>
      <Grid xs={12} container item justify="center">
        <ShipStatusPanel summaries={summaries} />
      </Grid>
      <Grid xs={12} container item justify="center">
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

  const result = currentValue + deltaValue;
  if (result > maxValue) return maxValue;
  else if (result < 0) return 0;
  else return result;
}
