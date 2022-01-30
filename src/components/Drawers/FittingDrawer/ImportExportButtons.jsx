import React, { useCallback } from "react";
import ArchiveIcon from "@material-ui/icons/Archive";
import UnarchiveIcon from "@material-ui/icons/Unarchive";
import RecButton from "../RecButton";
import EFT from "../services/EFT";
import fittingLazyFetch from "./fittingLazyFetch.js";
import {
  makeStyles,
  Snackbar,
  ListItemText,
  ListItemIcon,
  ListItem,
  Tooltip,
  useTheme,
} from "@material-ui/core";
import { useState } from "react";
import { importInitializeFlag } from "./FittingDrawer";

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  listItem: {
    width: 300,
    padding: 0,
  },
  listIcon: {
    width: 35,
    minWidth: 10,
  },
}));

export default function ImportExportButtons(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [openAlert, setOpenAlert] = useState(false);

  const [title, setTitle] = useState("Error processing data. reload the page");
  const [text, setText] = useState(false);

  const handleImportClick = useCallback(() => {
    copyTextFromClipboard().then((text) => {
      setOpenAlert(true);
      if (text === false) return setTitle("Permission denied");
      setText(text);
      props.setImportFitText(text);
      props.dispatchImportStateFlag({ type: "START" });
      props.cache.wait("/typeIDsTable").then((typeIDs) => {
        const IDs = EFT.extractIDs(text, typeIDs);
        if (!IDs || IDs.length === 0) setTitle("Unvalid EFT");
        else setTitle("Importing EFT");
        fittingLazyFetch(props.cache, IDs);
      });
    });
  }, [props.setImportFitText, props.dispatchImportStateFlag, props.cache]);

  return (
    <React.Fragment>
      <Tooltip title="Import" placement="bottom" arrow>
        <div>
          <RecButton className={classes.button} onClick={handleImportClick}>
            <ArchiveIcon />
          </RecButton>
        </div>
      </Tooltip>

      <Tooltip title="Export" placement="bottom" arrow>
        <div>
          <RecButton
            className={classes.button}
            onClick={() => {
              navigator.clipboard.writeText(props.exportFitText);
            }}
          >
            <UnarchiveIcon />
          </RecButton>
        </div>
      </Tooltip>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={openAlert}
        onClose={() => {
          setOpenAlert(false);
        }}
        ContentProps={{
          elevation: 3,
          style: {
            backgroundColor: getSnackbarColor(title, theme),
          },
        }}
        message={
          <ListItem className={classes.listItem}>
            <ListItemIcon>
              <ArchiveIcon style={{ color: getPrimaryColor(title, theme) }} />
            </ListItemIcon>

            <ListItemText
              primary={title}
              secondary={text}
              primaryTypographyProps={{
                style: {
                  color: getPrimaryColor(title, theme),
                  fontWeight: 700,
                },
              }}
              secondaryTypographyProps={{
                style: { color: getSecondaryColor(title, theme) },
              }}
            />
          </ListItem>
        }
        autoHideDuration={5000}
      />
    </React.Fragment>
  );
}
async function copyTextFromClipboard() {
  const permisson = await navigator.permissions.query({
    name: "clipboard-read",
  });
  if (permisson.state === "granted" || permisson.state === "prompt") {
    return navigator.clipboard.readText();
  }
  return false;
}
function getSnackbarBorder(title, theme) {
  switch (title) {
    case "Importing EFT":
      return "none";
    case "Unvalid EFT":
      return `solid 3px ${theme.palette.property.org}`;
    case "Permission denied":
      return `solid 3px ${theme.palette.property.red}`;
    default:
      return "none";
  }
}
function getSnackbarColor(title, theme) {
  switch (title) {
    case "Importing EFT":
      return theme.palette.background.paper;
    case "Unvalid EFT":
      return theme.palette.property.org;
    case "Permission denied":
      return theme.palette.property.red;
    default:
      return theme.palette.background.paper;
  }
}
function getPrimaryColor(title, theme) {
  switch (title) {
    case "Importing EFT":
      return theme.palette.text.primary;
    case "Unvalid EFT":
      return theme.palette.button.color;
    case "Permission denied":
      return theme.palette.button.color;
    default:
      return theme.palette.text.primary;
  }
}
function getSecondaryColor(title, theme) {
  switch (title) {
    case "Importing EFT":
      return theme.palette.text.secondary;
    case "Unvalid EFT":
      return theme.palette.button.color;
    case "Permission denied":
      return theme.palette.button.color;
    default:
      return theme.palette.text.secondary;
  }
}
