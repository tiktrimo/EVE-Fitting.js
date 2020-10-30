import React from "react";
import { Drawer, makeStyles, Button, ButtonGroup } from "@material-ui/core";
import LastPageIcon from "@material-ui/icons/LastPage";
import { useState } from "react";
import Stat from "./Stat";
import { useCallback } from "react";

const useStyles = makeStyles((theme) => ({
  rootPaper: {
    width: 300,
    maxWidth: "80%",
    height: "100%",
    overflow: "hidden",
  },
  child: {
    width: "100%",
    height: "100%",
    overflowY: "scroll",
    padding: "10px 20px 0px 10px",
    marginBottom: 40,
    overflowX: "hidden",
  },
  rootButton: {
    paddingRight: 20,
  },
}));

export default function StatDrawer(props) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);

  const styleButton = useCallback(
    (index) => {
      let backgroundColor = "#f5f5f5";
      let color = "#212121";

      if (tabIndex === index) {
        backgroundColor = "#212121";
        color = "#ffffff";
      }
      return {
        backgroundColor: backgroundColor,
        color: color,
        marginBottom: 10,
      };
    },
    [tabIndex]
  );

  return (
    <Drawer
      anchor={!!props.anchor ? props.anchor : "right"}
      open={props.open}
      variant="temporary"
      classes={{ paper: classes.rootPaper }}
      onClose={() => {
        props.dispatchSlotsOpen({
          type: "STAT",
          payload: {
            open: false,
          },
        });
        setTabIndex(0);
      }}
    >
      <div className={classes.child}>
        {props.slot?.charge && (
          <ButtonGroup fullWidth variant="text">
            <Button style={styleButton(0)} onClick={() => setTabIndex(0)}>
              ITEM
            </Button>
            <Button style={styleButton(1)} onClick={() => setTabIndex(1)}>
              CHARGE
            </Button>
          </ButtonGroup>
        )}
        <div hidden={tabIndex !== 0}>
          <Stat
            type={
              props.slot?.typeID !== undefined ? props.slot : props.slot?.item
            }
            cache={props.cache}
          />
        </div>
        <div hidden={tabIndex !== 1}>
          <Stat type={props.slot?.charge} cache={props.cache} />
        </div>
      </div>
      <Button
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          backgroundColor: "#F5F5F5",
        }}
        onClick={() => props.dispatchSlotsOpen({ type: "RESET" })}
      >
        <LastPageIcon />
      </Button>
    </Drawer>
  );
}
