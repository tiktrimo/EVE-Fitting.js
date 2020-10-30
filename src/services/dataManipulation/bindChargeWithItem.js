import { findAttributesByName } from "./findAttributes";

export function bindChargeWithItemMul(
  slots,
  itemAttributeName,
  chargeAttributeName
) {
  if (!slots) return undefined;

  return slots.map((entry) => {
    if (!entry?.charge?.typeID) return entry;

    const itemAttributeValue = findAttributesByName(
      entry.item,
      itemAttributeName
    );
    const itemAttributeIndex = entry.item.typeAttributesStats.findIndex(
      (entry) => entry.attributeName === itemAttributeName
    );
    const chargeAttributeValue = findAttributesByName(
      entry.charge,
      chargeAttributeName
    );

    if (!itemAttributeValue || !chargeAttributeValue) return entry;

    const typeAttributesStats = [...entry.item.typeAttributesStats];
    typeAttributesStats[itemAttributeIndex] = {
      attributeName: itemAttributeName,
      value: itemAttributeValue * chargeAttributeValue,
    };

    return {
      ...entry,
      item: {
        ...entry.item,
        typeAttributesStats: typeAttributesStats,
      },
    };
  });
}

export function bindChargeWithItemPer(
  slots,
  itemAttributeName,
  chargeAttributeName
) {
  if (!slots) return undefined;

  return slots.map((entry) => {
    if (!entry?.charge?.typeID) return entry;

    const itemAttributeValue = findAttributesByName(
      entry.item,
      itemAttributeName
    );
    const itemAttributeIndex = entry.item.typeAttributesStats.findIndex(
      (entry) => entry.attributeName === itemAttributeName
    );
    const chargeAttributeValue = findAttributesByName(
      entry.charge,
      chargeAttributeName
    );

    if (!itemAttributeValue || !chargeAttributeValue) return entry;

    const typeAttributesStats = [...entry.item.typeAttributesStats];
    typeAttributesStats[itemAttributeIndex] = {
      attributeName: itemAttributeName,
      value:
        itemAttributeValue + itemAttributeValue * (chargeAttributeValue * 0.01),
    };

    return {
      ...entry,
      item: {
        ...entry.item,
        typeAttributesStats: typeAttributesStats,
      },
    };
  });
}
