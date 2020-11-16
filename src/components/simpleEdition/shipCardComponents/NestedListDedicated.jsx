import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import clsx from "clsx";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ListItemAvatar, Avatar } from "@material-ui/core";
import { storage } from "../../../index";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    margin: 0,
  },
  expand: {
    transform: "rotate(0deg)",
    right: "10%",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    right: "10%",
    transform: "rotate(180deg)",
  },
  nested: {
    padding: 0,
    margin: 0,
    paddingLeft: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function NestedList(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(props.opened);
  const [image, setImage] = React.useState("");

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (props.opened === true) setOpen(true);

    return () => {
      setOpen(false);
    };
  }, [props.opened]);

  useEffect(() => {
    let isMounted = true;

    if (props.itemData.iconTypeID === 3584)
      // description: Severed head (soaked in formaldehyde) - Unknown
      props.cache
        .get(`/icons/${props.itemData.iconFileName}`, () => {
          return storage
            .ref(`eveIcons/${props.itemData.iconFileName}`)
            .getDownloadURL()
            .then(async (url) => {
              return await fetch(url)
                .then((data) => data.arrayBuffer())
                .then((arrayBuffer) => convertArrayBufferToBase64(arrayBuffer));
            });
        })
        .then((data) => !!isMounted && setImage(data));
    else setImage(feedSource(props.itemData));

    return () => {
      isMounted = false;
    };
  }, [props.cache, props.itemData]);

  return (
    <List className={classes.root} dense>
      <ListItem button onClick={handleClick}>
        <ListItemAvatar>
          <Avatar style={{ width: 30, height: 30 }} src={image}>
            ?
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={props.itemData.marketGroupName}
          primaryTypographyProps={{ variant: "subtitle2" }}
        />
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: open,
          })}
          onClick={handleClick}
        >
          <ExpandMoreIcon />
        </IconButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List className={classes.nested}>{props.children}</List>
      </Collapse>
    </List>
  );
}
function feedSource(itemData) {
  return `https://images.evetech.net/types/${itemData?.iconTypeID}/icon?size=32`;
}
function convertArrayBufferToBase64(arrayBuffer) {
  const base64Flag = "data:image/jpeg;base64,";

  let binary = "";
  const bytes = [].slice.call(new Uint8Array(arrayBuffer));
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return base64Flag + window.btoa(binary);
}
