import {
  Button,
  ButtonGroup,
  Card,
  Grid,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import RefreshIcon from "@material-ui/icons/Refresh";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import ShipPanel from "./ShipPanel";
import Fit from "../../fitter/src/Fit";
import Summary from "../FitCard/Stats/services/Summary";
import ShipCanvas from "../simpleEdition/ShipCanvas";
import EFT from "../Drawers/services/EFT";

const useStyles = makeStyles((theme) => ({
  modeButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

export default function SimulationPanel(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [updateFlag, setUpdateFlag] = useState(false);

  const [slots0, setSlots0] = useState();
  const [slots1, setSlots1] = useState();
  const [summaries0, setSummaries0] = useState();
  const [summaries1, setSummaries1] = useState();

  const [dispatchLog, setDispatchLog] = useState();
  const [dispatchSummarizedSlot0, setDispatchSummarizedSlot0] = useState();
  const [dispatchSummarizedSlot1, setDispatchSummarizedSlot1] = useState();

  const initialize = useCallback(() => {
    const _slots0 = JSON.parse(JSON.stringify(props.slotsSet[0]));
    const _slots1 = JSON.parse(JSON.stringify(props.slotsSet[1]));

    initializeSlots(_slots0);
    setSlots0(_slots0);

    initializeSlots(_slots1);
    setSlots1(_slots1);

    setUpdateFlag(!updateFlag);
  });

  return (
    <React.Fragment>
      <Card
        style={{ width: "85%", minWidth: 300, maxWidth: 600 }}
        elevation={3}
      >
        <Grid style={{ width: "100%" }}>
          <Grid xs={12} container item justifyContent="center">
            <ButtonGroup
              color="inherit"
              variant="text"
              fullWidth
              disableElevation
            >
              <Button className={classes.modeButton} onClick={initialize}>
                <SystemUpdateAltIcon
                  style={{ color: theme.palette.text.primary }}
                />
              </Button>
              <Button className={classes.modeButton}>
                <RefreshIcon style={{ color: theme.palette.text.primary }} />
              </Button>
            </ButtonGroup>
          </Grid>

          <ShipPanel
            slots={slots0}
            setSlots={setSlots0}
            //
            targetSummaries={summaries1}
            dispatchTargetSummaries={dispatchSummarizedSlot1}
            //
            location={props.situation?.onboard}
            shareSummaries={setSummaries0}
            shareDispatchSummaries={setDispatchSummarizedSlot0}
            updateFlag={updateFlag}
            //
            dispatchLog={dispatchLog}
            logColor={theme.palette.property.blue}
            targetLogColor={theme.palette.property.red}
          />
          <ShipPanel
            slots={slots1}
            setSlots={setSlots1}
            //
            targetSummaries={summaries0}
            dispatchTargetSummaries={dispatchSummarizedSlot0}
            //
            location={props.situation?.hostile}
            shareSummaries={setSummaries1}
            shareDispatchSummaries={setDispatchSummarizedSlot1}
            updateFlag={updateFlag}
            //
            dispatchLog={dispatchLog}
            logColor={theme.palette.property.red}
            targetLogColor={theme.palette.property.blue}
          />
        </Grid>
      </Card>
      <Grid xs={12} container item justifyContent="center">
        <ShipCanvas
          onBoardSummaries={summaries0}
          hostileSummaries={summaries1}
          setSituation={props.setSituation}
          setDispatchLog={setDispatchLog}
        />
      </Grid>
      <Grid xs={12} container item justifyContent="center">
        <Button
          onClick={() => {
            createDebugFile(
              props.slotsSet[0],
              props.slotsSet[1],
              summaries0,
              summaries1
            );
          }}
        >
          DEBUG
        </Button>
      </Grid>
    </React.Fragment>
  );
}

function initializeSlots(slots) {
  Fit.mapSlots(
    slots,
    (slot) => {
      if (!!slot.item) slot.item.typeState = "passive";
    },
    {
      isIterate: {
        droneSlots: true,
        highSlots: true,
        midSlots: true,
        lowSlots: true,
      },
    }
  );
}

function createDebugFile(slots0, slots1, summaries0, summaries1) {
  if (!!"remove this block if you need to save log file seperately!") {
    console.log({
      up: {
        slots: slots0,
        innerSlots: summaries0.utils.slots,
        fit: Fit.apply(slots0),
        innerFit: summaries0.utils.fit,
        summaries: summaries0,
      },
      down: {
        slots: slots1,
        innerSlots: summaries1.utils.slots,
        fit: Fit.apply(slots1),
        innerFit: summaries1.utils.fit,
        summaries: summaries1,
      },
    });
    return false;
  }

  const filename = "Error log";
  const data = JSON.stringify({
    slots0: { ...slots0, skills: undefined },
    slots0EFT: EFT.buildTextFromFit(Fit.apply(slots0)),
    slots0Summaries: summaries0,
    slots1: { ...slots1, skills: undefined },
    slots1EFT: EFT.buildTextFromFit(Fit.apply(slots1)),
    slots1Summaries: summaries1,
  });

  var file = new Blob([data], { type: "application/json" });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
