import React, { useRef } from "react";
import { Stage, Layer, Arrow, Circle, Line, Text, Group } from "react-konva";
import {
  makeStyles,
  Card,
  Button,
  Grid,
  ButtonGroup,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import { useEffect } from "react";
import { useReducer } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useCallback } from "react";
import PanToolIcon from "@material-ui/icons/PanTool";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ReplayIcon from "@material-ui/icons/Replay";
import EventConsoleKonvaHtml from "../SimulationPanel/EventConsoleKonvaHtml";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    minWidth: 300,
    maxWidth: 600,
    height: "100%",
  },
}));

const hostileAnchorInitial = {
  rootID: "hostileID",
  maximumSpeed: Infinity,
  speed: 150,
  anchors: {
    anchor1X: 25,
    anchor1Y: 200,
    anchor2X: 75,
    anchor2Y: 200,
  },
  vector: {
    x: 50,
    y: 0,
    pX: 50,
    pY: 0,
  },
};

const onBoardAnchorInitial = {
  rootID: "onboardID",
  maximumSpeed: Infinity,
  speed: 0,
  anchors: {
    anchor1X: 25,
    anchor1Y: 25,
    anchor2X: 25,
    anchor2Y: 25,
  },
  vector: {
    x: 0,
    y: 0,
    pX: 0,
    pY: 0,
  },
};
function anchorReducer(state, action) {
  let isAutoMaxSpeed = false;
  switch (action.type) {
    case "anchor1":
      return {
        ...state,
        anchors: { ...state.anchors, ...action.value },
      };

    case "maximumSpeed": // There is no break cuz we need to update anchors if ship have lower maxV than velocity on canvas, TLDR : it is intentional
      if (state.maximumSpeed * 0.95 < state.speed) {
        isAutoMaxSpeed = true;
        state.speed = state.maximumSpeed;
      }
      state.maximumSpeed = action.value;
      action.value = { ...state.anchors };
    case "anchor2":
      const vectorX = action.value.anchor2X - state.anchors.anchor1X;
      const vectorY = action.value.anchor2Y - state.anchors.anchor1Y;
      const speed = 3 * Math.sqrt(Math.pow(vectorX, 2) + Math.pow(vectorY, 2));
      const vectorModifier = isAutoMaxSpeed
        ? state.maximumSpeed / speed
        : speed > state.maximumSpeed
        ? state.maximumSpeed / speed
        : 1;

      return {
        ...state,
        speed: speed,
        anchors: {
          ...state.anchors,
          anchor2X: state.anchors.anchor1X + vectorX * vectorModifier,
          anchor2Y: state.anchors.anchor1Y + vectorY * vectorModifier,
        },
        vector: {
          ...state.vector,
          x: vectorX * vectorModifier,
          y: vectorY * vectorModifier,
        },
      };

    case "vector":
      return {
        ...state,
        vector: { ...state.vector, x: action.value.x, y: action.value.y },
      };

    case "perfectVector":
      return {
        ...state,
        vector: { ...state.vector, pX: action.value.pX, pY: action.value.pY },
      };

    case "reset":
      return { ...action.value };
    default:
      return Error();
  }
}

const logReducer = (state, action) => {
  switch (action.type) {
    case "update":
      action.payload.forEach((log) => {
        state.push(log);
      });

      return state.slice(state.length - 20 > 0 ? state.length - 20 : 0);
    default:
      return state;
  }
};

