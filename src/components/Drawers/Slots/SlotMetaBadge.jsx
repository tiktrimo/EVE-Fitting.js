import React from "react";
import { makeStyles, Badge, Avatar } from "@material-ui/core";

const useStyle = makeStyles((theme) => ({
  rootAvatar: {
    width: 10,
    height: 10,
    right: 15,
    top: 3,
    fontSize: 1,
  },
}));

export default function SlotMetaBadge(props) {
  const classes = useStyle();

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      badgeContent={
        getTechColor(props.item) && (
          <Avatar
            style={{
              backgroundColor: getTechColor(props.item),
            }}
            className={classes.rootAvatar}
          >
            {""}
          </Avatar>
        )
      }
    >
      {props.children}
    </Badge>
  );
}
function getTechColor(item) {
  if (!item) return undefined;

  const typeMetaGroupID = item.metaGroupID;
  switch (typeMetaGroupID) {
    //tech1
    case 1:
      return undefined;
    //tech2
    case 2:
      return "#f59500";
    //story
    case 3:
      return "#78bf36";
    //faction
    case 4:
      return "#086101";
    //officer
    case 5:
      return "#340E73";
    //dead
    case 6:
      return "#3660bf";
    //tech3
    case 14:
      return "#9F3A03";
    //abyssal
    case 15:
      return "#ad0000";
    default:
      return undefined;
  }
}
