import { Card, makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import React from "react";
import ShipCanvas from "./ShipCanvas.jsx";
import DetailedLogs from "./DetailedLog.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    minWidth: 300,
    maxWidth: 600,
    height: "100%",
  },
}));

export default function SituationalPanel(props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Card className={classes.root} elevation={3}>
      <ShipCanvas
        logs={props.logs}
        onBoardSummaries={props.onBoardSummaries}
        hostileSummaries={props.hostileSummaries}
        setSituation={props.setSituation}
      />

      <DetailedLogs logs={props.logs} />
    </Card>
  );
}
