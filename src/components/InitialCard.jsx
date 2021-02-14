import React, { useEffect, useReducer, useState } from "react";
import FitCard from "./FitCard/FitCard";
import {
  Button,
  ButtonGroup,
  Grid,
  makeStyles,
  Paper,
  useTheme,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import Brightness2Icon from "@material-ui/icons/Brightness2";
import ShipCanvas from "./simpleEdition/ShipCanvas";
import Simulator from "./FitCard/Stats/services/Simulator";

const useStyles = makeStyles((theme) => ({
  modeButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  modeButtonActive: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.property.org,
  },
}));

const Links = (props) => {
  return (
    <Paper elevation={2}>
      <ButtonGroup variant="text">
        <Button
          href={"https://github.com/tiktrimo/EVE-Fitting.js"}
          target="_blank"
          color="primary"
        >
          <GitHubIcon />
        </Button>
        <Button
          href={"https://github.com/tiktrimo/EVE-Fitting.js/issues"}
          target="_blank"
          color="primary"
        >
          BUG REPORT
        </Button>
        <Button
          href={
            "https://github.com/tiktrimo/EVE-Fitting.js/blob/master/DOCS/DOCS.md"
          }
          target="_blank"
          color="primary"
        >
          DOCS
        </Button>
      </ButtonGroup>
    </Paper>
  );
};

const Settings = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Paper style={{ marginLeft: 10 }} elevation={2}>
      <ButtonGroup variant="text">
        <Button
          className={
            props.isDark ? classes.modeButton : classes.modeButtonActive
          }
          onClick={() => {
            props.setIsDark(false);
          }}
        >
          <WbSunnyIcon />
        </Button>
        <Button
          className={
            props.isDark ? classes.modeButtonActive : classes.modeButton
          }
          onClick={() => {
            props.setIsDark(true);
          }}
        >
          <Brightness2Icon />
        </Button>
      </ButtonGroup>
    </Paper>
  );
};

const initialDrawersOpen = {
  fit: true,
  fit1: false,
};
const defaultDrawersOpen = {
  fit: false,
  fit1: false,
};
function drawersOpenReducer(state, action) {
  if (!action?.tag) return defaultDrawersOpen;
  switch (action.type) {
    case "OPEN":
      return { ...defaultDrawersOpen, [action.tag]: action.payload };
    case "CLOSE":
      return { ...defaultDrawersOpen };
    default:
      return defaultDrawersOpen;
  }
}

export default function InitialCard(props) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const [drawersOpen, dispatchDrawersOpen] = useReducer(
    drawersOpenReducer,
    initialDrawersOpen
  );

  const [situation, setSituation] = useState();
  const [fit, setFit] = useState();
  const [fit1, setFit1] = useState();

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleRender = (e) => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleRender);
    return () => {
      window.removeEventListener("resize", handleRender);
    };
  }, []);

  useEffect(() => {
    if (!!fit && !!fit1) Simulator.test(fit, fit1, situation);
  }, [fit, fit1, situation]);

  return (
    <div style={{ display: "flex", flexDirection: "row-reverse" }}>
      <Grid
        style={{
          width: width < 1000 ? "100%" : width - 600,
          margin: 0,
        }}
        container
        spacing={3}
      >
        <Grid xs={12} container item justify="center"></Grid>
        <Grid xs={12} container item justify="center">
          <FitCard
            setFit={setFit}
            backgroundColor={theme.palette.property.blue}
            color={theme.palette.background.paper}
            tag={"fit"}
            drawersOpen={drawersOpen}
            dispatchDrawersOpen={dispatchDrawersOpen}
            cache={props.cache}
          />
        </Grid>
        <Grid xs={12} container item justify="center">
          <FitCard
            setFit={setFit1}
            backgroundColor={theme.palette.property.red}
            color={theme.palette.background.paper}
            tag={"fit1"}
            drawersOpen={drawersOpen}
            dispatchDrawersOpen={dispatchDrawersOpen}
            cache={props.cache}
          />
        </Grid>
        <Grid xs={12} container item justify="center">
          <ShipCanvas setSituation={setSituation} />
        </Grid>
        <Grid xs={12} container item justify="center">
          <Links />
          <Settings isDark={props.isDark} setIsDark={props.setIsDark} />
        </Grid>
      </Grid>
    </div>
  );
}
