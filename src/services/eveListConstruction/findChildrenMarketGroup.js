export default function findChildrenMarketGroup(props) {
  if (!props.table.marketGroupTable) return [];

  return props.table.marketGroupTable.filter((entry) => {
    return entry.parentGroupID === props.rootMarketGroupID;
  });
}
