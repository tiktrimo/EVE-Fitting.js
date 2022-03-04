import {
  ClickAwayListener,
  makeStyles,
  Paper,
  Popper,
  TextField,
  withStyles,
} from "@material-ui/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ItemSelectionList from "../../itemSelection/ItemSelectionList.jsx";

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
  popperVisible: {
    transition: `${theme.transitions.create(["opacity"], {
      duration: 150,
    })}`,
  },
  popperHidden: {
    transition: `${theme.transitions.create(["opacity"], {
      duration: 150,
    })},${theme.transitions.create(["z-index"], {
      duration: 300,
    })}`,
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
    width: "90%",
  },
})(TextField);

export default function ListDrawerSearchbar(props) {
  const classes = useStyles();
  const anchorEl = useRef(null);

  const [searchEveListConfig, setSearchEveListConfig] = useState({});
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

  useEffect(() => {
    setSearchEveListConfig(
      mutateEveListConfig(props.eveListConfig, searchText)
    );
  }, [props.eveListConfig, searchText]);

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
          style={{
            opacity: searchVisible ? 1 : 0,
            zIndex: searchVisible ? 2000 : -1000,
          }}
          className={
            searchVisible ? classes.popperVisible : classes.popperHidden
          }
          open={searchOpen}
          anchorEl={anchorEl.current}
          placement="bottom-start"
        >
          <Paper className={classes.popperPaper} elevation={3}>
            <div className={classes.popperChild}>
              <ItemSelectionList
                eveListConfig={searchEveListConfig}
                cache={props.cache}
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
