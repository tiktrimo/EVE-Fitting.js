import React from "react";
import { Grid, Tooltip } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import InfoIcon from "@material-ui/icons/Info";
import RecButton from "../RecButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import ExposurePlus1Icon from "@material-ui/icons/ExposurePlus1";
import { red, blue, orange, green } from "@material-ui/core/colors";
import SetStateMenu from "./SetStateMenu";
import SyncIcon from "@material-ui/icons/Sync";
import SyncDisabledIcon from "@material-ui/icons/SyncDisabled";
import { useState } from "react";
import { useEffect } from "react";

const DeleteButton = function (props) {
  return (
    <Tooltip title="Delete" placement="bottom" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: red[500],
            color: "#ffffff",
          }}
          onClick={() => props.setItem("DEL")}
          disabled={!props.activeItem?.typeID}
        >
          <CloseIcon />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const AmmoDeleteButton = function (props) {
  return (
    <Tooltip title="Delete ammo" placement="bottom" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: orange[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.dispatchListItems({ type: "AMMO", payload: "DEL" });
          }}
          disabled={!props.activeCharge?.typeID}
        >
          <HighlightOffIcon />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const ShowInfoButton = function (props) {
  return (
    <Tooltip title="Information" placement="bottom" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: blue[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.dispatchSlotsOpen({
              type: "STAT",
              payload: {
                open: true,
                slotVariant: props.activeSlot.type,
                slotNumber: props.activeSlot.index,
              },
            });
          }}
          disabled={!props.activeItem?.typeID}
        >
          <InfoIcon />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const AddButton = function (props) {
  return (
    <Tooltip title="Add drone" placement="bottom" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: green[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.dispatchListItems({
              type: "DRONE_SLOT",
              payload: "ADD",
            });
          }}
          disabled={!props.activeItem?.typeID}
        >
          <ExposurePlus1Icon />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const LoopOrNotButton = function (props) {
  const [isLoop, setIsLoop] = useState(true);

  useEffect(() => {
    if (props.liftedIsLoop !== isLoop) setIsLoop(props.liftedIsLoop);
  }, [props.liftedIsLoop]);

  return (
    <Tooltip title="Loop through slots" placement="bottom" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: isLoop ? green[500] : red[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.setItem("LOOPLOOP");
            props.setLiftedIsLoop(!isLoop);
            setIsLoop(!isLoop);
          }}
        >
          {isLoop ? <SyncIcon /> : <SyncDisabledIcon />}
        </RecButton>
      </div>
    </Tooltip>
  );
};

export default function ListDrawerButtons(props) {
  return (
    <Grid container>
      <Grid item xs={2}>
        <DeleteButton {...props} />
      </Grid>
      <Grid item xs={2}>
        <AmmoDeleteButton {...props} />
      </Grid>
      <Grid item xs={2}>
        <ShowInfoButton {...props} />
      </Grid>
      <Grid item xs={2}>
        <SetStateMenu {...props} />
      </Grid>
      {props.variant === "DRONE_SLOT" ? (
        <Grid item xs={2}>
          <AddButton {...props} />
        </Grid>
      ) : (
        <Grid item xs={2}></Grid>
      )}

      <Grid item xs={2}>
        <LoopOrNotButton {...props} />
      </Grid>
    </Grid>
  );
}
