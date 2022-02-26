import {
  Button,
  ButtonGroup,
  Card,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import ArchiveIcon from "@material-ui/icons/Archive";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import ShipPanel from "./ShipPanel";
import Fit from "../../fitter/src/Fit";
import ReplayIcon from "@material-ui/icons/Replay";
import ShipCanvas from "../simpleEdition/ShipCanvas";
import EFT from "../Drawers/services/EFT";

const useStyles = makeStyles((theme) => ({
  modeButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  rootCard: {
    width: "90%",
    minWidth: 300,
    maxWidth: 600,
    marginBottom: 24,
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
    if (!props.slotsSet[0].ship || !props.slotsSet[1].ship) return;

    const _slots0 = JSON.parse(JSON.stringify(props.slotsSet[0]));
    const _slots1 = JSON.parse(JSON.stringify(props.slotsSet[1]));

    initializeSlots(_slots0);
    setSlots0(_slots0);

    initializeSlots(_slots1);
    setSlots1(_slots1);

    setUpdateFlag(!updateFlag);
  }, [props.slotsSet, updateFlag]);

  const refresh = useCallback(() => {
    setUpdateFlag(!updateFlag);
  }, [props.slotsSet, updateFlag]);

  return (
    <React.Fragment>
      <Card className={classes.rootCard} elevation={3}>
        <Grid xs={12} container item justifyContent="center">
          <ButtonGroup
            color="inherit"
            variant="text"
            fullWidth
            disableElevation
          >
            <Button className={classes.modeButton} onClick={initialize}>
              <Tooltip title="Import fit from above" placement="bottom" arrow>
                <ArchiveIcon style={{ color: theme.palette.text.primary }} />
              </Tooltip>
            </Button>
            <Button className={classes.modeButton} onClick={refresh}>
              <Tooltip title="Restart the simulation" placement="bottom" arrow>
                <ReplayIcon style={{ color: theme.palette.text.primary }} />
              </Tooltip>
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
          color={theme.palette.property.blue}
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
          color={theme.palette.property.red}
        />
      </Card>

      <Grid xs={12} container item justifyContent="center">
        <ShipCanvas
          onBoardSummaries={summaries0}
          hostileSummaries={summaries1}
          setSituation={props.setSituation}
          setDispatchLog={setDispatchLog}
        />
      </Grid>
      <Grid
        style={{ marginTop: 24 }}
        xs={12}
        container
        item
        justifyContent="center"
      >
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
          Download error log
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
  /* if (!!"remove this block if you need to save log file seperately!") {
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
  } */

  let data = {};
  if (!summaries0?.utils || !summaries1?.utils) {
    data = JSON.stringify({
      up: {
        slots: slots0,
        fit: Fit.apply(slots0),
      },
      down: {
        slots: slots1,
        fit: Fit.apply(slots1),
      },
    });
  } else {
    const summarySet = [summaries0, summaries1].map((summaries) => {
      const _summaries = {
        lowSlots: [],
        midSlots: [],
        HighSlots: [],
        droneSlots: [],
      };
      ["droneSlots", "highSlots", "midSlots", "lowSlots"].forEach((variant) => {
        summaries[variant].forEach((slot) => {
          if (!slot.summary) return;

          const _summary = { ...slot.summary };
          _summary.root = slot.summary.root?.summary?.decription;
          _summary.target = slot.summary.target?.summary?.decription;
          _summaries[variant].push(_summary);
        });
      });

      _summaries.summary = summaries.summary;

      return _summaries;
    });

    data = JSON.stringify({
      up: {
        slots: { ...slots0, skills: undefined },
        innerSlots: { ...summaries0.utils.slots, skills: undefined },
        fit: Fit.apply(slots0),
        innerFit: summaries0.utils.fit,
        summaries: summarySet[0],
      },
      down: {
        slots: { ...slots1, skills: undefined },
        innerSlots: { ...summaries1.utils.slots, skills: undefined },
        fit: Fit.apply(slots1),
        innerFit: summaries1.utils.fit,
        summaries: summarySet[1],
      },
    });
  }

  const filename = "Error log";

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
