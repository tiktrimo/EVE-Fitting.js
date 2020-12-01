import {
  ClickAwayListener,
  List,
  ListItem,
  makeStyles,
  Paper,
  Popper,
  useTheme,
} from "@material-ui/core";
import React, { useRef, useState } from "react";
import { EhpIcon } from "../../Icons/defenseIcons";
import { ResistanceProgressLabel } from "./ResistanceProgressLabel";

const scrollbarWidth = (() => {
  // Creating invisible container
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll"; // forcing scrollbar to appear
  outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement("div");
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const _scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);

  return _scrollbarWidth;
})();

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  popperPaper: {
    width: 300,
    overflow: "hidden",
  },
  popperChild: {
    width: 300 + scrollbarWidth,
    maxHeight: 400,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: scrollbarWidth,
  },
  listItem: {
    padding: 0,
  },
}));

function DamageTypeList(props) {
  const classes = useStyles();

  return (
    <List className={classes.list} component="div">
      {damgeTypes.map((damageType) => {
        return (
          <ListItem
            key={damageType.name}
            className={classes.listItem}
            button
            onClick={() => {
              props.setDamageType({ ...damageType });
            }}
          >
            <ResistanceProgressLabel
              label={damageType.name}
              resistance={damageType}
            />
          </ListItem>
        );
      })}
    </List>
  );
}

export default function DamageTypeProgressLabel(props) {
  const theme = useTheme();
  const classes = useStyles();

  const anchorEl = useRef(null);

  const [DamageTypeListOpen, setDamageTypeListOpen] = useState(false);

  return (
    <ClickAwayListener
      onClickAway={() => {
        setDamageTypeListOpen(false);
      }}
    >
      {/* wrraper for ClickAwayListener */}
      <div className={classes.root}>
        <div
          ref={anchorEl}
          onClick={() => {
            setDamageTypeListOpen(!DamageTypeListOpen);
          }}
        >
          <ResistanceProgressLabel
            label={props.damageType.name || "Omni"}
            Icon={
              <div style={{ height: 24 }}>
                <EhpIcon color={theme.palette.text.primary} />
              </div>
            }
            resistance={props.damageType}
            button
          />
        </div>
        <Popper
          open={DamageTypeListOpen}
          anchorEl={anchorEl.current}
          placement="bottom"
        >
          <Paper className={classes.popperPaper} elevation={3}>
            <div className={classes.popperChild}>
              <DamageTypeList setDamageType={props.setDamageType} />
            </div>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}

const damgeTypes = [
  { name: "Omni", EM: 25, TH: 25, KI: 25, EX: 25 },
  { name: "Amarr", EM: 60, TH: 40, KI: 0, EX: 0 },
  { name: "Minmatar", EM: 25, TH: 25, KI: 25, EX: 25 },
  { name: "Caldari", EM: 25, TH: 25, KI: 25, EX: 25 },
  { name: "Gallente", EM: 25, TH: 40, KI: 60, EX: 25 },
  { name: "Angel Cartel", EM: 7, TH: 9, KI: 22, EX: 62 },
  { name: "Blood Raiders", EM: 50, TH: 48, KI: 1, EX: 1 },
  { name: "Drones", EM: 6, TH: 6, KI: 20, EX: 68 },
  { name: "EoM", EM: 0, TH: 26, KI: 74, EX: 0 },
  { name: "Guristas", EM: 2, TH: 18, KI: 79, EX: 1 },
  { name: "Mercenaries", EM: 51, TH: 9, KI: 33, EX: 7 },
  { name: "Mordu's Region", EM: 30, TH: 0, KI: 70, EX: 0 },
  { name: "Sansha", EM: 53, TH: 47, KI: 0, EX: 0 },
  { name: "Blood", EM: 0, TH: 55, KI: 45, EX: 0 },
  { name: "Electro Magnetic", EM: 100, TH: 0, KI: 0, EX: 0 },
  { name: "Thermal", EM: 0, TH: 100, KI: 0, EX: 0 },
  { name: "Kinetic", EM: 0, TH: 0, KI: 100, EX: 0 },
  { name: "Explosive", EM: 0, TH: 0, KI: 0, EX: 100 },
];
