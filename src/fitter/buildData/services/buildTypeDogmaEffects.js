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
      effectCategory: convertEffectCategory(dogmaEffect.effectCategory),
      modifierInfo:
        dogmaEffect.modifierInfo &&
        dogmaEffect.modifierInfo.map((info) => {
          const modifiedAttribute = dogmaAttributes[info.modifiedAttributeID];
          return {
            ...info,
            operation: convertModOperation(info.operation),
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
  const linkedTypeEffectsStats = addMissingEffects(ID, typeEffectsStats, props);
  const mutatedTypeEffectsStats = mutateEffects(ID, linkedTypeEffectsStats);
  return mutatedTypeEffectsStats;
};
function mutateEffects(typeID, typeEffectsStats) {
  //prettier-ignore
  const isDamageControl = !!typeEffectsStats.find((efft) => efft.effectID === 2302); //effectID: 2302, effectName: "damageControl"
  if (isDamageControl) {
    const damageControlMods = typeEffectsStats.find(
      (efft) => efft.effectID === 2302
    ).modifierInfo; //effectID: 2302, effectName: "damageControl"
    damageControlMods.forEach((mod) => (mod.isStackException = true));
  }

  return typeEffectsStats;
}
function addMissingEffects(typeID, typeEffectsStats, props) {
  if (!typeEffectsStats) return typeEffectsStats;

  const privateEffects = [];

  const isLoPower = !!typeEffectsStats.find((efft) => efft.effectID === 11); //effectID: 12, effectName: "loPower" (in modules)
  const isHiPower = !!typeEffectsStats.find((efft) => efft.effectID === 12); //effectID: 12, effectName: "hiPower" (in modules)
  const isMedPower = !!typeEffectsStats.find((efft) => efft.effectID === 13); //effectID: 12, effectName: "medPower" (in modules)
  if (isLoPower || isMedPower || isHiPower)
    privateEffects.push(getPrivateEffect(typeID, 10001, props));

  //prettier-ignore
  const isMissileSkillBookSpecial = !!typeEffectsStats.find((efft) => efft.effectID === 1851); //effectID: 1851,effectName: "selfRof" (in missile skill types)
  if (isMissileSkillBookSpecial) {
    privateEffects.push(getPrivateEffect(typeID, 10002, props));
  }

  //prettier-ignore
  const isMissileSkillBook = !!typeEffectsStats.find((efft) => efft.effectID === 660); //effectID: 660, effectName: "missileEMDmgBonus" (in missile skill types)
  if (isMissileSkillBook) {
    privateEffects.push(getPrivateEffect(typeID, 10003, props));
  }

  const isNaniteRepairPaste = typeID === 28668; //effectID: 5275, effectName: "fueledArmorRepair" (in nanite repair paste type)
  if (isNaniteRepairPaste) {
    privateEffects.push(getPrivateEffect(typeID, 10004, props));
  }
  //prettier-ignore
  const isDroneSkillBook = !!typeEffectsStats.find((efft) => efft.effectID === 1730); // effectID: 1730, effectName: "droneDmgBonus" (in drone skill types)
  if (isDroneSkillBook) {
    privateEffects.push(getPrivateEffect(typeID, 10005, props));
  }
  //prettier-ignore
  const isMissileLauncher = !!typeEffectsStats.find((efft) => efft.effectID === 9); // effectID: 9, effectName: "missileLaunching",
  if (isMissileLauncher) {
    privateEffects.push(getPrivateEffect(typeID, 10006, props));
  }

  //prettier-ignore
  const isSubsystemSlotModifier = !!typeEffectsStats.find(efft => efft.effectID === 3774); //effectID: 3774, effectName: "slotModifier",
  if (isSubsystemSlotModifier) {
    privateEffects.push(getPrivateEffect(typeID, 10007, props));
  }

  //prettier-ignore
  const isSubsystemHardpointModifier = !!typeEffectsStats.find(efft => efft.effectID === 3773); //effectID: 3773, effectName: "hardPointModifierEffect",
  if (isSubsystemHardpointModifier) {
    privateEffects.push(getPrivateEffect(typeID, 10008, props));
  }

  //prettier-ignore
  const isStasisWebifier = !!typeEffectsStats.find((efft) => efft.effectID === 6426); //effectID: 6426, effectName: "remoteWebifierFalloff"
  if (isStasisWebifier) {
    privateEffects.push(getPrivateEffect(typeID, 10009, props));
  }

  //prettier-ignore
  const isTargetPainter = !!typeEffectsStats.find((efft) => efft.effectID === 6425); // effectID: 6425, effectName: 'remoteTargetPaintFalloff'
  if (isTargetPainter) {
    privateEffects.push(getPrivateEffect(typeID, 10010, props));
  }

  //prettier-ignore
  const isTrackingDisruptor = !!typeEffectsStats.find((efft) => efft.effectID === 6424); // effectID: 6424, effectName: 'shipModuleTrackingDisruptor'
  if (isTrackingDisruptor) {
    privateEffects.push(getPrivateEffect(typeID, 10011, props));
  }

  //prettier-ignore
  const isGuidanceDisruptor = !!typeEffectsStats.find((efft) => efft.effectID === 6424); // effectID: 6423, effectName: 'shipModuleGuidanceDisruptor'
  if (isGuidanceDisruptor) {
    privateEffects.push(getPrivateEffect(typeID, 10012, props));
  }

  return typeEffectsStats.concat(privateEffects);
}
function getPrivateEffect(typeID, effectID, props) {
  const privateEffect = GET_PRIVATE_EFFECTS(typeID, effectID);

  // add stackable, highisGood value to modifierInfo elements
  privateEffect.modifierInfo.forEach((mod) => {
    mod.modifiedAttributeStackable =
      props.dogmaAttributes[mod.modifiedAttributeID].stackable;
    mod.modifiedAttributeHighIsGood =
      props.dogmaAttributes[mod.modifiedAttributeID].highIsGood;
  });

  return privateEffect;
}

const GET_PRIVATE_EFFECTS = (typeID, effectID) => {
  switch (effectID) {
    case 10001:
      return {
        effectID: effectID,
        effectName: "privateEffect_Engineering_PowerLoad_CpuLoad",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 15, //Power Load
            modifyingAttributeID: 30, //Powergrid Usage
            operation: "modAdd",
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 49, //CPU Load
            modifyingAttributeID: 50, //CPU usage
            operation: "modAdd",
          },
        ],
      };
    case 10002:
      return {
        effectID: effectID,
        effectName:
          "privateEffect_Skill_Missile_Skillbook_Specialization_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 51, //Rate of fire
            modifyingAttributeID: 293, //Rate Of Fire Bonus
            operation: "postPercent",
            skillTypeID: typeID,
            isStackException: true,
          },
        ],
      };
    case 10003:
      return {
        effectID: effectID,
        effectName: "privateEffect_Skill_Missile_Skillbook_Basic_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 114, //EM damage
            modifyingAttributeID: 292, //Damage Multiplier Bonus
            operation: "postPercent",
            skillTypeID: typeID,
          },
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 116, //Explosive damage
            modifyingAttributeID: 292, //Damage Multiplier Bonus
            operation: "postPercent",
            skillTypeID: typeID,
          },
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 117, //Kinetic damage
            modifyingAttributeID: 292, //Damage Multiplier Bonus
            operation: "postPercent",
            skillTypeID: typeID,
          },
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 118, //Thermal damage
            modifyingAttributeID: 292, //Damage Multiplier Bonus
            operation: "postPercent",
            skillTypeID: typeID,
          },
        ],
      };
    case 10004:
      return {
        effectID: effectID,
        effectName: "privateEffect_Nanite_Armor_Fuled_Repair_Bonus",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "otherID",
            func: "ItemModifier",
            modifiedAttributeID: 84, //Armor Hitpoints Repaired
            modifyingAttributeID: 0, //Artificially created value. cuz I couldn't find repair bonus from naite
            operation: "preMul",
            modifyingAttributeValue: 3,
            isStackException: true,
          },
        ],
      };
    case 10005:
      return {
        effectID: effectID,
        effectName: "privateEffect_Skill_Drone_Skillbook_Basic_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "LocationRequiredSkillModifier",
            modifiedAttributeID: 64, //Damage Modifier
            modifyingAttributeID: 292, //Damage Multiplier Bonus
            operation: "postPercent",
            skillTypeID: typeID,
            isStackException: true,
          },
        ],
      };
    case 10006:
      return {
        effectID: effectID,
        effectName: "privateEffect_Missile_charge_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 114, //EM damage
            modifyingAttributeID: 212, //Missile Damage Bonus
            operation: "postMul",
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 116, //Explosive damage
            modifyingAttributeID: 212, //Missile Damage Bonus
            operation: "postMul",
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 117, //Kinetic damage
            modifyingAttributeID: 212, //Missile Damage Bonus
            operation: "postMul",
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 118, //Thermal damage
            modifyingAttributeID: 212, //Missile Damage Bonus
            operation: "postMul",
          },
        ],
      };
    case 10007:
      return {
        effectID: effectID,
        effectName: "privateEffect_Subsystem_slotModifier_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 14, //High Slots
            modifyingAttributeID: 1374, //High Slot Modifier
            operation: "modAdd",
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 13, //Medium Slots
            modifyingAttributeID: 1375, //Medium Slot Modifier
            operation: "modAdd",
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 12, //Low Slots
            modifyingAttributeID: 1376, //Low Slot Modifier
            operation: "modAdd",
          },
        ],
      };
    case 10008:
      return {
        effectID: effectID,
        effectName: "privateEffect_Subsystem_HardPoint_Modifier_missing_efft",
        effectCategory: "passive",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 102, //Turret Hardpoints
            modifyingAttributeID: 1368, //Turret Hardpoint Modifier
            operation: "modAdd",
          },
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 101, //Launcher Hardpoints
            modifyingAttributeID: 1369, //Launcher Hardpoint Modifier
            operation: "modAdd",
          },
        ],
      };
    case 10009:
      return {
        effectID: effectID,
        effectName: "privateEffect_StasisWebifier_missing_efft",
        effectCategory: "target",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 37, //Maximum Velocity
            modifyingAttributeID: 20, //Maximum Velocity Bonus
            operation: "postPercent",
          },
        ],
      };

    case 10010:
      return {
        effectID: effectID,
        effectName: "privateEffect_TargetPainter_missing_efft",
        effectCategory: "target",
        modifierInfo: [
          {
            domain: "shipID",
            func: "ItemModifier",
            modifiedAttributeID: 552, //Signature Radius
            modifyingAttributeID: 554, //Signature Radius Modifier
            operation: "postPercent",
          },
        ],
      };

    case 10011:
      return {
        effectID: effectID,
        effectName: "privateEffect_TrackingDisruptor_missing_efft",
        effectCategory: "target",
        modifierInfo: [
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 160, // Turret Tracking
            modifyingAttributeID: 767, //Tracking Speed Bonus
            operation: "postPercent",
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 54, //Optimal Range
            modifyingAttributeID: 351, //Optimal Range Bonus
            operation: "postPercent",
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 158, //Accuracy falloff
            modifyingAttributeID: 349, //Falloff Bonus
            operation: "postPercent",
          },
        ],
      };
    case 10012:
      return {
        effectID: effectID,
        effectName: "privateEffect_GuidanceDisruptor_missing_efft",
        effectCategory: "target",
        modifierInfo: [
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 653, //Explosion Velocity
            modifyingAttributeID: 847, //Explosion Velocity Bonus
            operation: "postPercent",
          },
          {
            domain: "itemID",
            func: "ItemModifier",
            modifiedAttributeID: 654, //Explosion Radius
            modifyingAttributeID: 848, //Explosion Radius Bonus
            operation: "postPercent",
          },
        ],
      };

    default:
      return {};
  }
};

