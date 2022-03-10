import React from "react";
import {
  ListItem,
  makeStyles,
  ListItemText,
  Avatar,
  Tooltip,
  useTheme,
  Button,
} from "@material-ui/core";
import { useState } from "react";
import {
  HighSlotIcon,
  MidSlotIcon,
  LowSlotIcon,
  RigSlotIcon,
  DroneIcon,
  CapsuleIcon,
  MiscIcon,
} from "../../Icons/slotIcons.jsx";
import SlotChargeBadge from "./SlotChargeBadge.jsx";
import { useEffect } from "react";
import { useCallback } from "react";
import SlotMetaBadge from "./SlotMetaBadge.jsx";
import { getCurrentStateColor } from "../ListDrawer/SetStateMenu.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 50,
    width: "110%",
    minWidth: 60,
  },
  rootActive: {
    height: 50,
    width: "110%",
    minWidth: 60,
    backgroundColor: theme.palette.action.hover,
  },
  rootDiv: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  rootAvatarDefault: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: theme.palette.background.paper,
    border: `0.1px solid ${theme.palette.divider}`,
    marginRight: 20,
  },
  stateArcBorder: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "3px solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    position: "absolute",
    top: 2,
    left: 7,
  },
}));

export default function Slot(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [item, setItem] = useState(false);
  const [charge, setCharge] = useState(false);

  const [isHover, setIsHover] = useState(false);

  const handlePressOpen = useCallback(() => {
    props.setActiveSlotNumber(props.index);
    props.setImportFitText(false); // Only here to bipass error occured while fetching data from server.
    switch (props.variant) {
      case "RIG_SLOT":
        props.dispatchSlotsOpen({
          type: "RIG_SLOT",
          payload: {
            filter: getLoadableRig(props.slots.ship),
          },
        });
        break;
      case "DRONE_SLOT":
        props.dispatchSlotsOpen({
          type: "DRONE_SLOT",
          payload: {
            filter: getLoadableDrone(props.slots.ship),
          },
        });
        break;

      // Conditional breaking is intentional
      case "IMPLANT_SLOT":
      case "DRUG_SLOT":
        if (props.slotsOpen[props.variant].open === true) break;
      default:
        props.dispatchSlotsOpen({ type: props.variant });
        break;
    }
  }, [props.slots.ship?.typeID, props.variant, props.index]);

  useEffect(() => {
    if (props.isActive === true || props.isActive.open === true) {
      props.setActiveSlot({
        type: props.variant,
        index: props.index,
      });
      if (props.variant === "IMPLANT_SLOT")
        props.dispatchSlotsOpen({
          type: "IMPLANT_SLOT",
          payload: {
            filter: { typeSlotNumber: props.index + 1 },
          },
        });
      else if (props.variant === "DRUG_SLOT")
        props.dispatchSlotsOpen({
          type: "DRUG_SLOT",
          payload: {
            filter: { typeSlotNumber: getDrugSlotNumber(props.index) },
          },
        });
    }
  }, [props.isActive]);

  useEffect(() => {
    const type = props.fetchedItem;
    if (!type || !type.typeID) setItem(false);
    else setItem(props.fetchedItem);
  }, [props.fetchedItem?.typeID]);

  useEffect(() => {
    const type = props.fetchedCharge;
    if (!type || !type.typeID) setCharge(false);
    else setCharge(props.fetchedCharge);
  }, [props.fetchedCharge?.typeID]);

  return (
    <React.Fragment>
      <ListItem
        className={props.isActive ? classes.rootActive : classes.root}
        onClick={handlePressOpen}
        dense
        button
      >
        <div className={classes.rootDiv}>
          <SlotChargeBadge
            {...props}
            item={item}
            charge={charge}
            count={props.fetchedItem?.typeCount}
          >
            <SlotMetaBadge item={item}>
              <div
                className={classes.stateArcBorder}
                style={{
                  borderLeftColor: getCurrentStateColor(
                    props?.fetchedItem?.typeState,
                    false,
                    theme
                  ),
                }}
              />
              <Avatar className={classes.rootAvatarDefault}>
                <Button disableRipple>
                  {!!item ? feedSource(item, charge) : slotIcon(props, theme)}
                </Button>
              </Avatar>
            </SlotMetaBadge>
          </SlotChargeBadge>
        </div>

        <ListItemText
          style={{ marginLeft: 50 }}
          primary={item?.typeName}
          primaryTypographyProps={{ noWrap: true, variant: "subtitle2" }}
          secondary={
            !!charge &&
            `${charge?.typeName} ${getChageCountString(item, charge)}`
          }
          secondaryTypographyProps={{
            noWrap: true,
            variant: "subtitle2",
            style: { color: theme.palette.text.secondary },
          }}
        />
      </ListItem>
    </React.Fragment>
  );
}
function feedSource(item, charge) {
  if (!!item && !charge)
    return (
      <img
        draggable="false"
        style={{ width: "85%", height: "85%", marginLeft: -2 }}
        src={`https://images.evetech.net/types/${item?.typeID}/icon?size=64`}
      />
    );
  else if (!!item && !!charge)
    return (
      <img
        draggable="false"
        style={{ width: "85%", height: "85%", marginLeft: -2 }}
        src={`https://images.evetech.net/types/${charge?.typeID}/icon?size=64`}
      />
    );
}
function getChageCountString(item, charge) {
  const count = item.capacity / charge.volume || 1;
  if (count === 1) return "";
  else return `x${Math.floor(count)}`;
}
function getLoadableRig(ship) {
  if (!ship) return undefined;

  const attrs = ship.typeAttributesStats;
  const rigSize = attrs.find((attr) => attr.attributeID === 1547)?.value;
  return { size: rigSize };
}
function getLoadableDrone(ship) {
  if (!ship) return undefined;

  const attrs = ship.typeAttributesStats;
  const droneSize = attrs.find((attr) => attr.attributeID === 1271)?.value; //attributeID: 1271, attributeName: "Drone Bandwidth"
  return { size: droneSize };
}
function getDrugSlotNumber(index) {
  if (index < 3) return index + 1;
  else if (index === 3) return 11;
  else return 14;
}

function slotIcon(props, theme) {
  switch (props.variant) {
    case "SHIP":
      return (
        <Tooltip
          open={props.open && !props.slotsOpen.SHIP.open}
          title="Click here to choose ship"
          placement="right"
          arrow
        >
          <div style={{ height: 24 }}>
            <CapsuleIcon color={theme.palette.text.primary} />
          </div>
        </Tooltip>
      );
    case "MISC_SLOT":
      return <MiscIcon color={theme.palette.text.primary} />;
    case "HIGH_SLOT":
      return <HighSlotIcon color={theme.palette.text.primary} />;
    case "MID_SLOT":
      return <MidSlotIcon color={theme.palette.text.primary} />;
    case "LOW_SLOT":
      return <LowSlotIcon color={theme.palette.text.primary} />;
    case "RIG_SLOT":
      return <RigSlotIcon color={theme.palette.text.primary} />;
    case "DRONE_SLOT":
      return <DroneIcon color={theme.palette.text.primary} />;
  }
}
