import React from "react";
import { Button, makeStyles, useTheme } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    width: 40,
  },
}));

export default function RecButton(props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Button
      {...props}
      classes={{ root: classes.root }}
      variant="contained"
      style={
        props.disabled === true
          ? {
              ...props.style,
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.background.paper,
            }
          : { ...props.style }
      }
      disableElevation
    >
      {props.children}
    </Button>
  );
}