const ShipCanvasButtonGroup = React.memo((props) => {
  const theme = useTheme();
  const handleResetClick = useCallback(() => {
    props.setStagePoint({ x: 0, y: 0 });
    props.dispatchOnBoardAnchor({ type: "reset", value: onBoardAnchorInitial });
    props.dispatchHostileAnchor({ type: "reset", value: hostileAnchorInitial });
  }, []);

  const handleMagnifyButton = useCallback(() => {
    props.setStageScale(props.stageScale * 1.5);
  }, [props.stageScale]);

  const handleMinifyButton = useCallback(() => {
    props.setStageScale(props.stageScale * 0.65);
  }, [props.stageScale]);

  const handleStageDrragable = useCallback(() => {
    props.setStageDraggable(!props.isStageDrragable);
  }, [props.isStageDrragable]);

  return (
    <Grid
      style={{ padding: 5 }}
      spacing={1}
      container
      justifyContent="flex-end"
    >
      <Grid item xs={8}>
        <ButtonGroup fullWidth style={{ color: theme.palette.text.primary }}>
          <Button onClick={handleMagnifyButton}>
            <ZoomInIcon />
          </Button>
          <Button onClick={handleResetClick}>
            <ReplayIcon />
          </Button>
          <Button onClick={handleMinifyButton}>
            <ZoomOutIcon />
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={4}>
        <ButtonGroup fullWidth>
          <Button
            style={{
              color: props.isStageDrragable
                ? theme.palette.background.paper
                : theme.palette.text.primary,
              backgroundColor: props.isStageDrragable
                ? theme.palette.text.primary
                : theme.palette.background.paper,
            }}
            variant={props.isStageDrragable ? "contained" : "outlined"}
            onClick={handleStageDrragable}
          >
            <PanToolIcon />
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
});

const ShipCanvasTacticalMap = React.memo((props) => {
  const [distanceVector, setDistanceVector] = useState({
    x:
      props.hostileAnchor.anchors.anchor1X -
      props.onBoardAnchor.anchors.anchor1X,
    y:
      props.hostileAnchor.anchors.anchor1Y -
      props.onBoardAnchor.anchors.anchor1Y,
  });
  const [distance, setDistance] = useState(
    Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100
  );

  useEffect(() => {
    const _distanceVector = {
      x:
        props.hostileAnchor.anchors.anchor1X -
        props.onBoardAnchor.anchors.anchor1X,
      y:
        props.hostileAnchor.anchors.anchor1Y -
        props.onBoardAnchor.anchors.anchor1Y,
    };
    const _distance =
      Math.sqrt(
        Math.pow(_distanceVector.x, 2) + Math.pow(_distanceVector.y, 2)
      ) / 100;
    setDistanceVector(_distanceVector);
    setDistance(_distance);
  }, [
    props.hostileAnchor.anchors.anchor1X,
    props.onBoardAnchor.anchors.anchor1X,
    props.hostileAnchor.anchors.anchor1Y,
    props.onBoardAnchor.anchors.anchor1Y,
  ]);

  return (
    <Layer>
      <Text
        x={props.onBoardAnchor.anchors.anchor1X + props.onBoardAnchor.vector.x}
        y={props.onBoardAnchor.anchors.anchor1Y + props.onBoardAnchor.vector.y}
        fill={props.theme.palette.text.primary}
        text={`${(
          Math.sqrt(
            Math.pow(props.onBoardAnchor.vector.x, 2) +
              Math.pow(props.onBoardAnchor.vector.y, 2)
          ) * 3
        ).toFixed(1)}m/s`}
        fontSize={12 / props.stageScale}
        offsetX={-2}
      />
      <Text
        x={props.hostileAnchor.anchors.anchor1X + props.hostileAnchor.vector.x}
        y={props.hostileAnchor.anchors.anchor1Y + props.hostileAnchor.vector.y}
        fill={props.theme.palette.text.primary}
        text={`${(
          Math.sqrt(
            Math.pow(props.hostileAnchor.vector.x, 2) +
              Math.pow(props.hostileAnchor.vector.y, 2)
          ) * 3
        ).toFixed(1)}m/s`}
        fontSize={12 / props.stageScale}
        offsetX={-2}
      />
      <Text
        x={props.hostileAnchor.anchors.anchor1X + 12 / props.stageScale}
        y={props.hostileAnchor.anchors.anchor1Y - 15 / props.stageScale}
        fontSize={12 / props.stageScale}
        fill={props.theme.palette.text.primary}
        text={`${angleBetweenTwoVectors(
          distanceVector,
          props.hostileAnchor.vector
        ).toFixed(0)}°`}
      />
      <Arrow
        pointerLength={4 / props.stageScale}
        pointerWidth={4 / props.stageScale}
        points={[
          props.hostileAnchor.anchors.anchor1X,
          props.hostileAnchor.anchors.anchor1Y,
          props.hostileAnchor.anchors.anchor2X,
          props.hostileAnchor.anchors.anchor2Y,
        ]}
        strokeWidth={2 / props.stageScale}
        stroke={props.theme.palette.property.red}
        fill={props.theme.palette.property.red}
      />
      <Circle
        x={props.hostileAnchor.anchors.anchor1X}
        y={props.hostileAnchor.anchors.anchor1Y}
        fill="#C0C0C0"
        opacity={0.1}
        radius={20 / props.stageScale}
        draggable
        onDragMove={handleAnchor1OnDragMove(
          props.dispatchHostileAnchor,
          props.hostileAnchor
        )}
        onDragEnd={props.dispatchSituation}
      />
      <Circle
        x={props.hostileAnchor.anchors.anchor2X}
        y={props.hostileAnchor.anchors.anchor2Y}
        fill="#C0C0C0"
        opacity={0.1}
        radius={10 / props.stageScale}
        draggable
        onDragMove={handleAnchor2OnDragMove(props.dispatchHostileAnchor)}
        onDragEnd={(e) => {
          handleAnchor2OnDragEnd(
            props.dispatchHostileAnchor,
            props.hostileAnchor
          )(e);
          props.dispatchSituation();
        }}
      />
      <Arrow
        pointerLength={4 / props.stageScale}
        pointerWidth={4 / props.stageScale}
        points={[
          props.onBoardAnchor.anchors.anchor1X,
          props.onBoardAnchor.anchors.anchor1Y,
          props.onBoardAnchor.anchors.anchor2X,
          props.onBoardAnchor.anchors.anchor2Y,
        ]}
        strokeWidth={2 / props.stageScale}
        stroke={props.theme.palette.property.blue}
        fill={props.theme.palette.property.blue}
      />
      <Circle
        x={props.onBoardAnchor.anchors.anchor1X}
        y={props.onBoardAnchor.anchors.anchor1Y}
        radius={20 / props.stageScale}
        draggable
        onDragMove={handleAnchor1OnDragMove(
          props.dispatchOnBoardAnchor,
          props.onBoardAnchor
        )}
        onDragEnd={props.dispatchSituation}
        on
      />
      <Circle
        x={props.onBoardAnchor.anchors.anchor2X}
        y={props.onBoardAnchor.anchors.anchor2Y}
        radius={20 / props.stageScale}
        draggable
        onDragMove={handleAnchor2OnDragMove(props.dispatchOnBoardAnchor)}
        onDragEnd={(e) => {
          handleAnchor2OnDragEnd(
            props.dispatchOnBoardAnchor,
            props.onBoardAnchor
          )(e);
          props.dispatchSituation();
        }}
      />
      <Line
        points={[
          props.onBoardAnchor.anchors.anchor1X,
          props.onBoardAnchor.anchors.anchor1Y,
          props.hostileAnchor.anchors.anchor1X,
          props.hostileAnchor.anchors.anchor1Y,
        ]}
        strokeWidth={2 / props.stageScale}
        stroke={props.theme.palette.primary.main}
        fill={props.theme.palette.primary.main}
        dash={[5 / props.stageScale, 5 / props.stageScale]}
      />
      <Text
        x={
          (props.onBoardAnchor.anchors.anchor1X +
            props.hostileAnchor.anchors.anchor1X) /
          2
        }
        y={
          (props.onBoardAnchor.anchors.anchor1Y +
            props.hostileAnchor.anchors.anchor1Y) /
          2
        }
        fill={props.theme.palette.text.primary}
        fontSize={12 / props.stageScale}
        text={`${distance.toFixed(2)}km`}
        offsetX={-2}
        /* rotation={handleRotation(distanceVector)} */
      />
    </Layer>
  );
});

const ShipCanvasLog = (props) => {
  const [logs, dispatchLog] = useReducer(logReducer, []);

  useEffect(() => {
    props.setDispatchLog(() => dispatchLog);
  }, []);

  return (
    <Layer>
      <EventConsoleKonvaHtml
        theme={props.theme}
        logs={logs}
        target={props.hostileAnchor}
        stageScale={props.stageScale}
      />
      <EventConsoleKonvaHtml
        theme={props.theme}
        logs={logs}
        target={props.onBoardAnchor}
        stageScale={props.stageScale}
      />
    </Layer>
  );
};

export default function ShipCanvas(props) {
  const theme = useTheme();
  const classes = useStyles();

  const [hostileAnchor, dispatchHostileAnchor] = useReducer(
    anchorReducer,
    hostileAnchorInitial
  );
  const [onBoardAnchor, dispatchOnBoardAnchor] = useReducer(
    anchorReducer,
    onBoardAnchorInitial
  );

  const [stageScale, setStageScale] = useState(1);
  const [stagePoint, setStagePoint] = useState({ x: 0, y: 0 });
  const [isStageDrragable, setStageDraggable] = useState(false);

  useEffect(() => {
    dispatchSituation();
  }, []);

  useEffect(() => {
    if (!!props.hostileSummaries?.summary.capacity.propulsion.maximumVelocity)
      dispatchHostileAnchor({
        type: "maximumSpeed",
        value:
          props.hostileSummaries.summary.capacity.propulsion.maximumVelocity,
      });
  }, [props.hostileSummaries?.summary.capacity.propulsion.maximumVelocity]);

  useEffect(() => {
    if (!!props.onBoardSummaries?.summary.capacity.propulsion.maximumVelocity)
      dispatchOnBoardAnchor({
        type: "maximumSpeed",
        value:
          props.onBoardSummaries.summary.capacity.propulsion.maximumVelocity,
      });
  }, [props.onBoardSummaries?.summary.capacity.propulsion.maximumVelocity]);

  const dispatchSituation = useCallback(() => {
    props.setSituation({
      onboard: onBoardAnchor,
      hostile: hostileAnchor,
    });
  }, [onBoardAnchor, hostileAnchor]);

  return (
    <Card className={classes.root} elevation={3}>
      <ShipCanvasButtonGroup
        stageScale={stageScale}
        setStageScale={setStageScale}
        isStageDrragable={isStageDrragable}
        setStageDraggable={setStageDraggable}
        setStagePoint={setStagePoint}
        dispatchHostileAnchor={dispatchHostileAnchor}
        dispatchOnBoardAnchor={dispatchOnBoardAnchor}
      />
      <Stage
        style={{ zIndex: 1 }}
        x={stagePoint.x}
        y={stagePoint.y}
        width={window.innerWidth}
        height={window.innerHeight / 2} // modify as you want. only visual change
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={isStageDrragable}
        onDragMove={() => {}} // Only here to supress warning message (if draggable = true there should be onDragMove function)
      >
        <ShipCanvasTacticalMap
          theme={theme}
          stageScale={stageScale}
          onBoardAnchor={onBoardAnchor}
          hostileAnchor={hostileAnchor}
          dispatchSituation={dispatchSituation}
          dispatchHostileAnchor={dispatchHostileAnchor}
          dispatchOnBoardAnchor={dispatchOnBoardAnchor}
        />
        <ShipCanvasLog
          theme={theme}
          stageScale={stageScale}
          setDispatchLog={props.setDispatchLog}
          onBoardAnchor={onBoardAnchor}
          hostileAnchor={hostileAnchor}
        />
      </Stage>
    </Card>
  );
}
function handleAnchor1OnDragMove(dispatchAnchor, anchor) {
  return (e) => {
    dispatchAnchor({
      type: "anchor1",
      value: { anchor1X: e.target.attrs.x, anchor1Y: e.target.attrs.y },
    });
    dispatchAnchor({
      type: "anchor2",
      value: {
        anchor2X: e.target.attrs.x + anchor.vector.pX,
        anchor2Y: e.target.attrs.y + anchor.vector.pY,
      },
    });
  };
}
function handleAnchor2OnDragMove(dispatchAnchor) {
  return (e) => {
    dispatchAnchor({
      type: "anchor2",
      value: { anchor2X: e.target.attrs.x, anchor2Y: e.target.attrs.y },
    });
  };
}
function handleAnchor2OnDragEnd(dispatchAnchor, anchor) {
  return (e) => {
    dispatchAnchor({
      type: "perfectVector",
      value: {
        pX: e.target.attrs.x - anchor.anchors.anchor1X,
        pY: e.target.attrs.y - anchor.anchors.anchor1Y,
      },
    });
  };
}

function innerProduct(distanceVector, velocityVector) {
  return (
    distanceVector.x * velocityVector.x + distanceVector.y * velocityVector.y
  );
}
function vectorLength(vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}
function angleBetweenTwoVectors(distanceVector, velocityVector) {
  const cosValue =
    innerProduct(distanceVector, velocityVector) /
    (vectorLength(distanceVector) * vectorLength(velocityVector));
  return Math.acos(cosValue) * (180 / Math.PI);
}
