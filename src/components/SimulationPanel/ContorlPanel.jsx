import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Fit from "../../fitter/src/Fit";
import ModuleButton from "./ModuleButton";

export default function ContorlPanel(props) {
  const [modules, setModules] = useState();

  useEffect(() => {
    if (!!props?.summarizedSlots?.highSlots) {
      const example = Fit.mapSlots(
        props.summarizedSlots,
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
      ).filter((slot) => !!slot);
      setModules(example);
    }
  }, [props.updateFlag]);

  useEffect(() => {
    console.log(modules);
  }, [modules]);
  return (
    <React.Fragment>
      {modules?.map((slot) => {
        return <ModuleButton key={slot.summary.path} slot={slot} />;
      })}
    </React.Fragment>
  );
}
