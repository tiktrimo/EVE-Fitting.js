import React, { useReducer } from "react";
import { Drawer, Button, makeStyles, ButtonGroup } from "@material-ui/core";
import Slots from "../Slots/Slots.jsx";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import { useEffect } from "react";
import { useRef } from "react";
import ImportExportButtons from "./ImportExportButtons.jsx";
import { findAttributebyID } from "../../../services/dataManipulation/findAttributes.js";
import Fit from "../../../fitter/src/Fit.js";

const useStyles = makeStyles((theme) => ({
  rootClose: {
    width: 0,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflow: "hidden",
  },
  rootExpand: {
    width: 300,
    maxWidth: "80%",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflow: "hidden",
  },
  rootRetract: {
    width: 60,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflow: "hidden",
  },
  expandButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: theme.palette.action.opaqueHover,
    borderRadius: 0,
    opacity: 1,
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  retractButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.palette.action.opaqueHover,
    zIndex: 1,
    borderRadius: 0,
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },

  child: {
    width: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    paddingBottom: 35,
    paddingRight: 20,
  },
}));

export const importInitializeFlag = {
  SHIP: false,
  MISC_SLOT: false,
  HIGH_SLOT: false,
  MID_SLOT: false,
  LOW_SLOT: false,
  RIG_SLOT: false,
  DRONE_SLOT: false,
};

function importStateFlagReducer(state, action) {
  switch (action.type) {
    case "START":
      return importInitializeFlag;
    default:
      return {
        ...state,
        [action.type]: true,
      };
  }
}

export default function FittingDrawer(props) {
  const classes = useStyles();

  const [importStateFlag, dispatchImportStateFlag] = useReducer(
    importStateFlagReducer,
    importInitializeFlag
  );
  const childRef = useRef(null);

  useEffect(() => {
    //If import is finished
    if (!Object.values(importStateFlag).includes(false)) {
      props.setImportFitText(false);
    }
  }, [importStateFlag]);

  useEffect(() => {
    const savedSlots = JSON.parse(localStorage.getItem(`${props.tag}SLOTS`));
    const savedEFT = localStorage.getItem(`${props.tag}EFT`);
    /* console.log(props.tag, savedSlots, savedEFT); */
    if (!savedSlots?.ship?.typeID || !savedEFT) return;

    props.cache.set(`typeID/${savedSlots.ship.typeID}`, savedSlots.ship);
    Fit.mapSlots(
      savedSlots,
      (slot) => {
        if (!!slot.item?.typeID && !!slot.item?.typeAttributesStats)
          props.cache.set(`typeID/${slot.item.typeID}`, slot.item);
        if (!!slot.charge?.typeID && !!slot.charge?.typeAttributesStats)
          props.cache.set(`typeID/${slot.charge.typeID}`, slot.charge);
      },
      {
        isIterate: {
          miscSlots: true,
          highSlots: true,
          midSlots: true,
          lowSlots: true,
          rigSlots: true,
          droneSlots: true,
        },
      }
    );

    props.setImportFitText(savedEFT);
    dispatchImportStateFlag({ type: "START" });
  }, []);

  return (
    <React.Fragment>
      <Drawer
        anchor="left"
        open={props.open}
        variant="permanent"
        classes={{
          paper: classes[switchExpandOpen(props)],
        }}
      >
        <ButtonGroup>
          <ImportExportButtons
            exportFitText={props.exportFitText}
            importFitText={props.importFitText}
            setImportFitText={props.setImportFitText}
            dispatchImportStateFlag={dispatchImportStateFlag}
            cache={props.cache}
          />
        </ButtonGroup>
        <Button
          className={classes.expandButton}
          onClick={() => props.setExpand(!props.expand)}
        >
          {!!props.expand ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>

        <div className={classes.child}>
          <div ref={childRef}>
            {[
              "SHIP",
              "MISC_SLOT",
              "HIGH_SLOT",
              "MID_SLOT",
              "LOW_SLOT",
              "RIG_SLOT",
              "DRONE_SLOT",
            ].map((variant) => {
              return (
                <Slots
                  key={variant}
                  importFitText={props.importFitText}
                  importStateFlag={importStateFlag}
                  setImportFitText={props.setImportFitText}
                  dispatchImportStateFlag={dispatchImportStateFlag}
                  variant={variant}
                  slotCount={getSlotCount(props.fit, variant)}
                  {...props}
                />
              );
            })}
          </div>
        </div>

        <Button
          className={classes.retractButton}
          onClick={() => {
            props.dispatchSlotsOpen({ type: "RESET" });
            props.setOpen(false);
          }}
        >
          <FirstPageIcon />
        </Button>
      </Drawer>
    </React.Fragment>
  );
}
function switchExpandOpen(props) {
  if (!props.open) return "rootClose";
  if (!props.expand) return "rootRetract";
  return "rootExpand";
}
export function getSlotCount(fit, variant) {
  if (variant === "SHIP") return 1;
  if (!fit.ship || !fit.ship.typeAttributesStats) return 0;

  const ship = fit.ship;
  const attrs = ship.typeAttributesStats;
  switch (variant) {
    case "MISC_SLOT":
      switch (ship.groupID) {
        // groupID: 963, name.en: Strategic Cruiser
        case 963:
          return 4;
        // groupID: 1305, name.en: Tactical Destroyer
        case 1305:
          return 1;
        default:
          return 0;
      }
    case "HIGH_SLOT":
      return attrs.find((attr) => attr.attributeID === 14)?.value;
    case "MID_SLOT":
      return attrs.find((attr) => attr.attributeID === 13)?.value;
    case "LOW_SLOT":
      return attrs.find((attr) => attr.attributeID === 12)?.value;
    case "RIG_SLOT":
      return attrs.find((attr) => attr.attributeID === 1137)?.value; //rigslot count is not sure 1137 or 1154
    case "DRONE_SLOT":
      return getDroneSlotCount(fit);
  }
}
function getDroneSlotCount(slots) {
  const droneBandwidth = findAttributebyID(slots.ship, 1271); // attributeID: 1271, attributeName: "Drone Bandwidth"
  if (!droneBandwidth) return 0;

  if (!slots.droneSlots) return 1;
  return slots.droneSlots.reduce((acc, slot, index) => {
    if (!!slot.item) return index + 2;
    return acc;
  }, 1);
}
