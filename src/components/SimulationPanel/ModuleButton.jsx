import { Avatar, makeStyles } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import ModuleButtonChargeBadge from "./ModuleButtonChargeBadge";
import ModuleCircularProgress from "./ModuleCircularProgress";

const useStyles = makeStyles((theme) => ({
  rootDiv: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
  },
  rootAvatarHover: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: theme.palette.action.hover,
    border: `0.1px solid ${theme.palette.divider}`,
    marginRight: 20,
  },
  rootAvatarDefault: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: theme.palette.background.paper,
    border: `0.1px solid ${theme.palette.divider}`,
    marginRight: 20,
  },
  stateArcBorder: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "3px solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    position: "absolute",
    top: 2,
    left: 7,
  },
  circularProrgess: {
    position: "absolute",
    right: 16,
  },
  circularTransition: {
    transition: theme.transitions.create("stroke-dashoffset", {
      easing: "linear",
      duration: "1s",
    }),
  },
}));

export default function ModuleButton(props) {
  const classes = useStyles();

  const [isHover, setIsHover] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <ModuleCircularProgress summary={props.slot.summary} />
      <ModuleButtonChargeBadge
        count={props.slot.summary.activationState.activationLeft}
      >
        <Avatar
          style={{ cursor: "pointer" }}
          onClick={() => {
            props.slot.summary.activationState.isActive =
              !props.slot.summary.activationState.isActive;
          }}
          className={
            isHover ? classes.rootAvatarHover : classes.rootAvatarDefault
          }
        >
          <div
            onMouseEnter={() => {
              setIsHover(true);
            }}
            onMouseLeave={() => {
              setIsHover(false);
            }}
          >
            {feedSource(props.slot?.item, props.slot?.charge)}
          </div>
        </Avatar>
      </ModuleButtonChargeBadge>
    </div>
  );
}
function feedSource(item, charge) {
  if (!!item && !charge)
    return (
      <img
        draggable="false"
        style={{ width: "100%", height: "100%" }}
        src={`https://images.evetech.net/types/${item?.typeID}/icon?size=64`}
      />
    );
  else if (!!item && !!charge)
    return (
      <img
        draggable="false"
        style={{ width: "100%", height: "100%" }}
        src={`https://images.evetech.net/types/${charge?.typeID}/icon?size=64`}
      />
    );
}
