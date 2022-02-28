import { Avatar, Button, ButtonBase, makeStyles } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import ModuleButtonChargeBadge from "./ModuleButtonChargeBadge";
import ModuleActivation from "./ModuleActivation";
import ModuleReloading from "./ModuleReloading";
import ModuleButtonCountBadge from "./ModuleButtonCountBadge";
import { useEffect } from "react";

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
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    zIndex: 1,
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

  buttonBaseChild: {
    backgroundColor: "red",
  },
  buttonBaseRippleVisible: {
    opacity: 0.5,
    animation: `$enter 550ms ${theme.transitions.easing.easeInOut}`,
  },
  "@keyframes enter": {
    "0%": {
      transform: "scale(0)",
      opacity: 0.1,
    },
    "100%": {
      transform: "scale(1)",
      opacity: 0.5,
    },
  },
}));

const ModuleAvatar = React.memo((props) => {
  const classes = useStyles();

  return (
    <Avatar
      onClick={() => {
        if (!props.isReloading) props.setIsActivating(!props.isActivating);
      }}
      className={classes.rootAvatarDefault}
    >
      <Button>
        <ModuleButtonChargeBadge
          count={props.chargeCount}
          onClick={() => {
            if (!props.isReloading) props.setIsActivating(!props.isActivating);
          }}
        >
          <ModuleButtonCountBadge count={props.moduleSet.length}>
            {feedSource(props.moduleSet[0]?.summary)}
          </ModuleButtonCountBadge>
        </ModuleButtonChargeBadge>
      </Button>
    </Avatar>
  );
});

export default function ModuleButton(props) {
  const [isReloading, setIsReloading] = useState(false);
  //props.isActivating : for visual purpose. props.moduleSet[0].summary.activationState.isActive : synced real value
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    setIsActivating(false);
  }, [props.updateFlag]);

  return (
    <div style={{ position: "relative" }}>
      <ModuleReloading
        updateFlag={props.updateFlag}
        moduleSet={props.moduleSet}
        dispatchSummaries={props.dispatchSummaries}
        setIsReloading={setIsReloading}
      />
      <ModuleActivation
        utils={props.utils}
        updateFlag={props.updateFlag}
        moduleSet={props.moduleSet}
        dispatchSummaries={props.dispatchSummaries}
        dispatchTargetSummaries={props.dispatchTargetSummaries}
        isActivating={isActivating}
        setIsActivating={setIsActivating}
      />

      <ModuleAvatar
        isActivating={isActivating}
        setIsActivating={setIsActivating}
        isReloading={isReloading}
        moduleSet={props.moduleSet}
        chargeCount={props.moduleSet[0].summary.activationState.activationLeft}
      />
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
        style={{
          width: "65%",
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
        }}
        src={`https://images.evetech.net/types/${chargeID}/icon?size=64`}
      />
    );
  else
    return (
      <img
        draggable="false"
        style={{
          width: "65%",
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
        }}
        src={`https://images.evetech.net/types/${itemID}/icon?size=64`}
      />
    );
}
