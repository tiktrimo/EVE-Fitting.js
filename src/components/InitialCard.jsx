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
import useLongPress from "../services/useLongPress";
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
  errorButtonGroup: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    color: theme.palette.text.primary,
  },
}));

const Links = (props) => {
  const classes = useStyles();

  const [isError, setIsError] = useState(false);

  const longPressEvent = useLongPress(
    () => {
      setIsError(!isError);
    },
    () => {
      const newWindow = window.open(
        "https://github.com/tiktrimo/EVE-Fitting.js/wiki/Bug-&-Suggestion",
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }
  );

  return (
    <Paper elevation={2}>
      <ButtonGroup variant="text" className={classes.errorButtonGroup}>
        <Button
          href={"https://github.com/tiktrimo/EVE-Fitting.js"}
          target="_blank"
        >
          <GitHubIcon />
        </Button>
        <Button {...longPressEvent}>Report bug</Button>

        {isError && (
          <Button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear Local Storage and refresh
          </Button>
        )}
        <Button
          href={"https://github.com/tiktrimo/EVE-Fitting.js/wiki/Fitting"}
          target="_blank"
        >
          WIKI
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
          backgroundColor: theme.palette.action.disabled,
          height: 1,
          position: "absolute",
          top: 17,
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
            fontSize: 26,
            fontWeight: 600,
            color: theme.palette.action.disabled,
          }}
        >
          {props.label}
        </Typography>
      </div>
    </Grid>
  );
};

export default function InitialCard(props) {
  const theme = useTheme();

  const [width, setWidth] = useState(0);
  const widthRef = useRef(null);

  const [isCompact, setIsCompact] = useState(true);

  const [activeDrawer, setActiveDrawer] = useState("fit");
  const [situation, setSituation] = useState();
  const [slots0, setSlots0] = useState();
  const [slots1, setSlots1] = useState();

  useEffect(() => {
    setWidth(window.innerWidth);
    setIsCompact(widthRef.current?.offsetWidth < 800);

    const handleRender = (e) => {
      setWidth(window.innerWidth);
      setIsCompact(widthRef.current?.offsetWidth < 800);
    };
    window.addEventListener("resize", handleRender);
    return () => {
      window.removeEventListener("resize", handleRender);
    };
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
        <Grid
          xs={isCompact ? 12 : 6}
          container
          item
          justifyContent={isCompact ? "center" : "flex-end"}
        >
          <FitCard
            setSlots={setSlots0}
            backgroundColor={theme.palette.property.blue}
            color={theme.palette.background.paper}
            tag={"fit"}
            activeDrawer={activeDrawer}
            setActiveDrawer={setActiveDrawer}
            cache={props.cache}
          />
        </Grid>
        <Grid
          xs={isCompact ? 12 : 6}
          container
          item
          justifyContent={isCompact ? "center" : "flex-start"}
        >
          <FitCard
            setSlots={setSlots1}
            backgroundColor={theme.palette.property.red}
            color={theme.palette.background.paper}
            tag={"fit1"}
            activeDrawer={activeDrawer}
            setActiveDrawer={setActiveDrawer}
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
          cache={props.cache}
        />

        <Grid xs={12} container item justifyContent="center">
          <Links />
          <Settings isDark={props.isDark} setIsDark={props.setIsDark} />
        </Grid>
      </Grid>
    </div>
  );
}
