import { Typography, useTheme, makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { Group } from "react-konva";
import { Html } from "react-konva-utils";
import { TransitionGroup, Transition } from "react-transition-group";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    overflow: "hidden",
    pointerEvents: "none",
  },
  textContainer: {
    transition: `${theme.transitions.create(["top"], {
      duration: 200,
    })} , ${theme.transitions.create(["opacity"], {
      duration: 1000,
    })}`,
    position: "absolute",
    overflow: "hidden",
    pointerEvents: "none",
    display: "inline-flex",
  },
  text: {
    pointerEvents: "none",
    userSelect: "none",
    msUserSelect: "none",
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
    fontFamily: "Arial",
  },
}));

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 0 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};
const EventConsoleKonvaHtml = (props) => {
  return (
    <Group
      x={props.target.anchors.anchor1X + props.offset / props.stageScale}
      y={props.target.anchors.anchor1Y + props.offset / props.stageScale}
    >
      <Html divProps={{ style: { zIndex: -1 } }}>
        <EventConsole
          logs={props.logs}
          rootID={props.target.rootID}
          size={props.size}
          stageScale={props.stageScale}
          theme={props.theme}
        />
      </Html>
    </Group>
  );
};
EventConsoleKonvaHtml.defaultProps = {
  stageScale: 1,
  size: 10,
  offset: 10,
};
export default EventConsoleKonvaHtml;

export function EventConsole(props) {
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  useEffect(() => {
    setEvents(
      props.logs
        .filter((log) => log.rootID === props.rootID)
        .map((log) => {
          const [itemName, chargeName] = log.summary.description.split(",");
          const hitCount = log.debugs?.reduce((acc, debug) => {
            const hit = debug.find((d) => d.type === "hit");
            if (hit.value) return acc + 1;
            return acc;
          }, 0);

          const descriptions = [
            chargeName !== "undefined" && !!chargeName
              ? `${chargeName}`
              : `${itemName}`,
          ];
          if (hitCount !== undefined)
            descriptions.push(`${hitCount}/${log.debugs.length}`);

          return {
            description: descriptions.join(" "),
            value: log.delta,
            ID: log.ID,
          };
        })
    );
  }, [props.logs]);

  return (
    <EveLogTransition
      events={events}
      size={props.size}
      stageScale={props.stageScale}
    >
      {(event, index) => (state) =>
        (
          <div
            className={classes.textContainer}
            style={{
              top: (index * 15) / props.stageScale,
              height: 15 / props.stageScale,
              ...transitionStyles[state],
            }}
          >
            <Typography
              className={classes.text}
              style={{
                fontSize: 12 / props.stageScale,
                marginRight: 5 / props.stageScale,
                color: props.theme.palette.text.primary,
              }}
            >
              {event.description}
            </Typography>
            <Typography
              className={classes.text}
              style={{
                fontSize: 12 / props.stageScale,
                marginRight: 5 / props.stageScale,
                color:
                  event.value === 0
                    ? props.theme.palette.property.org
                    : event.value < 0
                    ? props.theme.palette.property.red
                    : props.theme.palette.property.blue,
              }}
            >
              {Math.abs(event.value).toFixed(0)}
            </Typography>
          </div>
        )}
    </EveLogTransition>
  );
}

function EveLogTransition(props) {
  const classes = useStyles();

  return (
    <div
      className={classes.root}
      style={{
        width: 800 / props.stageScale,
        height: (15 * props.size) / props.stageScale,
      }}
    >
      <TransitionGroup component="div">
        {props.events
          ?.slice(-(props.size + 1))
          .reverse()
          .map((event, index) => {
            return (
              <Transition
                in={false}
                key={`${event.description}:${event.ID}`}
                timeout={5000}
              >
                {props.children(event, index)}
              </Transition>
            );
          })}
      </TransitionGroup>
    </div>
  );
}
