import { Typography, useTheme, makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { TransitionGroup, Transition } from "react-transition-group";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    overflow: "hidden",
    pointerEvents: "none",
  },
  text: {
    transition: `${theme.transitions.create(["top"], {
      duration: 200,
    })}, ${theme.transitions.create(["opacity"], {
      duration: 1000,
      delay: 5000,
    })}`,
    pointerEvents: "none",
    userSelect: "none",
    msUserSelect: "none",
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
    position: "absolute",
    color: theme.palette.text.primary,
    fontFamily: "Arial",
  },
}));

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 0 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

export default function EventConsole(props) {
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  console.log(props.logs);
  useEffect(() => {
    setEvents(
      props.logs
        .filter((log) => log.location.rootID === props.rootID)
        .map((log) => ({ text: log.delta.toString(), ID: log.ID }))
    );
  }, [props.logs]);

  return (
    <div
      className={classes.root}
      style={{
        width: 400 / props.stageScale,
        height: (15 * props.size) / props.stageScale,
      }}
    >
      <TransitionGroup component="div">
        {events
          ?.slice(-(props.size + 1))
          .reverse()
          .map((event, index) => {
            return (
              <Transition
                in={false}
                key={`${event.text}:${event.ID}`}
                timeout={0}
              >
                {(state) => (
                  <Typography
                    className={classes.text}
                    style={{
                      top: (index * 15) / props.stageScale,
                      fontSize: 12 / props.stageScale,
                      ...transitionStyles[state],
                    }}
                  >
                    {event.text}
                  </Typography>
                )}
              </Transition>
            );
          })}
      </TransitionGroup>
    </div>
  );
}
