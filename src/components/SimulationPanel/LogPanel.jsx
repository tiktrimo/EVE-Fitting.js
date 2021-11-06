import { Button, Grid, Typography } from "@material-ui/core";
import React, { useReducer, useEffect, useState, useRef } from "react";

const logReducer = () => (state, action) => {
  switch (action.type) {
    case "damage":
      state.push({ ...action });
      return state.slice(state.length - 10 > 0 ? state.length - 10 : 0);
    case "clear":
      return [];
    default:
      return state;
  }
};

export default function LogPanel(props) {
  const reducerRef = useRef(logReducer());
  const [logs, dispatchLog] = useReducer(reducerRef.current, []);

  useEffect(() => {
    props.setDispatchLog(() => dispatchLog);
  }, []);

  return (
    <Grid style={{ position: "relative", height: 100 }}>
      <Button onClick={() => dispatchLog({ type: "clear" })}>Clear</Button>
      {logs.map((log, index) => {
        return (
          <Typography
            key={`${log.type}from${log.logColor}to${log.taretLogColor}:${index}`}
            style={{ color: log.logColor }}
          >
            {log.delta}
          </Typography>
        );
      })}
    </Grid>
  );
}
