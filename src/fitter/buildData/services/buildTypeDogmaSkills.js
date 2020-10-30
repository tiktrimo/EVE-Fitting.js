module.exports = function buildTypeDogmaSkills(typeDogma) {
  if (!typeDogma) return undefined;

  const typeSkills = new Array(3).fill(undefined);
  const typeAttributesStats = typeDogma.dogmaAttributes;

  typeAttributesStats.forEach((attribute) => {
    if (attribute.attributeID === 182) typeSkills[0] = attribute.value;
    else if (attribute.attributeID === 183) typeSkills[1] = attribute.value;
    else if (attribute.attributeID === 184) typeSkills[2] = attribute.value;
  });

  return typeSkills.filter((skill) => skill !== undefined);
};
function validateTypeSkills(typeSkills) {
  let mutationCount = 0;

  typeSkills.reduce((result, skill) => {
    if (!!skill !== !!result) mutationCount++;
    return !!skill;
  }, true);

  return mutationCount <= 1;
}
