import React from "react";
import { Grid, makeStyles, List } from "@material-ui/core";
import SlotList from "./SlotList/SlotList";
import { useReducer } from "react";
import { useEffect } from "react";

import { findAttributesByName } from "../../../services/dataManipulation/findAttributes";
import { calculateBonusSumMul } from "../../../services/dataManipulation/calculateBonusSum";
import {
  bindChargeWithItemMul,
  bindChargeWithItemPer,
} from "../../../services/dataManipulation/bindChargeWithItem";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    margin: 0,
  },
}));

const initialSlots = {
  highSlots: [],
  midSlots: [],
  lowSlots: [],
};

function slotsReducer(state, action) {
  switch (action.type) {
    case "HIGH_SLOT":
      return {
        ...state,
        highSlots: action.payload,
      };
    case "MID_SLOT":
      return {
        ...state,
        midSlots: action.payload,
      };
    case "LOW_SLOT":
      return {
        ...state,
        lowSlots: action.payload,
      };
    default:
      return {
        ...state,
      };
  }
}

export default function ShipCardMain(props) {
  const classes = useStyles();
  const [slots, dispatchSlots] = useReducer(slotsReducer, initialSlots);

  useEffect(() => {
    props.setTurret(calculateTrackingOptimalFalloff(slots));
  }, [slots]);

  return (
    <Grid container alignContent="flex-start">
      <Grid container item xs={12}>
        <List className={classes.root}>
          <SlotList
            ship={props.ship}
            type="HIGH_SLOT"
            dispatchSlots={dispatchSlots}
            count={props.highSlotCount}
            cache={props.cache}
          />
          <SlotList
            ship={props.ship}
            type="MID_SLOT"
            dispatchSlots={dispatchSlots}
            count={props.midSlotCount}
            cache={props.cache}
          />
          <SlotList
            ship={props.ship}
            type="LOW_SLOT"
            dispatchSlots={dispatchSlots}
            count={props.lowSlotCount}
            cache={props.cache}
          />
        </List>
      </Grid>
    </Grid>
  );
}
function calculateTrackingOptimalFalloff(slots) {
  // Bind Turret with Charge
  let bindedHighSlots = bindChargeWithItemMul(
    slots.highSlots,
    "Turret Tracking",
    "Tracking Speed Multiplier"
  );
  bindedHighSlots = bindChargeWithItemMul(
    bindedHighSlots,
    "Optimal Range",
    "Range bonus"
  );
  bindedHighSlots = bindChargeWithItemMul(
    bindedHighSlots,
    "Accuracy falloff ",
    "Falloff Modifier"
  );

  // Bind Tracking Computer with charge
  let bindedMidSlots = bindChargeWithItemPer(
    slots.midSlots,
    "Tracking Speed Bonus",
    "Modification of Tracking Speed Bonus"
  );
  bindedMidSlots = bindChargeWithItemPer(
    bindedMidSlots,
    "Optimal Range Bonus",
    "Modification of Optimal Range Bonus"
  );
  bindedMidSlots = bindChargeWithItemPer(
    bindedMidSlots,
    "Falloff Bonus",
    "Modification of Falloff Bonus"
  );

  const bindedSlots = {
    highSlots: bindedHighSlots,
    midSlots: bindedMidSlots,
    lowSlots: slots.lowSlots,
  };
  const trackingBonus = calculateBonusSumMul(
    bindedSlots,
    "Tracking Speed Bonus"
  );
  const optimalBonus = calculateBonusSumMul(bindedSlots, "Optimal Range Bonus");
  const falloffBonus = calculateBonusSumMul(bindedSlots, "Falloff Bonus");

  //TODO_LEGACY: make all slots responsible for calculating
  const activeTurret = bindedHighSlots[0]?.item;
  return {
    optimalRange:
      findAttributesByName(activeTurret, "Optimal Range") * optimalBonus,
    falloffRange:
      findAttributesByName(activeTurret, "Accuracy falloff ") * falloffBonus,
    trackingValue:
      findAttributesByName(activeTurret, "Turret Tracking") * trackingBonus,
    primarySkillRequired: findAttributesByName(
      activeTurret,
      "Primary Skill required"
    ),
  };
}
