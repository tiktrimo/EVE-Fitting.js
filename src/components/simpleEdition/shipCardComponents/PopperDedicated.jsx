import React, { useState } from "react";
import {
  Popper,
  Paper,
  ClickAwayListener,
  Button,
  Grid,
} from "@material-ui/core";
import { useEffect } from "react";

export default function PopperDedicated(props) {
  const [onClickAway, setClickAway] = useState(() => () => {});

  useEffect(() => {
    const storedFunction = props.visibility
      ? () => {
          props._onClose();
        }
      : () => {};
    setClickAway(() => storedFunction);
  }, [props.visibility, props.onClose]);

  return (
    <Popper
      style={{
        visibility: props.visibility ? "visible" : "hidden",
      }}
      modifiers={{
        flip: {
          enabled: false,
        },
      }}
      id={props.ID}
      open={props.open}
      anchorEl={props.itemRef}
      placement="right-start"
      disablePortal={false}
    >
      {/*  <ClickAwayListener onClickAway={onClickAway}> */}
      <Paper elevation={6} style={{ overflowY: "scroll", maxHeight: 600 }}>
        <Grid container item xs={12}>
          <Button
            style={{ width: "100%", padding: 0 }}
            onClick={onClickAway}
            color="secondary"
          >
            CLOSE
          </Button>
        </Grid>

        <div style={{ minHeight: 600 }}>{props.children}</div>
      </Paper>
      {/* </ClickAwayListener> */}
    </Popper>
  );
}
