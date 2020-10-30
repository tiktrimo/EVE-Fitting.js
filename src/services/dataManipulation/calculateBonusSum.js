import { findAttributesByName } from "./findAttributes";

export function calculateBonusSumMul(slots, attributeName) {
  if (!slots || !slots.highSlots || !slots.midSlots || !slots.lowSlots)
    return undefined;

  const bonusMultipliers = [];
  slots.highSlots.forEach((entry) => {
    if (!!entry) {
      const bonusMultiplier = findAttributesByName(entry.item, attributeName);
      bonusMultiplier && bonusMultipliers.push(1 + bonusMultiplier / 100);
    }
  });
  slots.midSlots.forEach((entry) => {
    if (!!entry) {
      const bonusMultiplier = findAttributesByName(entry.item, attributeName);
      bonusMultiplier && bonusMultipliers.push(1 + bonusMultiplier / 100);
    }
  });
  slots.lowSlots.forEach((entry) => {
    if (!!entry) {
      const bonusMultiplier = findAttributesByName(entry.item, attributeName);
      bonusMultiplier && bonusMultipliers.push(1 + bonusMultiplier / 100);
    }
  });

  return calculateBonusMul(bonusMultipliers);
}

function calculateBonusMul(bonuses) {
  if (bonuses.constructor === Number) return bonuses;

  if (bonuses.constructor === Array) {
    bonuses.sort((a, b) => b - a);

    let accumulatedBonus = 1;
    bonuses.forEach((entry, index) => {
      accumulatedBonus *= 1 + (entry - 1) * penaltyMultiplier(index + 1);
    });

    return accumulatedBonus;
  }
}
function penaltyMultiplier(count) {
  return Math.pow(Math.E, -0.140274 * (count - 1) * (count - 1));
}
