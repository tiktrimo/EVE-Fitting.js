import { Typography, useTheme } from "@material-ui/core";
import React from "react";
import { useEffect } from "react";

export default function EventDescriber(props) {
  return <div style={{ width: 100, height: 100 }}></div>;
}

function AnimatedTexts(props) {
  const theme = useTheme();
  useEffect(() => {}, [props.texts]);

  return <React.Fragment></React.Fragment>;

  /* return (
    <React.Fragment>
      {logs.map((log, index) => {
        return (
          <Text
            key={`${log.type}from${log.logColor}to${log.taretLogColor}:${index}`}
            x={50}
            y={10 + 10 * index}
            fill={theme.palette.text.primary}
            fontSize={12 / stageScale}
            text={log.delta.toFixed(1)}
          />
        );
      })}
    </React.Fragment>
  ); */
}
