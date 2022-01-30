import React from "react";
import {
  makeStyles,
  Badge,
  Avatar,
  useTheme,
  Typography,
} from "@material-ui/core";

const useStyle = makeStyles((theme) => ({
  rootAvatar: {
    width: 20,
    height: 8,
    left: 7,
    bottom: 3,
    backgroundColor: theme.palette.property.red,
    color: theme.palette.button.color,
    fontSize: 9,
    border: `0.1px solid ${theme.palette.property.red}`,
    justifyContent: "right",
    paddingRight: 2,
    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export default function ModuleButtonCountBadge(props) {
  const classes = useStyle();
  const theme = useTheme();

  return (
    <Badge
      style={{ justifyContent: "center" }}
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      badgeContent={
        props.count > 1 && (
          <Avatar variant="square" className={classes.rootAvatar}>
            {props.count}
          </Avatar>
        )
      }
    >
      {props.children}
    </Badge>
  );
}
