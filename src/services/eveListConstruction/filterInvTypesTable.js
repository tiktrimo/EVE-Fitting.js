export default function headFilterInvTypesTable(props) {
  if (!props.table.invTypesTable) return undefined;

  const allowedAttributes = props.filter.allowedAttributes;

  if (allowedAttributes.constructor === Array) {
    let invTypesTable = props.table.invTypesTable;

    allowedAttributes.forEach((allowedAttribute) => {
      invTypesTable = bodyFilterInvTypesTable(allowedAttribute, invTypesTable);
    });

    return invTypesTable;
  }

  return props.table.invTypesTable;
}

function bodyFilterInvTypesTable(allowedAttribute, invTypesTable) {
  if (!allowedAttribute.attributeName) return invTypesTable;

  return invTypesTable.filter((entry) => {
    switch (allowedAttribute?.value?.constructor) {
      case Boolean:
      case Number:
        return allowedAttribute.value === 0
          ? entry[allowedAttribute.attributeName] === undefined ||
              entry[allowedAttribute.attributeName] === allowedAttribute.value
          : entry[allowedAttribute.attributeName] === allowedAttribute.value;
      case Array:
        return allowedAttribute.value.includes(
          entry[allowedAttribute.attributeName]
        );
      case String:
        return entry[allowedAttribute.attributeName]
          .toLowerCase()
          .includes(allowedAttribute.value.toLowerCase());
      default:
        return true;
    }
  });
}
