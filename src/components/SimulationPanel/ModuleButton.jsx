import { Avatar, Button, makeStyles } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import ModuleButtonChargeBadge from "./ModuleButtonChargeBadge";
import ModuleActivation from "./ModuleActivation";
import ModuleReloading from "./ModuleReloading";
import ModuleButtonCountBadge from "./ModuleButtonCountBadge";

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
  /* stateArcBorder: {
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
  }, */
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
  //props.isActivating : for visual purpose. props.moduleSet[0].summary.activationState.isActive : synced real value
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

      <Avatar
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!isReloading) setIsActivating(!isActivating);
        }}
        className={classes.rootAvatarDefault}
      >
        <Button>
          <ModuleButtonChargeBadge
            count={props.moduleSet[0].summary.activationState.activationLeft}
            onClick={() => {
              if (!isReloading) setIsActivating(!isActivating);
            }}
          >
            <ModuleButtonCountBadge count={props.moduleSet.length}>
              {feedSource(props.moduleSet[0]?.summary)}
            </ModuleButtonCountBadge>
          </ModuleButtonChargeBadge>
        </Button>
      </Avatar>
    </div>
  );
}
function feedSource(summary) {
  const itemID = summary.itemID;
  const chargeID = summary.chargeID;
  const isChargeDepleted = summary.activationState.activationLeft === 0;

  if (!!itemID && !!chargeID && !isChargeDepleted)
    return (
      <img
        draggable="false"
        style={{ width: "65%" }}
        src={`https://images.evetech.net/types/${chargeID}/icon?size=64`}
      />
    );
  else
    return (
      <img
        draggable="false"
        style={{ width: "65%" }}
        src={`https://images.evetech.net/types/${itemID}/icon?size=64`}
      />
    );
}
