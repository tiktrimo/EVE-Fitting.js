import React from "react";
import FittingDrawer from "./FittingDrawer/FittingDrawer.jsx";
import { useState } from "react";
import { useReducer } from "react";
import { useEffect } from "react";
import Fit from "../../fitter/src/Fit";
import StatDrawer from "./Stats/StatDrawer.jsx";
import EFT from "./services/EFT.js";
import ListDrawers from "./ListDrawer/ListDrawers.jsx";
import { createWorkerFactory, useWorker } from "@shopify/react-web-worker";
const createFitWorker = createWorkerFactory(() =>
  import("../../fitter/src/FitWorker")
);
// eslint-disable-next-line import/no-webpack-loader-syntax
/* import worker from "workerize-loader!../../fitter/src/FitWorker";
const fitWorker = worker(); */

const initialSlots = {
  skills: false,
  ship: false,
  miscSlots: [],
  lowSlots: [],
  midSlots: [],
  highSlots: [],
  rigSlots: [],
  droneSlots: [],
};
function slotsReducer(state, action) {
  switch (action.type) {
    case "SKILL":
      return {
        ...state,
        skills: action.payload,
      };
    case "SHIP":
      return {
        ...state,
        ship:
          //prettier-ignore
          action.payload[0]?.item !== undefined ? action.payload[0].item : false,
      };
    case "MISC_SLOT":
    case "LOW_SLOT":
    case "MID_SLOT":
    case "HIGH_SLOT":
    case "RIG_SLOT":
    case "DRONE_SLOT":
      return {
        ...state,
        [translateVariant(action.type)]: action.payload,
      };
    default:
      return state;
  }
}

const initialSlotsOpen = {
  SHIP: { open: false },
  MISC_SLOT: { open: false },
  HIGH_SLOT: { open: false },
  MID_SLOT: { open: false },
  LOW_SLOT: { open: false },
  RIG_SLOT: { open: false, filter: false },
  DRONE_SLOT: { open: false, filter: false },

  AMMO: { open: false, slotVariant: false, filter: false },
  STAT: { open: false, slotVariant: false, slotNumber: false, filter: false },
};

function slotsOpenReducer(state, action) {
  switch (action.type) {
    case "SHIP":
    case "MISC_SLOT":
    case "HIGH_SLOT":
    case "MID_SLOT":
    case "LOW_SLOT":
      return { ...initialSlotsOpen, [action.type]: { open: true } };
    case "DRONE_SLOT":
      return {
        ...initialSlotsOpen,
        DRONE_SLOT: {
          open: true,
          filter: action.payload.filter,
        },
      };
    case "RIG_SLOT":
      return {
        ...initialSlotsOpen,
        RIG_SLOT: {
          open: true,
          filter: action.payload.filter,
        },
      };
    case "AMMO":
      return {
        ...initialSlotsOpen,
        AMMO: {
          open: true,
          slotVariant: action.payload.slotVariant,
          filter: action.payload.filter,
        },
      };
    case "STAT":
      return {
        ...state,
        STAT: {
          open: action.payload.open,
          slotVariant: action.payload.slotVariant,
          slotNumber: action.payload.slotNumber,
          filter: action.payload.filter,
        },
      };
    case "RESET":
    default:
      return initialSlotsOpen;
  }
}

const initialListItems = {
  SHIP: false,
  MISC_SLOT: false,
  HIGH_SLOT: false,
  MID_SLOT: false,
  LOW_SLOT: false,
  RIG_SLOT: false,
  DRONE_SLOT: false,
  AMMO: false,
};
function listItemsReducer(state, action) {
  switch (action.type) {
    case "SHIP":
    case "MISC_SLOT":
    case "HIGH_SLOT":
    case "MID_SLOT":
    case "LOW_SLOT":
    case "RIG_SLOT":
    case "DRONE_SLOT":
    case "AMMO":
      return { ...state, [action.type]: action.payload };
    default:
      return state;
  }
}

