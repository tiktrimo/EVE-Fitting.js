import React, { useEffect, useState } from "react";
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

export default function InitialCard(props) {
  const [width, setWidth] = useState(0);

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
          <FitCard cache={props.cache} />
        </Grid>
        <Grid xs={12} container item justify="center">
          <Links />
          <Settings isDark={props.isDark} setIsDark={props.setIsDark} />
        </Grid>
      </Grid>
    </div>
  );
}
