import React from "react";
import FitCard from "./FitCard/FitCard";
import { Button, ButtonGroup, Grid, Paper } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

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

export default function initialCard(props) {
  return (
    <Grid style={{ width: "100%", margin: 0 }} container spacing={3}>
      <Grid xs={12} container item justify="center"></Grid>
      <Grid xs={12} container item justify="center">
        <FitCard cache={props.cache} />
      </Grid>
      <Grid xs={12} container item justify="center">
        <Links />
      </Grid>
    </Grid>
  );
}
