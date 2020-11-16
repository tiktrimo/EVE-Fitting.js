import React from "react";
import { Drawer, Button, makeStyles } from "@material-ui/core";
import { useState } from "react";
import ItemSelectionListCache from "../../itemSelection/ItemSelectionListCache";
import { useEffect } from "react";
import LastPageIcon from "@material-ui/icons/LastPage";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import ListDrawerButtons from "./ListDrawerButtons";
import { useCallback } from "react";
import ListDrawerSearchbar from "./ListDrawerSearchbar";

const useStyles = makeStyles((theme) => ({
  rootPaper: {
    width: 300,
    height: "100%",
    overflow: "hidden",
  },
  child: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    paddingRight: 20,
    overflowX: "hidden",
  },
  retractButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.palette.action.opaqueHover,
    borderRadius: 0,
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

export default function ListDrawer(props) {
  const classes = useStyles();

  const [item, setItem] = useState(false);
  const [width, setWidth] = useState(0);

  const getEveListConfig = useCallback(() => {
    return {
      rootMarketGroupID: getRootMarketGroupID(props.slots, props.variant),
      state: {
        outboundSetItem: setItem,
      },
      filter: {
        allowedAttributes: [
          ...allowedAttributes(props.variant),
          ...props.filter,
        ],
      },
    };
  }, [
    props.variant,
    getFilterID(props.filter),
    getRootMarketGroupID(props.slots, props.variant),
  ]);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleRender = (e) => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleRender);
    return () => {
      window.removeEventListener("resize", handleRender);
    };
  }, []);

  useEffect(() => {
    if (!!item) {
      props.dispatchListItems({ type: props.variant, payload: item });
      setItem(false);
    }
  }, [item]);

  return (
    <Drawer
      classes={{ paper: classes.rootPaper }}
      PaperProps={{
        style: {
          marginLeft: props.expand === true ? 300 : 60,
        },
      }}
      anchor={width < 1000 ? "right" : "left"}
      open={props.open}
      variant="persistent"
    >
      <ListDrawerButtons setItem={setItem} {...props} />
      <ListDrawerSearchbar
        eveListConfig={getEveListConfig()}
        cache={props.cache}
      />
      <div className={classes.child}>
        <ItemSelectionListCache
          eveListConfig={getEveListConfig()}
          cache={props.cache}
        />
      </div>
      <Button
        className={classes.retractButton}
        onClick={(e) => props.dispatchSlotsOpen({ type: "RESET" })}
      >
        {width < 1000 ? <LastPageIcon /> : <FirstPageIcon />}
      </Button>
    </Drawer>
  );
}

function getRootMarketGroupID(slots, variant) {
  switch (variant) {
    case "SHIP":
      return 4;
    case "MISC_SLOT":
      return getMiscSlotMarketGroupID(slots);
    case "HIGH_SLOT":
    case "MID_SLOT":
    case "LOW_SLOT":
      return 9;
    case "RIG_SLOT":
      return 1111;
    case "AMMO":
      return 11;
    case "DRONE_SLOT":
      return 157;
  }
}
function allowedAttributes(variant) {
  switch (variant) {
    case "HIGH_SLOT":
      return [{ attributeName: "typeIsHiPower", value: true }];
    case "MID_SLOT":
      return [{ attributeName: "typeIsMedPower", value: true }];
    case "LOW_SLOT":
      return [{ attributeName: "typeIsLoPower", value: true }];
    default:
      return [];
  }
}
function getMiscSlotMarketGroupID(slots) {
  switch (slots.ship?.typeID) {
    case 34317: //Confessor
      return 10001;
    case 34828: //Jackdaw
      return 10002;
    case 35683: //Hecate
      return 10003;
    case 34562: //Svipul
      return 10004;
    case 29986: //Legion
      return 1610;
    case 29984: //Tengu
      return 1625;
    case 29988: //Proteus
      return 1627;
    case 29990: //Loki
      return 1626;
    default:
      return 9;
  }
}
function getFilterID(filters) {
  return filters
    .map((filter) => `${filter.attributeName}:${filter.value}`)
    .join("-");
}
