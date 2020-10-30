import React from "react";
import Drawers from "../Drawers/Drawers";
import { Card, Button, Grid, Typography } from "@material-ui/core";
import { useState } from "react";
import StatsSummary from "./Stats/StatsSummary";
import Stat from "./Stats/services/Stat";
import { blueGrey } from "@material-ui/core/colors";

const EditButton = (props) => {
  return (
    <Button
      style={{ height: 70 }}
      fullWidth
      onClick={() => props.setOpen(!props.open)}
    >
      <Grid item xs={12}>
        <Typography
          style={{
            fontSize: 26,
            fontWeight: 1000,
            letterSpacing: -1.5,
            lineHeight: 1,
            color: !!props.fit.ship?.typeName ? "#000000" : blueGrey[200],
          }}
          align="center"
        >
          {props.fit.ship?.typeName || "CLICK HERE TO START FITTING"}
        </Typography>
      </Grid>
    </Button>
  );
};

export default function FitCard(props) {
  const [fit, setFit] = useState(false);
  const [fitID, setFitID] = useState(false);
  const [open, setOpen] = useState(false);

  const [stat, setStat] = useState(Stat.defaultStat);

  return (
    <React.Fragment>
      <Card
        style={{ width: "85%", minWidth: 300, maxWidth: 600 }}
        elevation={3}
      >
        <EditButton fit={fit} open={open} setOpen={setOpen} />
        <StatsSummary fit={fit} fitID={fitID} stat={stat} setStat={setStat} />
      </Card>

      <Drawers
        open={open}
        setOpen={setOpen}
        fitID={fitID}
        setFitID={setFitID}
        setFit={setFit}
        cache={props.cache}
      />
    </React.Fragment>
  );
}
