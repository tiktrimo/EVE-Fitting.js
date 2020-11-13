import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import createEveList from "../../services/eveListConstruction/createEveList";
import { defalutEveListConfigStructure } from "../../services/eveListConstruction/createEveList";
import { database } from "../../index";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minWidth: 350,
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    paddingTop: 0,
  },
}));

export default React.memo(function ItemSelectionListCache(props) {
  const classes = useStyles();

  const [item, setItem] = useState(false);

  const [marketGroupTable, setMarketGroupTable] = useState(false);
  const [invTypesTable, setInvTypesTable] = useState(false);

  const [builtListStructure, setBuiltListStructure] = useState(undefined);
  const [eveListConfig] = useState({
    ...defalutEveListConfigStructure,
    ...props.eveListConfig,
    state: {
      item: item,
      setItem: setItem,
      outboundSetItem: props.eveListConfig.state.outboundSetItem,
    },
  });

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
          return database
            .ref(`/typeIDs/${item.typeID}`)
            .once("value")
            .then((data) => data.val());
        })
        .then((data) => {
          setItem(data);
          return;
        });
    }
  }, [item?.typeID]);

  useEffect(() => {
    const evelistConfigUpToDate = {
      ...eveListConfig,
      rootMarketGroupID: props.eveListConfig.rootMarketGroupID,
      filter: props.eveListConfig.filter,
      table: {
        marketGroupTable: marketGroupTable,
        invTypesTable: invTypesTable,
      },
      cache: props.cache,
    };

    if (!!marketGroupTable && !!invTypesTable) {
      if (!props.nosave)
        props.cache
          .get(
            //prettier-ignore
            `eveListConfig:${JSON.stringify(props.eveListConfig)})}`,
            () => {
              return new Promise((resolve) => {
                resolve(createEveList(evelistConfigUpToDate));
              });
            }
          )
          .then((data) => {
            setBuiltListStructure(data);
          });
      else setBuiltListStructure(createEveList(evelistConfigUpToDate));
    }
  }, [marketGroupTable, invTypesTable, hashFilter(props.eveListConfig)]);

  return (
    <List className={classes.root} dense>
      <Collapse in timeout="auto">
        {builtListStructure}
      </Collapse>
    </List>
  );
});
function hashFilter(eveListConfig) {
  const rootMarketGroupID = eveListConfig.rootMarketGroupID;
  const allowedAttributes = eveListConfig.filter.allowedAttributes;

  return allowedAttributes
    .map((attr) => [attr.attributeName, attr.value].join("-"))
    .join("|")
    .concat(rootMarketGroupID);
}
