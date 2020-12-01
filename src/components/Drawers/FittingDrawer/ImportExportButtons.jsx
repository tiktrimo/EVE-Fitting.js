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
  warning: {
    color: theme.palette.text.primary,
  },
}));

export default function ImportExportButtons(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [openAlert, setOpenAlert] = useState(false);

  const [title, setTitle] = useState("Welcome to Fitting.js");
  const [text, setText] = useState(false);

  const handleImportClick = useCallback(() => {
    copyTextFromClipboard().then((text) => {
      setOpenAlert(true);
      if (text === false) return setTitle("Permission denied");
      setText(text);
      props.setImportFitText(text);
      props.setImportStateFlag(importInitializeFlag);
      props.cache.wait("/typeIDsTable").then((typeIDs) => {
        const IDs = EFT.extractIDs(text, typeIDs);
        if (!IDs || IDs.length === 0) setTitle("Unvalid EFT");
        else setTitle("Importing EFT");
        fittingLazyFetch(props.cache, IDs);
      });
    });
  }, [props.setImportFitText, props.setImportStateFlag, props.cache]);

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
            backgroundColor: theme.palette.background.paper,
            border: getSnackbarBorder(title, theme),
          },
        }}
        message={
          <ListItem className={classes.listItem}>
            <ListItemIcon>
              <ArchiveIcon className={classes.warning} />
            </ListItemIcon>

            <ListItemText
              primary={title}
              secondary={text}
              primaryTypographyProps={{
                style: { color: theme.palette.text.primary, fontWeight: 700 },
              }}
              secondaryTypographyProps={{
                style: { color: theme.palette.text.secondary },
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
