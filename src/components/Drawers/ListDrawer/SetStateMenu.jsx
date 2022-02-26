import React from "react";
import RecButton from "../RecButton";
import RecMenu from "../RecMenu";
import Fit from "../../../fitter/src/Fit";
import { useEffect } from "react";
import { useState } from "react";
import { makeStyles, Tooltip, useTheme } from "@material-ui/core";
import {
  PassiveIcon,
  ActivationIcon,
  OverloadIcon,
  OfflineIcon,
} from "../../Icons/stateIcons";

const useStyles = makeStyles((theme) => ({
  rootButton: {
    width: "100%",
    minWidth: 20,
  },
  overloadButton: {
    width: "100%",
    minWidth: 20,
    backgroundColor: theme.palette.property.red,
  },
  activationButton: {
    width: "100%",
    minWidth: 20,
    backgroundColor: theme.palette.property.green,
  },
  passiveButton: {
    width: "100%",
    minWidth: 20,
    backgroundColor: theme.palette.property.org,
  },
  offlineButton: {
    width: "100%",
    minWidth: 20,
    backgroundColor: theme.palette.property.grey,
  },
}));

const OverloadButton = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Tooltip title="Overload" placement="left" arrow>
      <div>
        <RecButton
          className={classes.overloadButton}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "overload",
            });
          }}
          disabled={props.disabled}
        >
          <OverloadIcon
            color={
              props.disabled
                ? theme.palette.background.paper
                : theme.palette.button.color
            }
          />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const ActivationButton = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Tooltip title="Active" placement="left" arrow>
      <div>
        <RecButton
          className={classes.activationButton}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "activation",
            });
          }}
          disabled={props.disabled}
        >
          <ActivationIcon
            color={
              props.disabled
                ? theme.palette.background.paper
                : theme.palette.button.color
            }
          />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const PassiveButton = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Tooltip title="Online" placement="left" arrow>
      <div>
        <RecButton
          className={classes.passiveButton}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "passive",
            });
          }}
          disabled={props.disabled}
        >
          <PassiveIcon
            color={
              props.disabled
                ? theme.palette.background.paper
                : theme.palette.button.color
            }
          />
        </RecButton>
      </div>
    </Tooltip>
  );
};
const OfflineButton = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Tooltip title="Offline" placement="left" arrow>
      <div>
        <RecButton
          className={classes.offlineButton}
          onClick={() => {
            props.dispatchListItems({
              type: props.variant,
              payload: "offline",
            });
          }}
          disabled={props.disabled}
        >
          <OfflineIcon
            color={
              props.disabled
                ? theme.palette.background.paper
                : theme.palette.button.color
            }
          />
        </RecButton>
      </div>
    </Tooltip>
  );
};

export default function SetStateMenu(props) {
  const classes = useStyles();
  const theme = useTheme();

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
            backgroundColor: getCurrentStateColor(
              props.activeItem?.typeState,
              props.variant === "AMMO",
              theme
            ),
          }}
          disabled={!props.activeItem?.typeID}
        >
          <Tooltip title="Item state" placement="bottom" arrow>
            <div style={{ height: 24 }}>
              {getCurrentStateIcon(
                props.activeItem?.typeState,
                props.variant === "AMMO",
                !props.activeItem?.typeID,
                theme
              )}
            </div>
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
export function getCurrentStateColor(state, isAmmo = false, theme) {
  if (isAmmo === true) return theme.palette.property.org;
  switch (state) {
    case "overload":
      return theme.palette.property.red;
    case "activation":
      return theme.palette.property.green;
    case "passive":
      return theme.palette.property.org;
    case "offline":
      return theme.palette.property.grey;
    default:
      return theme.palette.action.hover;
  }
}
function getCurrentStateIcon(state, isAmmo, isDisabled, theme) {
  if (isAmmo === true)
    return (
      <PassiveIcon
        color={
          isDisabled
            ? theme.palette.background.paper
            : theme.palette.button.color
        }
      />
    );
  switch (state) {
    case "overload":
      return (
        <OverloadIcon
          color={
            isDisabled
              ? theme.palette.background.paper
              : theme.palette.button.color
          }
        />
      );
    case "activation":
      return (
        <ActivationIcon
          color={
            isDisabled
              ? theme.palette.background.paper
              : theme.palette.button.color
          }
        />
      );
    case "passive":
      return (
        <PassiveIcon
          color={
            isDisabled
              ? theme.palette.background.paper
              : theme.palette.button.color
          }
        />
      );
    case "offline":
    default:
      return (
        <OfflineIcon
          color={
            isDisabled
              ? theme.palette.background.paper
              : theme.palette.button.color
          }
        />
      );
  }
}
