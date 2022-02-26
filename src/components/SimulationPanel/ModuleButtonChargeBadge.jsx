import { Avatar, Badge, makeStyles, useTheme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  rootAvatar: {
    width: 20,
    height: 8,
    right: 13,
    bottom: 3,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: 9,
    border: `0.1px solid ${theme.palette.divider}`,
    paddingRight: 10,
  },
}));

export default function ModuleButtonChargeBadge(props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      badgeContent={
        props.count != Infinity ? (
          <Avatar
            className={classes.rootAvatar}
            onClick={props.onClick}
            variant="square"
          >
            {props.count}
          </Avatar>
        ) : undefined
      }
    >
      {props.children}
    </Badge>
  );
}
