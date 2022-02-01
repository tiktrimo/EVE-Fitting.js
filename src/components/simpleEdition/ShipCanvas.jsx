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
    width: "85%",
    minWidth: 300,
    maxWidth: 600,
    height: "80%",
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

const logReducer = () => (state, action) => {
  switch (action.type) {
    case "update":
      state.push(action.payload);
      return state.slice(state.length - 20 > 0 ? state.length - 20 : 0);
    case "reset":
      return [];
    default:
      return state;
  }
};

const ShipCanvasButtonGroup = (props) => {
  const theme = useTheme();
  const handleResetClick = useCallback(() => {
    props.setStagePoint({});
    props.dispatchOnBoardAnchor({ type: "reset", value: onBoardAnchorInitial });
    props.dispatchHostileAnchor({ type: "reset", value: hostileAnchorInitial });
    props.dispatchLog({ type: "reset" });
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
        <ButtonGroup fullWidth style={{ color: theme.palette.text.primary }}>
          <Button
            variant={props.isStageDrragable ? "contained" : "outlined"}
            onClick={handleStageDrragable}
          >
            <PanToolIcon />
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
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
  const [distanceVector, setDistanceVector] = useState({
    x: hostileAnchor.anchors.anchor1X - onBoardAnchor.anchors.anchor1X,
    y: hostileAnchor.anchors.anchor1Y - onBoardAnchor.anchors.anchor1Y,
  });
  const [distance, setDistance] = useState(
    Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100
  );
  const [stageScale, setStageScale] = useState(1);
  const [stagePoint, setStagePoint] = useState({ x: 0, y: 0 });
  const [isStageDrragable, setStageDraggable] = useState(false);

  const logReducerRef = useRef(logReducer());
  const [logs, dispatchLog] = useReducer(logReducerRef.current, []);

  useEffect(() => {
    dispatchSituation();
    props.setDispatchLog(() => dispatchLog);
  }, []);

  useEffect(() => {
    const _distanceVector = {
      x: hostileAnchor.anchors.anchor1X - onBoardAnchor.anchors.anchor1X,
      y: hostileAnchor.anchors.anchor1Y - onBoardAnchor.anchors.anchor1Y,
    };
    const _distance =
      Math.sqrt(
        Math.pow(_distanceVector.x, 2) + Math.pow(_distanceVector.y, 2)
      ) / 100;
    setDistanceVector(_distanceVector);
    setDistance(_distance);
  }, [
    hostileAnchor.anchors.anchor1X,
    onBoardAnchor.anchors.anchor1X,
    hostileAnchor.anchors.anchor1Y,
    onBoardAnchor.anchors.anchor1Y,
  ]);

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
  }, [onBoardAnchor, hostileAnchor, distance]);

  return (
    <Card className={classes.root} elevation={3}>
      <ShipCanvasButtonGroup
        stageScale={stageScale}
        setStageScale={setStageScale}
        isStageDrragable={isStageDrragable}
        setStageDraggable={setStageDraggable}
        setStagePoint={setStagePoint}
        dispatchLog={dispatchLog}
        dispatchHostileAnchor={dispatchHostileAnchor}
        dispatchOnBoardAnchor={dispatchOnBoardAnchor}
      />
      <Stage
        style={{ zIndex: 1 }}
        x={stagePoint.x}
        y={stagePoint.y}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={isStageDrragable}
      >
        <Layer>
          <Text
            x={onBoardAnchor.anchors.anchor1X + onBoardAnchor.vector.x}
            y={onBoardAnchor.anchors.anchor1Y + onBoardAnchor.vector.y}
            fill={theme.palette.text.primary}
            text={`${(
              Math.sqrt(
                Math.pow(onBoardAnchor.vector.x, 2) +
                  Math.pow(onBoardAnchor.vector.y, 2)
              ) * 3
            ).toFixed(1)}m/s`}
            fontSize={12 / stageScale}
            offsetX={-2}
          />
          <Text
            x={hostileAnchor.anchors.anchor1X + hostileAnchor.vector.x}
            y={hostileAnchor.anchors.anchor1Y + hostileAnchor.vector.y}
            fill={theme.palette.text.primary}
            text={`${(
              Math.sqrt(
                Math.pow(hostileAnchor.vector.x, 2) +
                  Math.pow(hostileAnchor.vector.y, 2)
              ) * 3
            ).toFixed(1)}m/s`}
            fontSize={12 / stageScale}
            offsetX={-2}
          />
          <Text
            x={hostileAnchor.anchors.anchor1X + 12 / stageScale}
            y={hostileAnchor.anchors.anchor1Y - 15 / stageScale}
            fontSize={12 / stageScale}
            fill={theme.palette.text.primary}
            text={`${angleBetweenTwoVectors(
              distanceVector,
              hostileAnchor.vector
            ).toFixed(0)}°`}
          />
          <Arrow
            pointerLength={4 / stageScale}
            pointerWidth={4 / stageScale}
            points={[
              hostileAnchor.anchors.anchor1X,
              hostileAnchor.anchors.anchor1Y,
              hostileAnchor.anchors.anchor2X,
              hostileAnchor.anchors.anchor2Y,
            ]}
            strokeWidth={2 / stageScale}
            stroke={theme.palette.property.red}
            fill={theme.palette.property.red}
          />
          <Circle
            x={hostileAnchor.anchors.anchor1X}
            y={hostileAnchor.anchors.anchor1Y}
            fill="#C0C0C0"
            opacity={0.1}
            radius={20 / stageScale}
            draggable
            onDragMove={handleAnchor1OnDragMove(
              dispatchHostileAnchor,
              hostileAnchor
            )}
            onDragEnd={dispatchSituation}
          />
          <Circle
            x={hostileAnchor.anchors.anchor2X}
            y={hostileAnchor.anchors.anchor2Y}
            fill="#C0C0C0"
            opacity={0.1}
            radius={10 / stageScale}
            draggable
            onDragMove={handleAnchor2OnDragMove(dispatchHostileAnchor)}
            onDragEnd={(e) => {
              handleAnchor2OnDragEnd(dispatchHostileAnchor, hostileAnchor)(e);
              dispatchSituation();
            }}
          />
          <Arrow
            pointerLength={4 / stageScale}
            pointerWidth={4 / stageScale}
            points={[
              onBoardAnchor.anchors.anchor1X,
              onBoardAnchor.anchors.anchor1Y,
              onBoardAnchor.anchors.anchor2X,
              onBoardAnchor.anchors.anchor2Y,
            ]}
            strokeWidth={2 / stageScale}
            stroke={theme.palette.property.blue}
            fill={theme.palette.property.blue}
          />
          <Circle
            x={onBoardAnchor.anchors.anchor1X}
            y={onBoardAnchor.anchors.anchor1Y}
            radius={20 / stageScale}
            draggable
            onDragMove={handleAnchor1OnDragMove(
              dispatchOnBoardAnchor,
              onBoardAnchor
            )}
            onDragEnd={dispatchSituation}
            on
          />
          <Circle
            x={onBoardAnchor.anchors.anchor2X}
            y={onBoardAnchor.anchors.anchor2Y}
            radius={20 / stageScale}
            draggable
            onDragMove={handleAnchor2OnDragMove(dispatchOnBoardAnchor)}
            onDragEnd={(e) => {
              handleAnchor2OnDragEnd(dispatchOnBoardAnchor, onBoardAnchor)(e);
              dispatchSituation();
            }}
          />
          <Line
            points={[
              onBoardAnchor.anchors.anchor1X,
              onBoardAnchor.anchors.anchor1Y,
              hostileAnchor.anchors.anchor1X,
              hostileAnchor.anchors.anchor1Y,
            ]}
            strokeWidth={2 / stageScale}
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            dash={[5 / stageScale, 5 / stageScale]}
          />
          <Text
            //prettier-ignore
            x={
              (onBoardAnchor.anchors.anchor1X + hostileAnchor.anchors.anchor1X) / 2
            }
            //prettier-ignore
            y={
              (onBoardAnchor.anchors.anchor1Y + hostileAnchor.anchors.anchor1Y) / 2
            }
            fill={theme.palette.text.primary}
            fontSize={12 / stageScale}
            text={`${distance.toFixed(2)}km`}
            offsetX={-2}
            /* rotation={handleRotation(distanceVector)} */
          />

          <EventConsoleKonvaHtml
            theme={theme}
            logs={logs}
            target={hostileAnchor}
            stageScale={stageScale}
          />
          <EventConsoleKonvaHtml
            theme={theme}
            logs={logs}
            target={onBoardAnchor}
            stageScale={stageScale}
          />
        </Layer>
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
