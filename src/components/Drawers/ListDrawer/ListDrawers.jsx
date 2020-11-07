import React from "react";
import ListDrawer from "./ListDrawer";
import { useState } from "react";
import { useEffect } from "react";
import { translateVariant } from "../Drawers";

export default React.memo(function ListDrawers(props) {
  const [activeItem, setActiveItem] = useState(false);
  const [activeCharge, setActiveCharge] = useState(false);

  const [liftedIsLoop, setLiftedIsLoop] = useState(true);

  useEffect(() => {
    const activeSlot = getActiveSlot(props.fit, props.activeSlot);
    setActiveItem(activeSlot?.item);
    setActiveCharge(activeSlot?.charge);
  }, [props.fitID, props.activeSlot]);

  return (
    <React.Fragment>
      {[
        "SHIP",
        "MISC_SLOT",
        "HIGH_SLOT",
        "MID_SLOT",
        "LOW_SLOT",
        "RIG_SLOT",
        "AMMO",
        "DRONE_SLOT",
      ].map((variant) => {
        return (
          <ListDrawer
            key={variant}
            variant={variant}
            activeItem={activeItem}
            activeCharge={activeCharge}
            liftedIsLoop={liftedIsLoop}
            setLiftedIsLoop={setLiftedIsLoop}
            expand={props.expand}
            open={props.slotsOpen[variant].open}
            filter={generateFilter(props.slots, props.slotsOpen, variant)}
            {...props}
          />
        );
      })}
    </React.Fragment>
  );
});
function generateFilter(slots, slotsOpen, variant) {
  switch (variant) {
    case "AMMO": {
      const filter = slotsOpen.AMMO.filter;
      if (!filter.group || filter.group.length === 0) return [];
      return [
        {
          attributeName: "typeGroupID",
          value: filter.group,
        },
        { attributeName: "typeChargeSize", value: filter.size },
      ];
    }
    case "RIG_SLOT": {
      const filter = slotsOpen.RIG_SLOT.filter;
      if (!filter || !filter.size) return [];
      return [
        {
          attributeName: "typeRigSize",
          value: filter.size,
        },
      ];
    }
    case "DRONE_SLOT": {
      const filter = slotsOpen.DRONE_SLOT.filter;
      if (filter.size === false || filter.size === undefined) return [];
      return [
        {
          attributeName: "typeDroneSize",
          value: [...new Array(filter.size + 1).keys()],
        },
      ];
    }

    default:
      return [];
  }
}
export function getActiveSlot(fit, activeSlot) {
  if (activeSlot.type === false || activeSlot.index === false)
    return { item: false, charge: false };
  if (activeSlot.type === "SHIP") return { item: fit.ship };

  return fit[translateVariant(activeSlot.type)][activeSlot.index];
}
