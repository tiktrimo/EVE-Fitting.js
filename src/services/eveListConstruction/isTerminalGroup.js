export default function isTerminalGroup(props) {
  if (!props.table.marketGroupTable || props.rootMarketGroupID === undefined)
    return undefined;
  const marketCategory = props.table.marketGroupTable.find(
    (entry) => entry.marketGroupID === props.rootMarketGroupID
  );
  return marketCategory.hasTypes;
}
