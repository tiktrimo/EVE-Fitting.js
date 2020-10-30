export function getModifiedAttrBonusValueMul(shipBonuses, modifiedAttributeID) {
  if (!shipBonuses || shipBonuses.constructor !== Array) return 1;

  const bonuses = getModifiedAttrBonus(shipBonuses, modifiedAttributeID);
  if (!bonuses[0] || !bonuses[0].skillTypeID) return 1;

  if (bonuses[0].operation === "postPercent") {
    let bonusStack = 1;
    bonuses.forEach((entry) => {
      bonusStack = bonusStack * (1 + entry.value / 100);
    });
    return bonusStack;
  } else return -1;
}
export function getModifiedAttrBonusSkillTypeID(
  shipBonuses,
  modifiedAttributeID
) {
  if (!shipBonuses || shipBonuses.constructor !== Array) return -1;

  const bonuses = getModifiedAttrBonus(shipBonuses, modifiedAttributeID);
  if (!bonuses[0] || !bonuses[0].skillTypeID) return -1;

  return bonuses[0].skillTypeID;
}

function getModifiedAttrBonus(shipBonuses, modifiedAttributeID) {
  if (!shipBonuses || shipBonuses.constructor !== Array) return undefined;

  const shipBonus = shipBonuses.filter(
    (entry) => entry.modifiedAttributeID === modifiedAttributeID
  );
  if (!shipBonus) return undefined;

  return shipBonus;
}

export function aggregateModifiedAttrBonusBySkillID(shipBonuses) {
  if (!shipBonuses || shipBonuses.constructor !== Array) return [];

  const affectedSkillID = [
    ...new Set(shipBonuses.map((entry) => entry.skillTypeID)),
  ];

  return affectedSkillID.map((skillIdEntry) => {
    const affectedBonuses = shipBonuses.filter(
      (bonusesEntry) => bonusesEntry.skillTypeID === skillIdEntry
    );

    const modifiedAttributeIDs = [
      ...new Set(
        affectedBonuses.map((bonusesEntry) => bonusesEntry.modifiedAttributeID)
      ),
    ];

    const modifiedAttrBonusBySkillID = modifiedAttributeIDs.map(
      (modifiedAttrID) => {
        const valueSum = affectedBonuses.reduce((acc, bonusesEntry) => {
          if (modifiedAttrID === bonusesEntry.modifiedAttributeID)
            return acc * (1 + bonusesEntry.value / 100);
          else return acc;
        }, 1);
        return {
          modifiedAttributeID: modifiedAttrID,
          value: valueSum,
        };
      }
    );

    return {
      skillTypeID: skillIdEntry,
      bonuses: modifiedAttrBonusBySkillID,
    };
  });
}
