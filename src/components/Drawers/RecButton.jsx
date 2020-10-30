import React from "react";
import { Button, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    width: 40,
  },
}));

export default function RecButton(props) {
  const classes = useStyles();

  return (
    <Button
      {...props}
      classes={{ root: classes.root }}
      variant="contained"
      style={
        props.disabled === true
          ? { ...props.style, backgroundColor: "#e0e0e0", color: "#ffffff" }
          : { ...props.style }
      }
      disableElevation
    >
      {props.children}
    </Button>
  );
}
