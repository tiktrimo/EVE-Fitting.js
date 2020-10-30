export default function findChildrenInvTypes(props) {
  if (!props.table.invTypesTable) return [];

  const invTypesTable = props.table.invTypesTable;
  const marketGroupID = props.rootMarketGroupID;

  const reultTEST = bubbleSortByMetaLevel(
    invTypesTable.filter((entry) => entry.marketGroupID === marketGroupID)
  );

  return reultTEST;
}
function bubbleSortByMetaLevel(childrenTypeIDs) {
  let len = childrenTypeIDs.length;

  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (
        childrenTypeIDs[i].typeMetaGroupID >
        childrenTypeIDs[i + 1].typeMetaGroupID
      ) {
        let tmp = childrenTypeIDs[i];
        childrenTypeIDs[i] = childrenTypeIDs[i + 1];
        childrenTypeIDs[i + 1] = tmp;
        swapped = true;
      }
    }
  } while (swapped);
  return childrenTypeIDs;
}
