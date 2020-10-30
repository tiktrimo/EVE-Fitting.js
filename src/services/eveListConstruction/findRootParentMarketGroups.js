export default function findRootParentMarketGroups(props) {
  console.log(props);
  if (!props.table.marketGroupTable) {
    throw "Err: findChildrenMarketGroup: props missing";
  }
  if (!props.state.openedCategories) return [];

  const terminalMarketGroupIDs = props.state.openedCategories;
  const rootParentMarketGroups = [];

  terminalMarketGroupIDs.forEach((entry) => {
    let targetMarketGroupID = entry;
    while (true) {
      const rootMarketGroup = findMarketGroup(props, targetMarketGroupID);
      rootParentMarketGroups.push(rootMarketGroup.marketGroupID);

      if (!!rootMarketGroup.parentGroupID) {
        targetMarketGroupID = rootMarketGroup.parentGroupID;
      } else break;
    }
  });
  // Find opened categories and saves in props.state.local.openedCategories
  /* props.state["local"] = {};
  props.state.local["openedCategories"] = rootParentMarketGroups; */
  console.log("rootParent", rootParentMarketGroups);
  return rootParentMarketGroups;
}
function findMarketGroup(props, targetMarketGroupID) {
  return props.table.marketGroupTable.find(
    (entry) => entry.marketGroupID === targetMarketGroupID
  );
}
