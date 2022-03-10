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
  ListItem,
} from "@material-ui/core";
import { useState } from "react";
import StatsSummary from "./Stats/StatsSummary";
import Stat from "./Stats/services/Stat";
import FitCharacterBadge from "./FitCharacterBadge.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    minWidth: 300,
    maxWidth: 600,
    height: "fit-content",
  },
  editButton: {
    height: 70,
    borderRadius: 0,

    marginBottom: 10,
  },
  editButtonAvatar: {
    padding: 5,
    width: 40,
    height: 40,
  },
  editButtonText: {
    color: theme.palette.button.color,
    fontSize: 24,
    fontWeight: 1000,
    letterSpacing: -1.5,
    lineHeight: 1,
    width: "auto",
  },
}));

const EditButton = (props) => {
  const classes = useStyles(props);

  return (
    <ListItem
      className={classes.editButton}
      style={{ backgroundColor: props.backgroundColor }}
      onClick={() => {
        props.setFitOpen(true);
      }}
      button
    >
      <Grid container item xs={2} justifyContent="center">
        <FitCharacterBadge
          onClick={() => {
            props.setCharacterOpen(true);
          }}
        >
          <Avatar
            className={classes.editButtonAvatar}
            style={{ backgroundColor: props.color }}
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
        </FitCharacterBadge>
      </Grid>
      <Grid item xs={10}>
        <Typography className={classes.editButtonText} align="center">
          {getFitCardTitle(props.fitOpen, props.fit.ship?.typeName)}
        </Typography>
      </Grid>
    </ListItem>
  );
};

export default function FitCard(props) {
  const classes = useStyles();

  const [fit, setFit] = useState(false);
  const [fitID, setFitID] = useState(false);

  const [fitOpen, setFitOpen] = useState(false);
  const [characterOpen, setCharacterOpen] = useState(false);
  const [expand, setExpand] = useState(window.innerWidth < 1000 ? false : true);

  const [stat, setStat] = useState(Stat.defaultStat);

  useEffect(() => {
    if (props.activeDrawer !== props.tag) {
      setFitOpen(false);
      setCharacterOpen(false);
    } else setFitOpen(true);
  }, [props.activeDrawer]);

  useEffect(() => {
    if (fitOpen) {
      props.setActiveDrawer(props.tag);
    }
  }, [fitOpen]);

  return (
    <React.Fragment>
      <Card className={classes.root} elevation={3}>
        <EditButton
          fit={fit}
          fitOpen={fitOpen}
          setFitOpen={setFitOpen}
          setCharacterOpen={setCharacterOpen}
          backgroundColor={props.backgroundColor}
          color={props.color}
        />
        <StatsSummary fit={fit} fitID={fitID} stat={stat} setStat={setStat} />
      </Card>

      <Drawers
        tag={props.tag}
        fitOpen={fitOpen}
        setFitOpen={setFitOpen}
        characterOpen={characterOpen}
        setCharacterOpen={setCharacterOpen}
        backgroundColor={props.backgroundColor}
        expand={expand}
        setExpand={setExpand}
        fitID={fitID}
        setFitID={setFitID}
        setFit={setFit}
        setSlots={props.setSlots}
        cache={props.cache}
      />
    </React.Fragment>
  );
}
function getFitCardTitle(fitOpen, typeName) {
  if (!typeName)
    return fitOpen
      ? "> CLICK HERE TO OPEN FITTING DRAWERS <"
      : "CLICK HERE TO OPEN FITTING DRAWERS";
  else return fitOpen ? `> ${typeName} <` : typeName;
}
