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
    left: 9,
    bottom: 3,
    backgroundColor: theme.palette.property.red,
    color: theme.palette.button.color,
    fontSize: 9,
    border: `0.1px solid ${theme.palette.property.red}`,
  },
  rootDiv: {
    width: "100%",
    textAlign: "right",
    paddingRight: 3,
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
            <div className={classes.rootDiv}>{props.count}</div>
          </Avatar>
        )
      }
    >
      {props.children}
    </Badge>
  );
}
