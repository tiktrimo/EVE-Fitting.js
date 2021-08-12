import {
  Avatar,
  Badge,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import React from "react";

const useStyles = makeStyles((theme) => ({
  rootAvatar: {
    width: 20,
    height: 20,
    right: 15,
    bottom: 3,
    backgroundColor: theme.palette.background.paper,
    border: `0.1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export default function ModuleButtonChargeBadge(props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Badge
      overlap="circle"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      badgeContent={
        props.count != Infinity ? (
          <Avatar className={classes.rootAvatar}>
            <Typography
              style={{
                color: theme.palette.text.primary,
                fontSize: 9,
                marginLeft: -1,
              }}
            >
              {props.count}
            </Typography>
          </Avatar>
        ) : undefined
      }
    >
      {props.children}
    </Badge>
  );
}
