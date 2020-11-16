import React from "react";
import Drawers from "../Drawers/Drawers";
import {
  Card,
  Button,
  Grid,
  Typography,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import { useState } from "react";
import StatsSummary from "./Stats/StatsSummary";
import Stat from "./Stats/services/Stat";

const useStyles = makeStyles((theme) => ({
  editButton: {
    fontSize: 26,
    fontWeight: 1000,
    letterSpacing: -1.5,
    lineHeight: 1,
  },
}));

const EditButton = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Button
      style={{ height: 70 }}
      fullWidth
      onClick={() => props.setOpen(!props.open)}
    >
      <Grid item xs={12}>
        <Typography
          className={classes.editButton}
          style={{
            color: !!props.fit.ship?.typeName
              ? theme.palette.text.primary
              : theme.palette.property.blueGreyLight,
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

  const [open, setOpen] = useState(true);
  const [expand, setExpand] = useState(window.innerWidth < 1000 ? false : true);

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
        expand={expand}
        setExpand={setExpand}
        fitID={fitID}
        setFitID={setFitID}
        setFit={setFit}
        cache={props.cache}
      />
    </React.Fragment>
  );
}
