import { Grid } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Fit from "../../fitter/src/Fit";
import { useAlwaysActivationInterval } from "../../services/intervalHooks";
import Simulator from "../FitCard/Stats/services/Simulator";
import ModuleButton from "./ModuleButton";

export default function ControlPanel(props) {
  const [moduleSets, setModuleSets] = useState([]);

  useEffect(() => {
    const _moduleSets = getModuleSet(props.summaries);
    setModuleSets(_moduleSets);
  }, [props.updateFlag]);

  useAlwaysActivationInterval(
    () => {
      //prettier-ignore
      const capacitorDelta = Simulator.simulate_passive_capacitor_getDelta(props.summaries);
      //prettier-ignore
      const shieldDelta = Simulator.simulate_passive_shield_getDelta(props.summaries);
      props.dispatchSummaries({
        type: "summary_load_apply_delta",
        payload: { capacitorDelta, shieldDelta },
      });
    },
    !!props?.summaries?.summary ? 1000 : null
  );

  return (
    <Grid
      style={{ margin: "12px 0px" }}
      container
      item
      xs={12}
      justifyContent="center"
    >
      {moduleSets?.map((moduleSet) => {
        return (
          <ModuleButton
            key={moduleSet[0].summary.path}
            utils={props.summaries.utils}
            updateFlag={props.updateFlag}
            moduleSet={moduleSet}
            dispatchSummaries={props.dispatchSummaries}
            dispatchTargetSummaries={props.dispatchTargetSummaries}
          />
        );
      })}
    </Grid>
  );
}

function getModuleSet(summaries) {
  if (!summaries) return [];
  const moduleSets = Fit.mapSlots(
    summaries,
    (slot) => {
      if (!slot?.summary?.activationInfo) return false;
      else return slot;
    },
    {
      isIterate: {
        highSlots: true,
        midSlots: true,
        lowSlots: true,
        droneSlots: true,
      },
    }
  )
    .filter((slot) => !!slot)
    .reduce((acc, slot) => {
      if (slot.summary.operation === "damage") {
        const matchingSlotSet = acc.find((slotSet) => {
          return (
            slotSet?.[0].summary.itemID === slot.summary.itemID &&
            slotSet?.[0].summary.chargeID === slot.summary.chargeID
          );
        });
        if (!matchingSlotSet) acc.push([slot]);
        else matchingSlotSet.push(slot);
      } else acc.push([slot]);

      return acc;
    }, []);

  return moduleSets;
}
