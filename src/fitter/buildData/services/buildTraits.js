module.exports = function buildTraits(traits) {
  return {
    roleBonuses: buildRoleBonuses(traits),
    types: buildTraitsTypes(traits),
  };
};

function buildRoleBonuses(traits) {
  if (!traits || !traits.roleBonuses) return undefined;

  const roleBonuses = traits.roleBonuses;
  const compressedRoleBonusesTINY = roleBonuses.map((entry) => {
    return {
      bonus: entry.bonus,
      bonusText: entry.bonusText.en,
    };
  });
  return compressedRoleBonusesTINY;
}
function buildTraitsTypes(traits) {
  if (!traits || !traits.types) return undefined;

  const traitsTypes = traits.types;
  const traitsTypesKeys = Object.keys(traitsTypes);
  const compressedTraitsTypesTINY = {};
  traitsTypesKeys.forEach((entry) => {
    compressedTraitsTypesTINY[entry] = traitsTypes[entry].map((entry) => ({
      bonus: entry.bonus,
      bonusText: entry.bonusText.en,
    }));
  });
  return compressedTraitsTypesTINY;
}
