import React from "react";
import { Badge, Avatar, makeStyles, useTheme, Button } from "@material-ui/core";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import AdjustIcon from "@material-ui/icons/Adjust";

const useStyles = makeStyles((theme) => ({
  rootAvatar: {
    width: 20,
    height: 20,
    right: 0,
    bottom: 3,
    fontSize: 12,
    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export default function FitCharacterBadge(props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      badgeContent={
        <Avatar className={classes.rootAvatar}>
          <Button
            style={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              fontWeight: 1000,
            }}
            onClick={props.onClick}
          >
            V
          </Button>
        </Avatar>
      }
    >
      {props.children}
    </Badge>
  );
}

export function getLoadableGroup(item) {
  if (!item || !item.typeAttributesStats) return { group: [], size: false };

  const typeAttributesStats = item.typeAttributesStats;

  // Used with (Charge Group)[attributeID] = 604, 605, 606, 609, 610
  const loadableGroupIDs = [604, 605, 606, 609, 610]
    .map((ID) => {
      const attr = typeAttributesStats.find((attr) => attr.attributeID === ID);
      if (!attr) return undefined;
      else return attr.value;
    })
    .filter((value) => value);

  // Charge size[attributeID] = 128
  const loadableSize = typeAttributesStats.find(
    (attr) => attr.attributeID === 128
  )?.value;

  return {
    group: loadableGroupIDs,
    size: loadableSize,
  };
}
