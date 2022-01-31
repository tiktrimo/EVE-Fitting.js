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
import React, { useCallback } from "react";
import { useState } from "react";
import ShipPanel from "./ShipPanel";
import Fit from "../../fitter/src/Fit";
import LogPanel from "./LogPanel";
import ShipCanvas from "../simpleEdition/ShipCanvas";

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

  /*   const _slots = Summary.addSummaries_duplicateSlots(slots);

  const fit = Fit.apply(slots);
  const summarizedSlots = Summary.addSummaries(fit, _slots, situation);
  summarizedSlots.skills = undefined;

  return summarizedSlots; */
}
