import React from "react";
import NestedList from "../../components/simpleEdition/shipCardComponents/NestedListDedicated";
import ItemSelection from "../../components/itemSelection/ItemSelection";
import isTerminalGroup from "./isTerminalGroup";
import findChildrenMarketGroup from "./findChildrenMarketGroup";
import findChildrenInvTypes from "./findChildrenInvTypes";
import isArrayEmpty from "./isArrayEmpty";
import filterInvTypesTable from "./filterInvTypesTable";

// Judge creating multuple list or not by rootMaeketGroupID's condition
export default function headCreateEveList(props) {
  if (!props.rootMarketGroupID) return;

  props.table.invTypesTable = filterInvTypesTable(props);
  if (props.table.invTypesTable.length > 50) props.opened = false;

  if (props.rootMarketGroupID.constructor === Number) {
    return bodyCreateEveList(props);
  }
  if (props.rootMarketGroupID.constructor === Array) {
    return props.rootMarketGroupID.map((entry) => {
      return bodyCreateEveList({
        ...props,
        rootMarketGroupID: entry,
      });
    });
  }
}

function bodyCreateEveList(props) {
  if (!validateTables(props)) return false;

  if (isTerminalGroup(props)) {
    return renderChildrenInvTypes(props);
  } else {
    return renderChildrenMarketGroup(props);
  }
}

function renderChildrenInvTypes(props) {
  const childrenInvTypes = findChildrenInvTypes(props);
  return childrenInvTypes.map((entry) => {
    return (
      <ItemSelection
        setItem={props.state.setItem}
        outboundSetItem={props.state.outboundSetItem}
        key={entry.typeName}
        itemData={entry}
      />
    );
  });
}
function renderChildrenMarketGroup(props) {
  const childrenMarketGroup = findChildrenMarketGroup(props);
  return childrenMarketGroup.map((entry) => {
    const renderedChildrenMarketGroups = bodyCreateEveList({
      ...props,
      rootMarketGroupID: entry.marketGroupID,
    });

    if (!isArrayEmpty(renderedChildrenMarketGroups)) return undefined;
    else
      return (
        <NestedList
          opened={!!props.opened}
          key={entry.marketGroupName}
          itemData={entry}
          eveListConfig={props}
          cache={props.cache}
        >
          {renderedChildrenMarketGroups}
        </NestedList>
      );
  });
}

function validateTables(props) {
  if (!!props.table.marketGroupTable && !!props.table.invTypesTable) {
    return true;
  } else return false;
}

export const defalutEveListConfigStructure = {
  opened: false,
  rootMarketGroupID: 2,
  table: {
    marketGroupTable: false,
    invTypesTable: false,
  },
  filter: {
    allowedAttributes: [
      {
        attributeName: false,
        value: false,
      },
    ],
  },
  state: {
    item: false,
    setItem: false,
    outboundSetItem: false,
  },
};
