import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import { useEffect } from "react";
import { useState } from "react";
import createEveList from "../../services/eveListConstruction/createEveList";
import { defalutEveListConfigStructure } from "../../services/eveListConstruction/createEveList";
import { database, storage } from "../../index";
import cJSON from "compressed-json";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minWidth: 350,
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    paddingTop: 0,
  },
}));

export default function ItemSelection(props) {
  const classes = useStyles();
  const [marketGroupTable, setMarketGroupTable] = useState(false);
  const [invTypesTable, setInvTypesTable] = useState(false);
  const [builtListStructure, setBuiltListStructure] = useState(undefined);

  const eveListConfig = {
    ...defalutEveListConfigStructure,
    ...props.eveListConfig,
    table: {
      marketGroupTable: marketGroupTable,
      invTypesTable: invTypesTable,
    },
    cache: props.cache,
  };

  useEffect(() => {
    props.cache
      .get("/marketCategories", () => {
        return storage
          .ref("json/test/marketCategories.json")
          .getDownloadURL()
          .then(async (url) => {
            return await fetch(url)
              .then((data) => data.json())
              .then((data) => cJSON.decompress(data));
          });

        /* return database
          .ref("/compressed/compressedArray/marketCategories")
          .once("value")
          .then((data) => data.val()); */

        /* return fetch(
          "https://us-central1-eve-damagecontrol.cloudfunctions.net/compressed-getMarketCategories"
        ).then((data) => data.json()); */
      })
      .then((data) => {
        setMarketGroupTable(data);
      });
  }, []);

  useEffect(() => {
    props.cache
      .get("/typeIDsTable", () => {
        return storage
          .ref("/json/test/listInvTypesTable.json")
          .getDownloadURL()
          .then(async (url) => {
            return await fetch(url)
              .then((data) => data.json())
              .then((data) => cJSON.decompress(data));
          });

        /* return database
          .ref("/compressed/compressedArray/typeIDsTable")
          .once("value")
          .then((data) => data.val()); */

        /* return fetch(
          "https://us-central1-eve-damagecontrol.cloudfunctions.net/compressed-getArrayTypeIDsTable"
        ).then((data) => data.json()); */
      })
      .then((data) => setInvTypesTable(data));
  }, []);

  useEffect(() => {
    if (!!marketGroupTable && !!invTypesTable) {
      props.cache
        .get(
          //prettier-ignore
          `ItemSelectionList:${JSON.stringify(props.eveListConfig)}`,
          () => {
            return new Promise((resolve, reject) => {
              resolve(createEveList(eveListConfig));
            });
          }
        )
        .then((data) => {
          setBuiltListStructure(data);
        });
    }
  }, [marketGroupTable, invTypesTable]);

  return (
    <List className={classes.root} dense>
      <Collapse in timeout="auto">
        {builtListStructure}
      </Collapse>
    </List>
  );
}
