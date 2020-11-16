import React from "react";
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
} from "@material-ui/core";
import { useState } from "react";
import { orange } from "@material-ui/core/colors";
import WarningIcon from "@material-ui/icons/Warning";
import { importInitializeFlag } from "./FittingDrawer";

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  snackbar: {
    backgroundColor: orange[500],
  },
  lsitItem: {
    height: 40,
    width: "100%",
    padding: "0px 10px 0px 10px",
  },
  warning: {
    color: theme.palette.button.color,
  },
}));

export default function ImportExportButtons(props) {
  const classes = useStyles();

  const [openAlert, setOpenAlert] = useState(false);
  return (
    <React.Fragment>
      <Tooltip title="Import" placement="bottom" arrow>
        <div>
          <RecButton
            className={classes.button}
            onClick={() => {
              copyTextFromClipboard().then((text) => {
                if (text === false) return setOpenAlert(true);
                props.setImportFitText(text);
                props.setImportStateFlag(importInitializeFlag);
                props.cache.wait("/typeIDsTable").then((typeIDs) => {
                  const IDs = EFT.extractIDs(text, typeIDs);
                  fittingLazyFetch(props.cache, IDs);
                });
              });
            }}
          >
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
        ContentProps={{ className: classes.snackbar }}
        message={
          <ListItem className={classes.lsitItem}>
            <ListItemIcon>
              <WarningIcon className={classes.warning} fontSize="small" />
            </ListItemIcon>

            <ListItemText
              primary={"Allow permission"}
              secondary={"copy from clipboard"}
              secondaryTypographyProps={{ style: { color: orange[100] } }}
            />
          </ListItem>
        }
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
