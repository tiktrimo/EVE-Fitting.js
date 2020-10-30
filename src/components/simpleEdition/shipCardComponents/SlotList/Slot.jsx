import React, { useEffect } from "react";
import { highSlotSVG, midSlotSVG, lowSlotSVG, ammoSVG } from "./slotIcons";
import CloseIcon from "@material-ui/icons/Close";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Icon,
  CircularProgress,
} from "@material-ui/core";
import { useState } from "react";

export default function Slot(props) {
  const [item, setItem] = useState(false);
  const [charge, setCharge] = useState(false);
  const [slotConfig] = useState({ ...props.slotConfig });
  const [slotName] = useState(slotNaming(props.slotConfig.type));

  useEffect(() => {
    if (!!props.item) setItem(props.item);
    if (!!props.charge) setCharge(props.charge);
  }, [props.item, props.charge]);

  const handleDelete = (e) => {
    setItem(false);
    setCharge(false);
    props.onItemDelete(e);
  };

  return (
    <React.Fragment>
      <div>
        <ListItem
          style={{ minHeight: 50, paddingTop: 1, paddingBottom: 1 }}
          divider
          dense
          button
          onClick={props.onItemClick}
          //TODO: make all slots responsible for calculating
          disabled={slotConfig.type === "HIGH_SLOT" && slotConfig.number > 0}
        >
          <ListItemIcon>{slotIcon(slotConfig.type)}</ListItemIcon>
          <ListItemText
            primary={!!item?.typeName ? item.typeName : slotName}
            secondary={!!charge?.typeName ? charge.typeName : undefined}
          />
          {item.typeID && !props.isFetched && <CircularProgress size={15} />}
          {item.typeChargeSize && props.isFetched && (
            <div
              style={{ marginTop: 6, marginRight: 6 }}
              onClick={props.onChargeClick}
            >
              {ammoSVG}
            </div>
          )}
          {item.typeID && (
            <Icon onClick={handleDelete} color="disabled">
              <CloseIcon />
            </Icon>
          )}
        </ListItem>
      </div>
    </React.Fragment>
  );
}
function slotNaming(type) {
  switch (type) {
    case "HIGH_SLOT":
      return "High Slot";
    case "MID_SLOT":
      return "Mid Slot";
    case "LOW_SLOT":
      return "Low Slot";
  }
}

function slotIcon(type) {
  switch (type) {
    case "HIGH_SLOT":
      return highSlotSVG;
    case "MID_SLOT":
      return midSlotSVG;
    case "LOW_SLOT":
      return lowSlotSVG;
  }
}
