import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import { Collapse, useTheme } from "@material-ui/core";
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

export default React.memo(function ItemSelectionList(props) {
  const classes = useStyles();
  const [item, setItem] = useState(false);

  const [marketGroupTable, setMarketGroupTable] = useState(false);
  const [invTypesTable, setInvTypesTable] = useState(false);
  const [builtEveList, setBuiltEveList] = useState({ eveList: false });

  useEffect(() => {
    props.cache.wait("/marketCategories").then((data) => {
      setMarketGroupTable(data);
    });
  }, []);

  useEffect(() => {
    props.cache.wait("/typeIDsTable").then((data) => setInvTypesTable(data));
  }, []);

  useEffect(() => {
    if (!!item?.typeID) {
      props.cache
        .get(`typeID/${item.typeID}`, () => {
          //storage version
          const saved = localStorage.getItem(`typeID/${item.typeID}`);
          if (saved !== null) return Promise.resolve(JSON.parse(saved));

          return storage
            .ref(`/typeIDs/typeID${item.typeID}.json`)
            .getDownloadURL()
            .then(async (url) => {
              const result = await fetch(url)
                .then((data) => data.json())
                .then((data) => cJSON.decompress(data));
              localStorage.setItem(
                `typeID/${item.typeID}`,
                JSON.stringify(result)
              );
              return result;
            });
        })
        .then((data) => {
          setItem(data);
          return;
        });
    }
  }, [item?.typeID]);

  useEffect(() => {
    if (marketGroupTable && invTypesTable)
      setBuiltEveList({
        eveList: createEveList({
          ...defalutEveListConfigStructure,
          ...props.eveListConfig,
          state: {
            item: item,
            setItem: setItem,
            outboundSetItem: props.eveListConfig.state.outboundSetItem,
          },
          rootMarketGroupID: props.eveListConfig.rootMarketGroupID,
          filter: props.eveListConfig.filter,
          table: {
            marketGroupTable: marketGroupTable,
            invTypesTable: invTypesTable,
          },
          cache: props.cache,
        }),
      });
  }, [props.eveListConfig, props.cache, marketGroupTable, invTypesTable, setItem]);

  return (
    <List className={classes.root} dense>
      <Collapse in timeout="auto">
        {builtEveList.eveList}
      </Collapse>
    </List>
  );
});
