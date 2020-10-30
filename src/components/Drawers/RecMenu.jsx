import React from "react";
import { useRef } from "react";
import { Popover } from "@material-ui/core";
import { useState } from "react";
import { useEffect } from "react";

export default function RecMenu(props) {
  const [open, setOpen] = useState(false);
  const anchor = useRef(null);

  useEffect(() => {
    if (!props.open && open === true) setOpen(false);
  }, [props.open]);

  return (
    <React.Fragment>
      <div
        ref={anchor}
        onClick={() => {
          if (props.menuButton.props.disabled !== true) setOpen(!open);
        }}
      >
        {props.menuButton}
      </div>

      <Popover
        open={props.open && open}
        anchorEl={anchor.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setOpen(false)}
        PaperProps={{
          style: { width: anchor.current?.clientWidth },
          elevation: 0,
          square: true,
        }}
        container={anchor.current}
      >
        {props.children}
      </Popover>
    </React.Fragment>
  );
}
