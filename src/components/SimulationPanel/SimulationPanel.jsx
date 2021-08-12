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
import React from "react";
import { useState } from "react";
import Summary from "../FitCard/Stats/services/Summary";
import ContorlPanel from "./ContorlPanel";

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
  const [summarizedSlots0, setSummarizedSlots0] = useState();
  const [summarizedSlots1, setSummarizedSlots1] = useState();

  return (
    <Card style={{ width: "85%", minWidth: 300, maxWidth: 600 }} elevation={3}>
      <Grid style={{ width: "100%" }}>
        <Grid xs={12} container item justify="center">
          <ButtonGroup
            color="inherit"
            variant="text"
            fullWidth
            disableElevation
          >
            <Button
              className={classes.modeButton}
              onClick={() => {
                setSummarizedSlots0(Summary.addSummaries(props.slotsSet[0]));
                setSummarizedSlots1(Summary.addSummaries(props.slotsSet[1]));
                setUpdateFlag(!updateFlag);
              }}
            >
              <SystemUpdateAltIcon
                style={{ color: theme.palette.text.primary }}
              />
            </Button>
            <Button className={classes.modeButton}>
              <RefreshIcon style={{ color: theme.palette.text.primary }} />
            </Button>
          </ButtonGroup>
        </Grid>

        <Grid xs={12} container item justify="center">
          <ContorlPanel
            summarizedSlots={summarizedSlots0}
            updateFlag={updateFlag}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
