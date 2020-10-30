import React from "react";
import RecButton from "../RecButton";
import { red, orange, green, grey } from "@material-ui/core/colors";
import RecMenu from "../RecMenu";
import Fit from "../../../fitter/src/Fit";
import { useEffect } from "react";
import { useState } from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import {
  passiveSvg,
  activationSvg,
  overloadSvg,
  offlineSvg,
} from "../../Icons/stateIcons";

const useStyles = makeStyles((theme) => ({
  rootButton: {
    width: 40,
  },
}));

const OverloadButton = (props) => {
  return (
    <Tooltip title="Overload" placement="left" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: red[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "overload",
            });
          }}
          disabled={props.disabled}
        >
          {overloadSvg}
        </RecButton>
      </div>
    </Tooltip>
  );
};
const ActivationButton = (props) => {
  return (
    <Tooltip title="Active" placement="left" arrow>
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
              type: props.variant,
              payload: "activation",
            });
          }}
          disabled={props.disabled}
        >
          {activationSvg}
        </RecButton>
      </div>
    </Tooltip>
  );
};
const PassiveButton = (props) => {
  return (
    <Tooltip title="Online" placement="left" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: orange[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "passive",
            });
          }}
          disabled={props.disabled}
        >
          {passiveSvg}
        </RecButton>
      </div>
    </Tooltip>
  );
};
const OfflineButton = (props) => {
  return (
    <Tooltip title="Offline" placement="left" arrow>
      <div>
        <RecButton
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: grey[500],
            color: "#ffffff",
          }}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "offline",
            });
          }}
          disabled={props.disabled}
        >
          {offlineSvg}
        </RecButton>
      </div>
    </Tooltip>
  );
};

export default function SetStateMenu(props) {
  const classes = useStyles();
  const [isActiveModule, setIsActiveModule] = useState(true);

  useEffect(() => {
    const initialState = Fit.getInitialState(props.activeItem);
    switch (initialState) {
      case "activation":
        setIsActiveModule(true);
        break;
      case "passive":
        setIsActiveModule(false);
        break;
      default:
        setIsActiveModule(undefined);
    }
  }, [props.activeItem?.typeID]);

  return (
    <RecMenu
      open={props.slotsOpen[props.variant].open}
      menuButton={
        <RecButton
          className={classes.rootButton}
          style={{
            width: "100%",
            minWidth: 20,
            backgroundColor: getCurrentStateColor(
              props.activeItem?.typeState,
              props.variant === "AMMO"
            ),
            color: "#ffffff",
          }}
          disabled={!props.activeItem?.typeID}
        >
          <Tooltip title="Item state" placement="bottom" arrow>
            {getCurrentStateIcon(
              props.activeItem?.typeState,
              props.variant === "AMMO"
            )}
          </Tooltip>
        </RecButton>
      }
    >
      <OverloadButton
        variant={props.variant}
        dispatchListItems={props.dispatchListItems}
        disabled={
          !isActiveModule ||
          props.variant === "DRONE_SLOT" ||
          props.variant === "AMMO"
        }
      />
      <ActivationButton
        variant={props.variant}
        dispatchListItems={props.dispatchListItems}
        disabled={!isActiveModule || props.variant === "AMMO"}
      />
      <PassiveButton
        variant={props.variant}
        dispatchListItems={props.dispatchListItems}
      />
      <OfflineButton
        variant={props.variant}
        dispatchListItems={props.dispatchListItems}
        disabled={props.variant === "AMMO"}
      />
    </RecMenu>
  );
}
export function getCurrentStateColor(state, isAmmo = false) {
  if (isAmmo === true) return orange[500];
  switch (state) {
    case "overload":
      return red[500];
    case "activation":
      return green[500];
    case "passive":
      return orange[500];
    case "offline":
      return grey[500];
    default:
      return "#ffffff00";
  }
}
function getCurrentStateIcon(state, isAmmo = false) {
  if (isAmmo === true) return passiveSvg;
  switch (state) {
    case "overload":
      return overloadSvg;
    case "activation":
      return activationSvg;
    case "passive":
      return passiveSvg;
    case "offline":
    default:
      return offlineSvg;
  }
}
