import { Avatar, Button, makeStyles } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import ModuleButtonChargeBadge from "./ModuleButtonChargeBadge";
import ModuleActivation from "./ModuleActivation";
import ModuleReloading from "./ModuleReloading";

const useStyles = makeStyles((theme) => ({
  rootDiv: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
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

  const [isReloading, setIsReloading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <ModuleReloading
        moduleSet={props.moduleSet}
        dispatchSummaries={props.dispatchSummaries}
        setIsReloading={setIsReloading}
      />
      <ModuleActivation
        moduleSet={props.moduleSet}
        dispatchSummaries={props.dispatchSummaries}
        dispatchTargetSummaries={props.dispatchTargetSummaries}
        isActivating={isActivating}
        setIsActivating={setIsActivating}
      />
      <ModuleButtonChargeBadge
        count={props.moduleSet[0].summary.activationState.activationLeft}
        onClick={() => {
          if (!isReloading) setIsActivating(!isActivating);
        }}
      >
        <Avatar
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (!isReloading) setIsActivating(!isActivating);
          }}
          className={classes.rootAvatarDefault}
        >
          <Button>
            {feedSource(
              props.moduleSet[0]?.summary.itemID,
              props.moduleSet[0]?.summary.chargeID
            )}
          </Button>
        </Avatar>
      </ModuleButtonChargeBadge>
    </div>
  );
}
function feedSource(itemID, chargeID) {
  if (!!itemID && !chargeID)
    return (
      <img
        draggable="false"
        style={{ width: "85%", height: "85%", marginLeft: -2 }}
        src={`https://images.evetech.net/types/${itemID}/icon?size=64`}
      />
    );
  else if (!!itemID && !!chargeID)
    return (
      <img
        draggable="false"
        style={{ width: "85%", height: "85%", marginLeft: -2 }}
        src={`https://images.evetech.net/types/${chargeID}/icon?size=64`}
      />
    );
}
