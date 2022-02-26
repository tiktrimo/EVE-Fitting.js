module.exports = function buildTypeDogmaAttributes(ID, props) {
  const type = props.typeIDs[ID];
  const typeDogma = props.typeDogmas[ID];
  const dogmaAttributes = props.dogmaAttributes;
  if (!typeDogma) return undefined;

  addMissingAttributes(type, typeDogma);

  const typeAttributesStats = typeDogma.dogmaAttributes.map((entry) => {
    const dogmaAttribute = dogmaAttributes[entry.attributeID];

    // Custom defined data structure
    return {
      attributeID: entry.attributeID,
      attributeName:
        dogmaAttribute.displayNameID === undefined
          ? dogmaAttribute.name
          : dogmaAttribute.displayNameID.en,
      attributeCategoryID: dogmaAttribute.categoryID,
      value: entry.value,
      unitID: dogmaAttribute.unitID,
    };
  });

  return typeAttributesStats;
};
function addMissingAttributes(type, typeDogma) {
  //Add massAttribute to ship. to affected propulsion system(MWD)
  if (!!type.mass)
    typeDogma.dogmaAttributes.push({ attributeID: 4, value: type.mass });

  //Add Missile Damage Bonus attribute to missiles. to affected by ballistics cotrol
  if (!!typeDogma?.dogmaEffects?.find((efft) => efft.effectID === 9))// effectID: 9, effectName: "missileLaunching"
    typeDogma.dogmaAttributes.push({ attributeID: 212, value: 1 });

  //Add nosferatu ovverided attribute to nodferatu. to affected by blood raider ships
  if(!!typeDogma?.dogmaEffects?.find((efft) => efft.effectID === 6197))//effectID: 6197, effectName: "energyNosferatuFalloff"
    typeDogma.dogmaAttributes.push({attributeID: 1945, value: 0}); //0: false, 1: true
}
