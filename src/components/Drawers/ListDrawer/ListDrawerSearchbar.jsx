import {
  ClickAwayListener,
  makeStyles,
  Paper,
  Popper,
  TextField,
  withStyles,
} from "@material-ui/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ItemSelectionListCache from "../../itemSelection/ItemSelectionListCache";

const useStyles = makeStyles((theme) => ({
  textField: {
    margin: "3px 12px 0px 16px",
  },
  textFieldInputLabel: {
    fontWeight: 700,
    fontSize: "14px",
  },
  textFieldinputLabel: {
    fontWeight: 700,
    padding: "3px 0px 3px 1px",
    height: 26,
  },
  popper: {
    zIndex: 1201,
    transition: theme.transitions.create("opacity", {
      duration: 150,
    }),
  },
  popperPaper: {
    width: 300,
    overflow: "hidden",
  },
  popperChild: {
    width: "100%",
    height: "100%",
    maxHeight: 600,
    overflowY: "auto",
    paddingRight: 20,
    overflowX: "hidden",
  },
}));

const SearchTextField = withStyles({
  root: {
    "& input:valid + fieldset": {
      borderWidth: 2,
    },
    "& input:invalid + fieldset": {
      borderWidth: 2,
    },
    "& input:valid:focus + fieldset": {
      borderLeftWidth: 6,
      padding: "4px !important", // override inline-style
    },
  },
})(TextField);

export default function ListDrawerSearchbar(props) {
  const classes = useStyles();
  const anchorEl = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchTextChange = useCallback((e) => {
    setSearchText(e.target.value);
    if (!!e.target.value) {
      setSearchOpen(true);
      setSearchVisible(true);
    }
  });

  return (
    <ClickAwayListener
      onClickAway={() => {
        setSearchVisible(false);
      }}
    >
      <div>
        <SearchTextField
          ref={anchorEl}
          className={classes.textField}
          InputLabelProps={{
            className: classes.textFieldInputLabel,
          }}
          inputProps={{
            className: classes.textFieldinputLabel,
          }}
          label="Search"
          onChange={handleSearchTextChange}
          onFocus={handleSearchTextChange}
        />

        <Popper
          style={{ opacity: searchVisible ? 1 : 0 }}
          className={classes.popper}
          open={searchOpen}
          anchorEl={anchorEl.current}
          placement="bottom-start"
        >
          <Paper className={classes.popperPaper} elevation={3}>
            <div className={classes.popperChild}>
              <ItemSelectionListCache
                eveListConfig={mutateEveListConfig(
                  props.eveListConfig,
                  searchText
                )}
                cache={props.cache}
                nosave
              />
            </div>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
function mutateEveListConfig(eveListConfig, searchText) {
  if (!searchText) return eveListConfig;

  const mutatedAllowedAttributes = [...eveListConfig.filter.allowedAttributes];
  mutatedAllowedAttributes.push({
    attributeName: "typeName",
    value: searchText,
  });

  return {
    ...eveListConfig,
    opened: true,
    filter: {
      allowedAttributes: mutatedAllowedAttributes,
    },
  };
}
