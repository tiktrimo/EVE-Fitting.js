import React from "react";
import {
  ListItem,
  ListItemText,
  Avatar,
  makeStyles,
  useTheme,
} from "@material-ui/core";

const useStyle = makeStyles((theme) => ({
  root: {
    padding: "8px 16px 8px 16px",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  rootAvatar: {
    width: 10,
    height: 10,
    marginRight: 10,
  },
}));

export default function ItemSelection(props) {
  const classes = useStyle();
  const theme = useTheme();

  return (
    <ListItem
      className={classes.root}
      key={props.itemData.typeName}
      button
      onClick={handleItemClick(props)}
    >
      <Avatar
        style={{
          backgroundColor: getTechColor(props.itemData, theme),
        }}
        className={classes.rootAvatar}
      >
        {"" /* Necessary! */}
      </Avatar>

      <ListItemText
        primary={props.itemData.typeName}
        primaryTypographyProps={{ variant: "caption" }}
      />
    </ListItem>
  );
}
const handleItemClick = (props) => () => {
  props.setItem && props.setItem(props.itemData);
  props.outboundSetItem && props.outboundSetItem(props.itemData);
};

function getTechColor(item, theme) {
  if (!item) return undefined;

  const typeMetaGroupID = item.typeMetaGroupID;
  switch (typeMetaGroupID) {
    //tech1
    case 1:
      return theme.palette.action.hover;
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
      return theme.palette.action.hover;
  }
}