function convertEffectCategory(effectCategory) {
  const resultTableFrom_testEffectCategory_function_last_update_2022_02 = [
    "activation=1",
    "target=2",
    "passive=0",
    "online=4",
    "overload=5",
    "dungeon=6",
    "system=7",
    "area=3",
    "passive=7",
  ];

  switch (effectCategory) {
    case 0:
      return "passive";
    case 1:
      return "activation";
    case 2:
      return "target";
    case 3:
      return "area";
    case 4:
      return "online";
    case 5:
      return "overload";
    case 6:
      return "dungeon";
    case 7:
      return "system";
    default:
      console.error("No matching effectCategory Found. @buildTypeDogmaEffects");
  }
}

function convertModOperation(operation) {
  const resultTableFrom_testEffectOperation_function_last_update_2022_02 = [
    "modAdd=2",
    "postMul=4",
    "specialSkillOp=9",
    "preMul=0",
    "postPercent=6",
    "preAssignment=-1",
    "modSub=3",
    "postAssignment=7",
    "undefined=undefined",
    "postDiv=5",
  ];

  switch (operation) {
    case -1:
      return "preAssignment";
    case 0:
      return "preMul";
    case 2:
      return "modAdd";
    case 3:
      return "modSub";
    case 4:
      return "postMul";
    case 5:
      return "postDiv";
    case 6:
      return "postPercent";
    case 7:
      return "postAssignment";
    case 9:
      return "specialSkillOp";
    case undefined: // this option is for warp scramblers. warp scrambler's modInfo might has operation = undefiend. see effectID = 5928 in dogmaEffects.yaml
      return undefined;
    default:
      console.error(
        "No matching modOperation Found. @buildTypeDogmaEffects",
        operation
      );
  }
}
