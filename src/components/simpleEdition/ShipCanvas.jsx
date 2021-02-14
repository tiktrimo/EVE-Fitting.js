import React from "react";
import { Stage, Layer, Arrow, Circle, Line, Text } from "react-konva";
import {
  makeStyles,
  Card,
  Button,
  Grid,
  ButtonGroup,
  Icon,
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

const useStyles = makeStyles((theme) => ({
  root: {
    width: "85%",
    minWidth: 300,
    maxWidth: 600,
    height: "80%",
  },
}));

const hostileAnchorInitial = {
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
function hostileAnchorReducer(state, action) {
  switch (action.type) {
    case "anchor1":
      return {
        ...state,
        anchors: { ...state.anchors, ...action.value },
      };

    case "anchor2":
      return {
        ...state,
        anchors: { ...state.anchors, ...action.value },
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
      return hostileAnchorInitial;
    default:
      return Error();
  }
}
const onBoardAnchorInitial = {
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
function onBoardAnchorReducer(state, action) {
  switch (action.type) {
    case "anchor1":
      return {
        ...state,
        anchors: { ...state.anchors, ...action.value },
      };

    case "anchor2":
      return {
        ...state,
        anchors: { ...state.anchors, ...action.value },
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
      return onBoardAnchorInitial;
    default:
      return Error();
  }
}

export default function ShipCanvas(props) {
  const [hostileAnchor, dispatchHostileAnchor] = useReducer(
    hostileAnchorReducer,
    hostileAnchorInitial
  );
  const [onBoardAnchor, dispatchOnBoardAnchor] = useReducer(
    onBoardAnchorReducer,
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
  const [stageWheel, setStageWheel] = useState(1);
  const [stageScale, setStageScale] = useState(1);
  const [stagePoint, setStagePoint] = useState({ x: 0, y: 0 });
  const [isStageDrragable, setStageDraggable] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const vectorX =
      hostileAnchor.anchors.anchor2X - hostileAnchor.anchors.anchor1X;
    const vectorY =
      hostileAnchor.anchors.anchor2Y - hostileAnchor.anchors.anchor1Y;
    dispatchHostileAnchor({
      type: "vector",
      value: { x: vectorX, y: vectorY },
    });
  }, [hostileAnchor.anchors.anchor2X, hostileAnchor.anchors.anchor2Y]);

  useEffect(() => {
    const vectorX =
      onBoardAnchor.anchors.anchor2X - onBoardAnchor.anchors.anchor1X;
    const vectorY =
      onBoardAnchor.anchors.anchor2Y - onBoardAnchor.anchors.anchor1Y;
    dispatchOnBoardAnchor({
      type: "vector",
      value: { x: vectorX, y: vectorY },
    });
  }, [onBoardAnchor.anchors.anchor2X, onBoardAnchor.anchors.anchor2Y]);

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
    dispatchSituation();
  }, []);

  const dispatchSituation = useCallback(() => {
    props.setSituation({
      onboard: { ...onBoardAnchor },
      hostile: { ...hostileAnchor },
    });
  }, [onBoardAnchor, hostileAnchor, distance]);

  const handleResetClick = useCallback(() => {
    setStagePoint({});
    dispatchOnBoardAnchor({ type: "reset" });
    dispatchHostileAnchor({ type: "reset" });
  }, []);

  const handleMagnifyButton = useCallback(() => {
    setStageScale(stageScale * 1.5);
    setStageWheel(stageScale * 1.5);
  }, [stageScale]);

  const handleMinifyButton = useCallback(() => {
    setStageScale(stageScale * 0.65);
    setStageWheel(stageScale * 0.65);
  }, [stageScale]);

  const handleStageDrragable = useCallback(() => {
    setStageDraggable(!isStageDrragable);
  }, [isStageDrragable]);

  const classes = useStyles();

  return (
    <React.Fragment>
      <Card className={classes.root} elevation={3}>
        <Grid style={{ padding: 5 }} spacing={1} container justify="flex-end">
          <Grid item xs={8}>
            <ButtonGroup fullWidth color="primary">
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
            <ButtonGroup fullWidth color="primary">
              <Button
                variant={isStageDrragable ? "contained" : "outlined"}
                onClick={handleStageDrragable}
              >
                <PanToolIcon />
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>

        <Stage
          x={stagePoint.x}
          y={stagePoint.y}
          width={window.innerWidth}
          height={window.innerHeight}
          onWheel={handleWheel(setStageWheel, setStageScale)}
          scaleX={stageWheel}
          scaleY={stageWheel}
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
              onDragMove={handleHostileAnchor1OnDragMove(
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
              onDragMove={handleHostileAnchor2OnDragMove(dispatchHostileAnchor)}
              onDragEnd={(e) => {
                handleHostileAnchor2OnDragEnd(
                  dispatchHostileAnchor,
                  hostileAnchor
                )(e);
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
              onDragMove={handleOnBoardAnchor1OnDragMove(
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
              onDragMove={handleOnBoardAnchor2OnDragMove(dispatchOnBoardAnchor)}
              onDragEnd={(e) => {
                handleOnBoardAnchor2OnDragEnd(
                  dispatchOnBoardAnchor,
                  onBoardAnchor
                )(e);
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
          </Layer>
        </Stage>
      </Card>
    </React.Fragment>
  );
}
function handleHostileAnchor1OnDragMove(dispatchHostileAnchor, hostileAnchor) {
  return (e) => {
    dispatchHostileAnchor({
      type: "anchor1",
      value: { anchor1X: e.target.attrs.x, anchor1Y: e.target.attrs.y },
    });
    dispatchHostileAnchor({
      type: "anchor2",
      value: {
        anchor2X: e.target.attrs.x + hostileAnchor.vector.pX,
        anchor2Y: e.target.attrs.y + hostileAnchor.vector.pY,
      },
    });
  };
}
function handleHostileAnchor2OnDragMove(dispatchHostileAnchor) {
  return (e) => {
    dispatchHostileAnchor({
      type: "anchor2",
      value: { anchor2X: e.target.attrs.x, anchor2Y: e.target.attrs.y },
    });
  };
}
function handleHostileAnchor2OnDragEnd(dispatchHostileAnchor, hostileAnchor) {
  return (e) => {
    dispatchHostileAnchor({
      type: "perfectVector",
      value: {
        pX: e.target.attrs.x - hostileAnchor.anchors.anchor1X,
        pY: e.target.attrs.y - hostileAnchor.anchors.anchor1Y,
      },
    });
  };
}

function handleOnBoardAnchor1OnDragMove(dispatchOnBoardAnchor, onBoardAnchor) {
  return (e) => {
    dispatchOnBoardAnchor({
      type: "anchor1",
      value: { anchor1X: e.target.attrs.x, anchor1Y: e.target.attrs.y },
    });
    dispatchOnBoardAnchor({
      type: "anchor2",
      value: {
        anchor2X: e.target.attrs.x + onBoardAnchor.vector.pX,
        anchor2Y: e.target.attrs.y + onBoardAnchor.vector.pY,
      },
    });
  };
}
function handleOnBoardAnchor2OnDragMove(dispatchOnBoardAnchor) {
  return (e) => {
    dispatchOnBoardAnchor({
      type: "anchor2",
      value: { anchor2X: e.target.attrs.x, anchor2Y: e.target.attrs.y },
    });
  };
}
function handleOnBoardAnchor2OnDragEnd(dispatchOnBoardAnchor, onBoardAnchor) {
  return (e) => {
    dispatchOnBoardAnchor({
      type: "perfectVector",
      value: {
        pX: e.target.attrs.x - onBoardAnchor.anchors.anchor1X,
        pY: e.target.attrs.y - onBoardAnchor.anchors.anchor1Y,
      },
    });
  };
}
function handleWheel(setStageWheel, setStageScale) {
  return (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.5;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStageWheel(newScale);
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
