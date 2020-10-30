export default function isArrayEmpty(renderedChildrenMarketGroup) {
  if (renderedChildrenMarketGroup.length === 0) return false;

  for (let entry of renderedChildrenMarketGroup) {
    if (entry !== undefined) return true;
  }
  return false;
}
