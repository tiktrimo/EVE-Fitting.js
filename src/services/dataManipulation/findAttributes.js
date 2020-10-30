export function findAttributesByName(item, attributeName) {
  if (!item || !item.typeAttributesStats) return undefined;

  if (attributeName.constructor === String) {
    return findAttributeByName(item, attributeName);
  } else if (attributeName.constructor === Array) {
    const attributes = attributeName.map((entry) =>
      findAttributeByName(item, entry)
    );

    if (attributes.length === 0) return undefined;
    return attributes;
  }
}

function findAttributeByName(item, attributeName) {
  if (!item || !item.typeAttributesStats) return undefined;

  if (item.typeAttributesStats.constructor !== Array) return undefined;

  const result = item.typeAttributesStats.filter(
    (entry) => entry.attributeName === attributeName
  );

  if (result.length === 1) return result[0].value;
  if (result.length >= 2) return result.map((entry) => entry.value);
  else return undefined;
}

export function findAttributesbyID(item, attributeID) {
  if (!item || !item.typeAttributesStats) return undefined;

  if (attributeID.constructor === Number) {
    return findAttributebyID(item, attributeID);
  } else if (attributeID.constructor === Array) {
    const attributes = attributeID.map((entry) =>
      findAttributebyID(item, entry)
    );

    if (attributes.length === 0) return undefined;
    return attributes;
  }
}

export function findAttributebyID(item, attributeID) {
  if (!item || !item.typeAttributesStats) return undefined;

  if (item.typeAttributesStats.constructor !== Array) return undefined;

  const result = item.typeAttributesStats.filter(
    (entry) => entry.attributeID === attributeID
  );

  if (result.length === 1) return result[0].value;
  else if (result.length >= 2) return result.map((entry) => entry.value);
  else return undefined;
}
