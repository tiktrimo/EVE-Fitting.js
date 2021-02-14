module.exports = function buildTypeDogmaEffects(ID, props) {
  const typeDogma = props.typeDogmas[ID];
  if (!typeDogma) return [];

  const dogmaEffects = props.dogmaEffects;
  const dogmaAttributes = props.dogmaAttributes;

  const typeEffectsStats = typeDogma.dogmaEffects.map((entry) => {
    const dogmaEffect = dogmaEffects[entry.effectID];

    return {
      effectID: entry.effectID,
      effectName: dogmaEffect.effectName,
      effectCategory: dogmaEffect.effectCategory,
      modifierInfo:
        dogmaEffect.modifierInfo &&
        dogmaEffect.modifierInfo.map((info) => {
          const modifiedAttribute = dogmaAttributes[info.modifiedAttributeID];
          return {
            ...info,
            modifiedAttributeHighIsGood: !!modifiedAttribute
              ? modifiedAttribute.highIsGood
              : undefined,
            modifiedAttributeStackable: !!modifiedAttribute
              ? modifiedAttribute.stackable
              : undefined,
          };
        }),
    };
  });
  const linkedTypeEffectsStats = addMissingEffects(ID, typeEffectsStats);
  const mutatedTypeEffectsStats = mutateEffects(ID, linkedTypeEffectsStats);
  return mutatedTypeEffectsStats;
};
function mutateEffects(typeID, typeEffectsStats) {
  const isDamageControl = !!typeEffectsStats.find(
    (efft) => efft.effectID === 2302
  ); //effectID: 2302, effectName: "damageControl"
  if (isDamageControl) {
    const damageControlMods = typeEffectsStats.find(
      (efft) => efft.effectID === 2302
    ).modifierInfo; //effectID: 2302, effectName: "damageControl"
    damageControlMods.forEach((mod) => (mod.isStackException = true));
  }
  return typeEffectsStats;
}
function addMissingEffects(typeID, typeEffectsStats) {
  if (!typeEffectsStats) return typeEffectsStats;

  const privateEffects = [];

  const isLoPower = !!typeEffectsStats.find((efft) => efft.effectID === 11); //effectID: 12, effectName: "loPower" (in modules)
  const isHiPower = !!typeEffectsStats.find((efft) => efft.effectID === 12); //effectID: 12, effectName: "hiPower" (in modules)
  const isMedPower = !!typeEffectsStats.find((efft) => efft.effectID === 13); //effectID: 12, effectName: "medPower" (in modules)
  if (isLoPower || isMedPower || isHiPower)
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10001));

  //prettier-ignore
  const isMissileSpecialization = !!typeEffectsStats.find((efft) => efft.effectID === 1851); //effectID: 1851,effectName: "selfRof" (in missile skill types)
  if (isMissileSpecialization) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10002));
  }

  //prettier-ignore
  const isMissileBasic = !!typeEffectsStats.find((efft) => efft.effectID === 660); //effectID: 660, effectName: "missileEMDmgBonus" (in missile skill types)
  if (isMissileBasic) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10003));
  }

  const isNaniteRepairPaste = typeID === 28668; //effectID: 5275, effectName: "fueledArmorRepair" (in nanite repair paste type)
  if (isNaniteRepairPaste) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10004));
  }
  //prettier-ignore
  const isDroneBasicSpecialization = !!typeEffectsStats.find((efft) => efft.effectID === 1730); // effectID: 1730, effectName: "droneDmgBonus" (in drone skill types)
  if (isDroneBasicSpecialization) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10005));
  }
  //prettier-ignore
  const isMissileLaunching = !!typeEffectsStats.find((efft) => efft.effectID === 9); // effectID: 9, effectName: "missileLaunching",
  if (isMissileLaunching) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10006));
  }

  //prettier-ignore
  const isSubsystemSlotModifier = !!typeEffectsStats.find(efft => efft.effectID === 3774); //effectID: 3774, effectName: "slotModifier",
  if (isSubsystemSlotModifier) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10007));
  }

  //prettier-ignore
  const isSubsystemHardpointModifier = !!typeEffectsStats.find(efft => efft.effectID === 3773); //effectID: 3773, effectName: "hardPointModifierEffect",
  if (isSubsystemHardpointModifier) {
    privateEffects.push(GET_PRIVATE_EFFECTS(typeID, 10008));
  }

  return typeEffectsStats.concat(privateEffects);
}
const GET_PRIVATE_EFFECTS = (typeID, effectID) => {
  switch (effectID) {
    case 10001:
      return {
        effectID: 10001,
        effectName: "privateEffect_Engineering_PowerLoad_CpuLoad",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeID: 15,
            modifiedAttributeStackable: true,
            modifyingAttributeID: 30,
            operation: "modAdd",
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeID: 49,
            modifiedAttributeStackable: true,
            modifyingAttributeID: 50,
            operation: "modAdd",
          },
        ],
      };
    case 10002:
      return {
        effectID: 10002,
        effectName: "privateEffect_Skill_Missile_Specialization_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 51,
            modifyingAttributeID: 293,
            operation: "postPercent",
            skillTypeID: typeID,
            modifiedAttributeHighIsGood: false,
            modifiedAttributeStackable: false,
            isStackException: true,
          },
        ],
      };
    case 10003:
      return {
        effectID: 10003,
        effectName: "privateEffect_Skill_Missile_Basic_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 114,
            modifyingAttributeID: 292,
            operation: "postPercent",
            skillTypeID: typeID,
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 116,
            modifyingAttributeID: 292,
            operation: "postPercent",
            skillTypeID: typeID,
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 117,
            modifyingAttributeID: 292,
            operation: "postPercent",
            skillTypeID: typeID,
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 118,
            modifyingAttributeID: 292,
            operation: "postPercent",
            skillTypeID: typeID,
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
        ],
      };
    case 10004:
      return {
        effectID: 10004,
        effectName: "privateEffect_Nanite_Armor_Fuled_Repair_Bonus",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "otherID",
            func: "ItemModifier",
            modifiedAttributeID: 84,
            modifyingAttributeID: 0,
            operation: "preMul",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: false,
            modifyingAttributeValue: 3,
            isStackException: true,
          },
        ],
      };
    case 10005:
      return {
        effectID: 10005,
        effectName: "privateEffect_Skill_Drone_Basic_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 64,
            modifyingAttributeID: 292,
            operation: "postPercent",
            skillTypeID: typeID,
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: false,
            isStackException: true,
          },
        ],
      };
    case 10006:
      return {
        effectID: 10006,
        effectName: "privateEffect_Missile_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 114,
            modifyingAttributeID: 212,
            operation: "postMul",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 116,
            modifyingAttributeID: 212,
            operation: "postMul",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 117,
            modifyingAttributeID: 212,
            operation: "postMul",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 118,
            modifyingAttributeID: 212,
            operation: "postMul",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
        ],
      };
    case 10007:
      return {
        effectID: 10007,
        effectName: "privateEffect_Subsystem_slotModifier_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 14,
            modifyingAttributeID: 1374,
            operation: "modAdd",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 13,
            modifyingAttributeID: 1375,
            operation: "modAdd",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 12,
            modifyingAttributeID: 1376,
            operation: "modAdd",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
        ],
      };
    case 10008:
      return {
        effectID: 10008,
        effectName: "privateEffect_Subsystem_HardPoint_Modifier_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 102,
            modifyingAttributeID: 1368,
            operation: "modAdd",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 101,
            modifyingAttributeID: 1369,
            operation: "modAdd",
            modifiedAttributeHighIsGood: true,
            modifiedAttributeStackable: true,
          },
        ],
      };
    default:
      return {};
  }
};