export default function Drawers(props) {
  const fitWorker = useWorker(createFitWorker);
  //prettier-ignore
  const [activeSlot, setActiveSlot] = useState({ type: false, index: false});

  const [slots, dispatchSlots] = useReducer(slotsReducer, initialSlots);
  const [slotsOpen, dispatchSlotsOpen] = useReducer(
    slotsOpenReducer,
    initialSlotsOpen
  );
  const [listItems, dispatchListItems] = useReducer(
    listItemsReducer,
    initialListItems
  );

  const [fit, setFit] = useState(false);
  const [exportFitText, setExportFitText] = useState(false);
  const [importFitText, setImportFitText] = useState(false);

  useEffect(() => {
    props.cache
      .wait("/skillsStaticBoard")
      .then((data) => dispatchSlots({ type: "SKILL", payload: data }));
  }, []);

  useEffect(() => {
    if (props.open === true) dispatchSlotsOpen({ type: "SHIP" });
    else dispatchSlotsOpen({ type: "RESET" });
  }, [props.open]);

  useEffect(() => {
    (async () => {
      if (importFitText !== false) return;
      /* console.log(
        "∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨FitCalc∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨"
      );
      console.time("Fit Stat Calculation"); */
      /* const appliedFit = await fitWorker.fit(slots); */
      const appliedFit = await fitWorker.fit(
        !!slots.ship ? slots : initialSlots
      );
      /* const appliedFit = Fit.apply(slots); */
      /* console.timeEnd("Fit Stat Calculation");
      console.log(appliedFit);
      console.log(
        `∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧`
      ); */
      setFit(appliedFit);
      props.setFit(appliedFit);
      props.setFitID(EFT.buildCompareTextFromFit(slots));
      props.setSlots(slots);

      const appliedFitExportText = EFT.buildTextFromFit(appliedFit);
      const appliedSlotsModified = { ...slots, skills: undefined };
      setExportFitText(appliedFitExportText);
      localStorage.setItem(
        `${props.tag}SLOTS`,
        JSON.stringify(appliedSlotsModified)
      );
      localStorage.setItem(`${props.tag}EFT`, appliedFitExportText);
    })();
  }, [EFT.buildCompareTextFromFit(slots), importFitText]);

  return (
    <React.Fragment>
      <ListDrawers
        tag={props.tag}
        expand={props.expand}
        slotsOpen={slotsOpen}
        fit={fit}
        slots={slots}
        activeSlot={activeSlot}
        dispatchListItems={dispatchListItems}
        dispatchSlotsOpen={dispatchSlotsOpen}
        fitID={props.fitID}
        cache={props.cache}
      />

      <FittingDrawer
        tag={props.tag}
        fit={fit}
        slots={slots}
        open={props.open}
        setOpen={props.setOpen}
        expand={props.expand}
        setExpand={props.setExpand}
        backgroundColor={props.backgroundColor}
        exportFitText={exportFitText}
        importFitText={importFitText}
        setImportFitText={setImportFitText}
        slotsOpen={slotsOpen}
        dispatchSlotsOpen={dispatchSlotsOpen}
        listItems={listItems}
        dispatchListItems={dispatchListItems}
        dispatchSlots={dispatchSlots}
        setActiveSlot={setActiveSlot}
        cache={props.cache}
      />
      <StatDrawer
        open={slotsOpen.STAT.open}
        dispatchSlotsOpen={dispatchSlotsOpen}
        slot={giveSlotToStatDrawer(fit, slotsOpen.STAT)}
        cache={props.cache}
      />
    </React.Fragment>
  );
}

function giveSlotToStatDrawer(fit, STAT) {
  if (!STAT.slotVariant) return undefined;
  switch (STAT.slotVariant) {
    case "SHIP":
      return fit.ship;
    case "MISC_SLOT":
    case "HIGH_SLOT":
    case "MID_SLOT":
    case "LOW_SLOT":
    case "RIG_SLOT":
      return fit[translateVariant(STAT.slotVariant)][STAT.slotNumber];
    default:
      return undefined;
  }
}
export function translateVariant(variant) {
  switch (variant) {
    case "SHIP":
      return "ship";
    case "MISC_SLOT":
      return "miscSlots";
    case "HIGH_SLOT":
      return "highSlots";
    case "MID_SLOT":
      return "midSlots";
    case "LOW_SLOT":
      return "lowSlots";
    case "RIG_SLOT":
      return "rigSlots";
    case "DRONE_SLOT":
      return "droneSlots";
    default:
      return undefined;
  }
}
