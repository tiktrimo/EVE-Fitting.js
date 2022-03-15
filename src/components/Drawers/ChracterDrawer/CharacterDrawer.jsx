import React, { useReducer } from "react";
import { Drawer, Button, makeStyles, ButtonGroup } from "@material-ui/core";
import Slots from "../Slots/Slots.jsx";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import { useEffect } from "react";
import { useRef } from "react";
import ImportExportButtons from "../FittingDrawer/ImportExportButtons.jsx";
import { findAttributebyID } from "../../../services/dataManipulation/findAttributes";
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

export default function CharacterDrawer(props) {
  const classes = useStyles();

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
          <Button>TEMPORARY</Button>
        </ButtonGroup>
        <Button
          className={classes.expandButton}
          onClick={() => props.setExpand(!props.expand)}
        >
          {!!props.expand ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>

        <div className={classes.child}>
          <div>
            {["IMPLANT_SLOT", "DRUG_SLOT"].map((variant) => {
              return (
                <Slots
                  key={variant}
                  importFitText={props.importFitText}
                  setImportFitText={props.setImportFitText}
                  dispatchImportStateFlag={props.dispatchImportStateFlag}
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
  switch (variant) {
    case "IMPLANT_SLOT":
      return 10;
    case "DRUG_SLOT":
      return 5;
    default:
      return 0;
  }
}
