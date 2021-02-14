import React, { useEffect, useRef } from "react";
import Drawers from "../Drawers/Drawers";
import {
  Card,
  Button,
  Grid,
  Typography,
  makeStyles,
  useTheme,
  Avatar,
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
    width: "auto",
  },
}));

const EditButton = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Button
      style={{
        height: 70,
        borderRadius: 0,
        backgroundColor: props.backgroundColor,
        marginBottom: 10,
      }}
      fullWidth
      onClick={() => {
        props.setOpen(!props.open);
      }}
    >
      <Grid container item xs={2} justify="center">
        <Avatar
          style={{
            padding: 5,
            width: 40,
            height: 40,
            backgroundColor: props.color,
          }}
        >
          {!!props.fit?.ship?.typeID ? (
            <img
              draggable="false"
              style={{ width: 50, height: 50 }}
              src={`https://images.evetech.net/types/${props.fit?.ship?.typeID}/icon?size=128`}
            />
          ) : (
            ""
          )}
        </Avatar>
      </Grid>
      <Grid item xs={10}>
        <Typography
          className={classes.editButton}
          style={{
            color: props.color,
          }}
          align="center"
        >
          {getFitCardTitle(props.open, props.fit.ship?.typeName)}
        </Typography>
      </Grid>
    </Button>
  );
};

export default function FitCard(props) {
  const [fit, setFit] = useState(false);
  const [fitID, setFitID] = useState(false);

  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState(window.innerWidth < 1000 ? false : true);

  const [stat, setStat] = useState(Stat.defaultStat);

  useEffect(() => {
    if (!!props.setFit) props.setFit(fit);
  }, [fit]);

  const isInitialRender = useRef(true);
  useEffect(() => {
    if (!isInitialRender.current && !isSyncing.current) {
      props.dispatchDrawersOpen({
        type: open ? "OPEN" : "CLOSE",
        tag: props.tag,
        payload: open,
      });
    } else {
      isInitialRender.current = false;
      isSyncing.current = false;
    }
  }, [open]);

  const isSyncing = useRef(false); // Too complicated.!
  useEffect(() => {
    setOpen(props.drawersOpen[props.tag]);
    if (open !== props.drawersOpen[props.tag]) isSyncing.current = true;
  }, [props.drawersOpen[props.tag]]);

  return (
    <React.Fragment>
      <Card
        style={{ width: "85%", minWidth: 300, maxWidth: 600 }}
        elevation={3}
      >
        <EditButton
          fit={fit}
          open={open}
          setOpen={setOpen}
          backgroundColor={props.backgroundColor}
          color={props.color}
        />
        <StatsSummary fit={fit} fitID={fitID} stat={stat} setStat={setStat} />
      </Card>

      <Drawers
        tag={props.tag}
        open={open}
        setOpen={setOpen}
        backgroundColor={props.backgroundColor}
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
function getFitCardTitle(open, typeName) {
  if (!typeName)
    return open
      ? "> CLICK HERE TO START FITTING <"
      : "CLICK HERE TO START FITTING";
  else return open ? `> ${typeName} <` : typeName;
}
