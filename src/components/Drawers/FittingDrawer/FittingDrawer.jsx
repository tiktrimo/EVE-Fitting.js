import React from "react";
import { Drawer, Button, makeStyles, ButtonGroup } from "@material-ui/core";
import { useState } from "react";
import Slots from "../Slots/Slots.jsx";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import { useEffect } from "react";
import { useRef } from "react";
import ImportExportButtons from "./ImportExportButtons.jsx";
import { findAttributebyID } from "../../../services/dataManipulation/findAttributes.js";

const importFinishFlag = {
  SHIP: true,
  MISC_SLOT: true,
  HIGH_SLOT: true,
  MID_SLOT: true,
  LOW_SLOT: true,
  RIG_SLOT: true,
  DRONE_SLOT: true,
};
export const importInitializeFlag = {
  SHIP: false,
  MISC_SLOT: false,
  HIGH_SLOT: false,
  MID_SLOT: false,
  LOW_SLOT: false,
  RIG_SLOT: false,
  DRONE_SLOT: false,
};

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
  child: {
    width: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    paddingBottom: 5,
    paddingRight: 20,
  },
}));

export default function FittingDrawer(props) {
  const classes = useStyles();

  const [expand, setExpand] = useState(true);
  const [importFitText, setImportFitText] = useState(false);
  const [importStateFlag, setImportStateFlag] = useState(importFinishFlag);

  const childRef = useRef(null);

  useEffect(() => {
    //If import is finished
    if (!Object.values(importStateFlag).includes(false)) {
      setImportFitText(false);
    }
  }, [importStateFlag]);

  return (
    <React.Fragment>
      <Drawer
        anchor="left"
        open={props.open}
        variant="permanent"
        classes={{
          paper: classes[switchExpandOpen(props.open, expand)],
        }}
      >
        <ButtonGroup>
          <ImportExportButtons
            exportFitText={props.exportFitText}
            setImportFitText={setImportFitText}
            setImportStateFlag={setImportStateFlag}
            cache={props.cache}
          />
        </ButtonGroup>
        <Button
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "#F5F5F5",
          }}
          onClick={() => setExpand(!expand)}
        >
          {!!expand ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
                  importFitText={importFitText}
                  importStateFlag={importStateFlag}
                  setImportStateFlag={setImportStateFlag}
                  variant={variant}
                  slotCount={getSlotCount(props.fit, variant)}
                  {...props}
                />
              );
            })}
          </div>
          <div
            style={{
              width: "100%",
              height:
                window.innerHeight - childRef.current?.clientHeight > 0
                  ? window.innerHeight - childRef.current?.clientHeight
                  : 80,
              paddingRight: 20,
              backgroundColor: "#F5F5F5",
            }}
          />
        </div>

        <Button
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#F5F5F5",
            zIndex: 1,
          }}
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
function switchExpandOpen(open, expand) {
  if (!open) return "rootClose";
  if (!expand) return "rootRetract";
  return "rootExpand";
}
export function getSlotCount(slots, variant) {
  if (variant === "SHIP") return 1;
  if (!slots.ship || !slots.ship.typeAttributesStats) return 0;

  const ship = slots.ship;
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
      return getDroneSlotCount(slots);
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
