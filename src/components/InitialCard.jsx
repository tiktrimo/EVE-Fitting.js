import React, { useEffect, useReducer, useState } from "react";
import FitCard from "./FitCard/FitCard";
import {
  Button,
  ButtonGroup,
  Grid,
  makeStyles,
  Paper,
  Typography,
  useTheme,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import Brightness2Icon from "@material-ui/icons/Brightness2";
import SimulationPanel from "./SimulationPanel/SimulationPanel";
import Fit from "../fitter/src/Fit";
import EFT from "./Drawers/services/EFT";
import { useRef } from "react";

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
  const theme = useTheme();
  return (
    <Paper elevation={2}>
      <ButtonGroup variant="text" style={{ color: theme.palette.text.primary }}>
        <Button
          href={"https://github.com/tiktrimo/EVE-Fitting.js"}
          target="_blank"
        >
          <GitHubIcon />
        </Button>
        <Button
          href={"https://github.com/tiktrimo/EVE-Fitting.js/issues"}
          target="_blank"
        >
          ERROR REPORT
        </Button>
        <Button
          href={
            "https://github.com/tiktrimo/EVE-Fitting.js/blob/master/DOCS/DOCS.md"
          }
          target="_blank"
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

const Header = (props) => {
  const theme = useTheme();
  return (
    <Grid
      style={{ position: "relative" }}
      xs={12}
      container
      item
      justifyContent="center"
    >
      <div
        style={{
          width: 400,
          backgroundColor: theme.palette.divider,
          height: 1,
          position: "absolute",
          top: 16,
          zIndex: -1,
        }}
      />
      <div
        style={{
          width: 200,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: theme.palette.divider,
          }}
        >
          {props.label}
        </Typography>
      </div>
    </Grid>
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
  const widthRef = useRef(null);

  const [isCompact, setIsCompact] = useState(false);
  const [drawersOpen, dispatchDrawersOpen] = useReducer(
    drawersOpenReducer,
    initialDrawersOpen
  );

  const [situation, setSituation] = useState();
  const [slots0, setSlots0] = useState();
  const [slots1, setSlots1] = useState();

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
    setIsCompact(widthRef.current?.offsetWidth < 800);
  }, [widthRef.current?.offsetWidth]);

  return (
    <div style={{ display: "flex", flexDirection: "row-reverse" }}>
      <Grid
        innerRef={widthRef}
        style={{
          width: width < 1000 ? "100%" : width - 620,
          margin: 0,
          paddingTop: 12,
        }}
        container
        spacing={3}
      >
        <Grid xs={12} container item justifyContent="center">
          <Header label="FITTING" />
        </Grid>
        <Grid xs={isCompact ? 12 : 6} container item justifyContent="center">
          <FitCard
            setSlots={setSlots0}
            backgroundColor={theme.palette.property.blue}
            color={theme.palette.background.paper}
            tag={"fit"}
            drawersOpen={drawersOpen}
            dispatchDrawersOpen={dispatchDrawersOpen}
            cache={props.cache}
          />
        </Grid>
        <Grid xs={isCompact ? 12 : 6} container item justifyContent="center">
          <FitCard
            setSlots={setSlots1}
            backgroundColor={theme.palette.property.red}
            color={theme.palette.background.paper}
            tag={"fit1"}
            drawersOpen={drawersOpen}
            dispatchDrawersOpen={dispatchDrawersOpen}
            cache={props.cache}
          />
        </Grid>

        <Grid xs={12} container item justifyContent="center">
          <Header label="SIMULATION" />
        </Grid>

        <SimulationPanel
          isCompact={isCompact}
          slotsSet={[slots0, slots1]}
          situation={situation}
          setSituation={setSituation}
        />

        <Grid xs={12} container item justifyContent="center">
          <Links />
          <Settings isDark={props.isDark} setIsDark={props.setIsDark} />
        </Grid>
      </Grid>
    </div>
  );
}
