export default class Fit {
  static validateChargeSlot = function (slot) {
    if (!slot || !slot.item || !slot.charge) return false;

    const item = slot.item;
    const charge = slot.charge;

    // Charge size[attributeID] = 128
    const itemChargeSize = Fit.#common_findAttributeByID(item, 128);
    const chargeChargeSize = Fit.#common_findAttributeByID(charge, 128);
    if (
      !!itemChargeSize &&
      !!chargeChargeSize &&
      itemChargeSize.value !== chargeChargeSize.value
    )
      return false;

    // Used with (Charge Group)[attributeID] = 604, 605, 606, 609, 610
    const loadableGroupIDs = [604, 605, 606, 609, 610]
      .map((ID) => {
        const attr = Fit.#common_findAttributeByID(item, ID);
        if (!attr) return undefined;
        else return attr.value;
      })
      .filter((value) => value);
    if (loadableGroupIDs.length === 0) return false;

    if (!loadableGroupIDs.includes(charge.groupID)) return false;

    const itemCapacity = item.capacity;
    const chargeVolume = charge.volume;
    const chargePerCycle = Fit.#common_findAttributeByID(item, 56)?.value; //attributeID: 56, attributeName: "Charges Per Cycle"
    const chargeVolumePerAct = !!chargePerCycle
      ? chargeVolume * chargePerCycle
      : 0;
    const activationLimit = Math.floor(itemCapacity / chargeVolumePerAct);
    if (activationLimit <= 0) return false;

    return true;
  };

  static mapSlots_CONFIG = {
    isIterate: {
      ship: false,
      miscSlots: false,
      highSlots: false,
      midSlots: false,
      lowSlots: false,
      rigSlots: false,
      droneSlots: false,
    },
  };
  static mapSlots = function (fit, callback, partialConfig) {
    const config = {
      isIterate: {
        ...Fit.mapSlots_CONFIG.isIterate,
        ...partialConfig.isIterate,
      },
    };

    return [
      "ship",
      "miscSlots",
      "highSlots",
      "midSlots",
      "lowSlots",
      "rigSlots",
      "droneSlots",
    ].reduce((acc, slotName) => {
      if (config.isIterate[slotName] === true)
        return acc.concat(Fit.#mapSlots_slots(fit[slotName], callback));
      else return acc;
    }, []);
  };
  static #mapSlots_slots = function (slots, callback) {
    if (!slots) return [];
    return slots.map((slot) => {
      return callback(slot);
    });
  };

  static apply = function (fit) {
    const fitWithDomainID = Fit.#giveDomainID(fit);

    const board = Fit.#createBoard(fitWithDomainID);
    const staticBoard = Fit.#applyBoard_createStaticBoard(board);

    return Fit.#applyBoard(fitWithDomainID, staticBoard);
  };

  static #applyBoard = function (fit, staticBoard) {
    const ship = Fit.#applyBoard_type(fit.ship, staticBoard);
    const miscSlots = Fit.#applyBoard_slots(fit.miscSlots, staticBoard);
    const highSlots = Fit.#applyBoard_slots(fit.highSlots, staticBoard);
    const midSlots = Fit.#applyBoard_slots(fit.midSlots, staticBoard);
    const lowSlots = Fit.#applyBoard_slots(fit.lowSlots, staticBoard);
    const rigSlots = Fit.#applyBoard_slots(fit.rigSlots, staticBoard);
    const droneSlots = Fit.#applyBoard_slots(fit.droneSlots, staticBoard);

    return {
      ship,
      miscSlots,
      lowSlots,
      midSlots,
      highSlots,
      rigSlots,
      droneSlots,
    };
  };
  static #applyBoard_createStaticBoard = function (board) {
    const staticBoard = {};
    const passiveBoard = Fit.#applyBoard_createPassiveBoard(board);

    board.forEach((mod) => {
      if (!staticBoard[mod.modifiedAttributeID])
        staticBoard[mod.modifiedAttributeID] = [];
      if (mod.isStatic === true) staticBoard[mod.modifiedAttributeID].push(mod);
      else {
        const appliedMod = Fit.#applyBoard_mod(mod, passiveBoard);
        appliedMod["isStatic"] = true;
        staticBoard[mod.modifiedAttributeID].push(appliedMod);
      }
    });

    return staticBoard;
  };
  static #applyBoard_createPassiveBoard = function (board) {
    const passiveBoard = {};

    board.forEach((mod) => {
      if (!passiveBoard[mod.modifiedAttributeID])
        passiveBoard[mod.modifiedAttributeID] = [];
      passiveBoard[mod.modifiedAttributeID].push(mod);
    });

    return passiveBoard;
  };
  static #applyBoard_slots = function (slots, passiveBoard) {
    return slots.map((slot) => {
      const item = slot.item;
      const charge = slot.charge;
      return {
        ...slot,
        item: Fit.#applyBoard_type(item, passiveBoard),
        charge: Fit.#applyBoard_type(charge, passiveBoard),
      };
    });
  };
  static #applyBoard_type = function (type, passiveBoard) {
    if (!type || !type.typeAttributesStats) return type;

    const typeAttributesStats = type.typeAttributesStats.map((attribute) => {
      return Fit.#applyBoard_attribute(type, attribute, passiveBoard);
    });

    return { ...type, typeAttributesStats: typeAttributesStats };
  };
  static #applyBoard_attribute = function (type, attr, passiveBoard) {
    const mods = passiveBoard[attr.attributeID];
    if (!mods || mods.length === 0) return attr;

    let value = attr.value;
    let penCount = 0;
    if (!!attr.debug || !!attr.falseDebug) console.log("ERROR", "debugCorrupt");
    const debug = [];
    const falseDebug = [];

    Fit.#applyBoard_sortMods(
      mods.map((baseMod) => Fit.#applyBoard_mod(baseMod, passiveBoard))
    ).forEach((mod) => {
      if (Fit.#applyBoard_modIsTypeApplicable(type, mod)) {
        const baseValue = value;
        value = Fit.#common_operation(
          value,
          mod.modifyingAttributeValue,
          mod.operation,
          penCount
        );
        debug.push({
          ...mod,
          penCount,
          values: {
            baseValue: baseValue,
            appliedValue: value,
            penalizedModifyingAttributeValue:
              Fit.#common_penalizedModifyingValue(
                mod.modifyingAttributeValue,
                mod.operation,
                penCount
              ),
          },
        });
        if (mod.isPenalized === true) penCount++;
      } else falseDebug.push(mod);
    });

    return { ...attr, value: value, debug, falseDebug };
  };
  static #applyBoard_mod = function (mod, passiveBoard) {
    if (
      mod.modifyingAttributeID === mod.modifiedAttributeID ||
      mod.isStatic === true
    )
      return mod;

    const mods = passiveBoard[mod.modifyingAttributeID];
    if (!mods || mods.length === 0) return mod;

    let value = mod.modifyingAttributeValue;
    let penCount = 0;
    if (!!mod.debug || !!mod.falseDebug) console.log("ERROR", "debugCorrupt");
    const debug = [];
    const falseDebug = [];

    Fit.#applyBoard_sortMods(
      mods.map((baseMod) => Fit.#applyBoard_mod(baseMod, passiveBoard))
    ).forEach((appliedMod) => {
      if (Fit.#applyBoard_modIsModApplicable(mod, appliedMod)) {
        const baseValue = value;
        value = Fit.#common_operation(
          value,
          appliedMod.modifyingAttributeValue,
          appliedMod.operation,
          penCount
        );

        debug.push({
          ...appliedMod,
          penCount,
          values: {
            baseValue: baseValue,
            appliedValue: value,
            penalizedModifyingAttributeValue:
              Fit.#common_penalizedModifyingValue(
                appliedMod.modifyingAttributeValue,
                appliedMod.operation,
                penCount
              ),
          },
        });
        if (appliedMod.isPenalized === true) penCount++;
      } else falseDebug.push(appliedMod);
    });

    return { ...mod, modifyingAttributeValue: value, debug, falseDebug };
  };
  static #applyBoard_sortMods = function (mods) {
    const sampleMod = mods[0];

    let compareFunc = () => true;
    const highIsGood = sampleMod.modifiedAttributeHighIsGood;
    if (highIsGood === true)
      compareFunc = (a, b) => {
        if (a.operation === b.operation)
          return b.modifyingAttributeValue - a.modifyingAttributeValue;

        if (a.operation === "prePercent" || a.operation === "postPercent")
          return b.modifyingAttributeValue - a.modifyingAttributeValue - 1;

        if (b.operation === "prePercent" || b.operation === "postPercent")
          return 1 + b.modifyingAttributeValue - a.modifyingAttributeValue;
      };
    else if (highIsGood === false)
      compareFunc = (a, b) => {
        if (a.operation === b.operation)
          return a.modifyingAttributeValue - b.modifyingAttributeValue;

        if (a.operation === "prePercent" || a.operation === "postPercent")
          return 1 + a.modifyingAttributeValue - b.modifyingAttributeValue;

        if (b.operation === "prePercent" || b.operation === "postPercent")
          return a.modifyingAttributeValue - b.modifyingAttributeValue - 1;
      };
    const modStackables = [];
    const modNotStackables = [];
    mods.forEach((mod) => {
      if (
        mod.operation === "modAdd" ||
        mod.operation === "modSub" ||
        mod.operation === "postDiv" ||
        mod.isStackException === true
      )
        modStackables.push(mod);
      else modNotStackables.push(mod);
    });

    const isModstackable = sampleMod.modifiedAttributeStackable;

    if (isModstackable === false) {
      modNotStackables.sort(compareFunc);
      modNotStackables.forEach((mod, index, array) => {
        array[index] = { ...mod, isPenalized: true };
      });
    }
    return modStackables.concat(modNotStackables);
  };
  static #applyBoard_modIsModApplicable = function (targetMod, applyMod) {
    if (!Fit.#applyBoard_modIsStateApplicable(applyMod)) {
      /*  if (
        !(
          applyMod.typeState === "activation" &&
          applyMod.effectCategory === "overload"
        )
      )
        console.log(
          "STATE",
          `${applyMod.typeState} <-/- ${applyMod.effectCategory}`,
          targetMod,
          "<-",
          applyMod
        ); */ //TESTETS
      return false;
    }
    switch (applyMod.domain) {
      case "itemID":
        switch (applyMod.func) {
          case "ItemModifier":
            return targetMod.domainID === applyMod.domainID;
          /* default:
            return false; */
        }
      case "shipID":
        switch (applyMod.func) {
          case "ItemModifier":
            return targetMod.domainID === "ship";
          case "LocationGroupModifier":
            return targetMod.typeGroupID === applyMod.groupID;
          case "LocationRequiredSkillModifier":
            return targetMod?.typeSkills?.includes(applyMod.skillTypeID);
          /* default:
            return false; */
        }
      case "charID":
        switch (applyMod.func) {
          case "OwnerRequiredSkillModifier":
            return targetMod?.typeSkills?.includes(applyMod.skillTypeID);
        }
      /*    case "structureID":
        return false; */
      default:
        console.error("MOD_APPLICABLE_UNKNOWN", targetMod, "<-", applyMod);
        return false;
    }
  };
  static #applyBoard_modIsTypeApplicable = function (type, mod) {
    if (!Fit.#applyBoard_modIsStateApplicable(mod)) {
      /* if (
        !(mod.typeState === "activation" && mod.effectCategory === "overload")
      )
        console.log(
          "STATE",
          `${mod.typeState} <-/- ${mod.effectCategory}`,
          type,
          "<-",
          mod
        ); */ //TESTETS
      return false;
    }
    if (type.domainID === undefined) console.log("domainID missing", type);
    switch (mod.domain) {
      case "itemID":
        switch (mod.func) {
          case "ItemModifier":
            return type.domainID === mod.domainID;
          /* default:
            return false; */
        }
      case "shipID":
        switch (mod.func) {
          case "ItemModifier":
            return type.domainID === "ship";
          case "LocationGroupModifier":
            return type.groupID === mod.groupID;
          case "LocationRequiredSkillModifier":
            return (
              !!type.typeSkills && type.typeSkills.includes(mod.skillTypeID)
            );
          /* default:
            return false; */
        }
      case "charID":
        switch (mod.func) {
          case "OwnerRequiredSkillModifier":
            return (
              !!type.typeSkills && type.typeSkills.includes(mod.skillTypeID)
            );
          case "ItemModifier":
            return true;
          /* default:
            return false; */
        }
      case "otherID":
        switch (mod.func) {
          case "ItemModifier":
            return (
              type.domainID.split(".")[0] === mod.domainID.split(".")[0] &&
              type.domainID.split(".")[1] === mod.domainID.split(".")[1]
            );
          /* default:
            return false; */
        }
      case "structureID":
        return false;
      default:
        console.error("TYPE_APPLICABLE_UNKNOWN", type, "<-", mod); //TESTETS
        return false;
    }
  };
  static #applyBoard_modIsStateApplicable = function (mod) {
    switch (mod.typeState) {
      case "overload":
        return true;
      case "activation":
        switch (mod.effectCategory) {
          case "overload":
            return false;
          default:
            return true;
        }
      case "passive":
        switch (mod.effectCategory) {
          case "overload":
          case "target":
          case "activation":
            return false;
          default:
            return true;
        }
      case "offline":
        switch (mod.effectCategory) {
          default:
            return false;
        }
      default:
        return false;
    }
  };

  static #giveDomainID = function (fit) {
    const skills = Fit.#giveDomainID_skills(fit.skills);
    const ship = { ...fit.ship, domainID: "ship" };
    const miscSlots = Fit.#giveDomainID_slots(fit.miscSlots, "miscSlots");
    const lowSlots = Fit.#giveDomainID_slots(fit.lowSlots, "lowSlots");
    const midSlots = Fit.#giveDomainID_slots(fit.midSlots, "midSlots");
    const highSlots = Fit.#giveDomainID_slots(fit.highSlots, "highSlots");
    const rigSlots = Fit.#giveDomainID_slots(fit.rigSlots, "rigSlots");
    const droneSlots = Fit.#giveDomainID_slots(fit.droneSlots, "droneSlots");

    return {
      skills,
      ship,
      miscSlots,
      lowSlots,
      midSlots,
      highSlots,
      rigSlots,
      droneSlots,
    };
  };
  static #giveDomainID_slots = function (slots, slotName) {
    if (!slots || slots.constructor !== Array) return undefined;

    return slots.map((slot, index) => {
      const item = !!slot.item.typeID
        ? { ...slot.item, domainID: `${slotName}.${index}.item` }
        : false;
      const charge = !!slot.charge.typeID
        ? { ...slot.charge, domainID: `${slotName}.${index}.charge` }
        : false;
      return { item, charge };
    });
  };
  static #giveDomainID_skills = function (skillsBoard) {
    if (!skillsBoard || skillsBoard.constructor !== Array) {
      const dogmaSkills = skillsBoard;
      return dogmaSkills;
    } else if (skillsBoard[0].domainID !== undefined) {
      const skillsStaticBoardPlane = skillsBoard;
      return skillsStaticBoardPlane;
    }
    return skillsBoard.map((skill) => ({
      ...skill,
      domainID: `skill:${skill.typeName}`,
    }));
  };

  static #createBoard = function (fit) {
    // skills will be two type: skills(Object) or pre made skills_modifiers(Array)
    const skills = Fit.#createBoard_skills(fit.skills);
    const ship = Fit.#createBoard_singleType(fit.ship, true);
    const miscSlots = Fit.#createBoard_slots(fit.miscSlots, true);
    const lowSlots = Fit.#createBoard_slots(fit.lowSlots);
    const midSlots = Fit.#createBoard_slots(fit.midSlots);
    const highSlots = Fit.#createBoard_slots(fit.highSlots);
    const rigSlots = Fit.#createBoard_slots(fit.rigSlots);
    const droneSlots = Fit.#createBoard_slots(fit.droneSlots);

    return [
      ...skills,
      ...ship,
      ...miscSlots,
      ...lowSlots,
      ...midSlots,
      ...highSlots,
      ...rigSlots,
      ...droneSlots,
    ];
  };
  static #createBoard_slots = function (slots, isStackException = false) {
    if (!slots || slots.constructor !== Array) return [];

    const mods = [];
    slots.forEach((slot) => {
      const itemMods = Fit.#createBoard_singleType(slot.item, isStackException);
      const chargeMods = Fit.#createBoard_singleType(slot.charge, true);
      if (!!itemMods) itemMods.forEach((mod) => mods.push(mod));
      if (!!chargeMods) chargeMods.forEach((mod) => mods.push(mod));
    });

    return mods;
  };
  static extractSkillsStaticPlaneBoard(dogmaSkills) {
    if (dogmaSkills.constructor !== Object) return [];

    const skillBoard = Fit.#createBoard_skills(dogmaSkills);
    const skillsStaticBoardMax = Fit.#applyBoard_createStaticBoard(skillBoard);
    const skillsStaticBoardMed = Object.values(skillsStaticBoardMax)
      .reduce((acc, mods) => acc.concat(mods), [])
      .map((mod) => ({ ...mod, debug: undefined, falseDebug: undefined }));

    return skillsStaticBoardMed;
  }
  static #createBoard_skills = function (dogmaSkills) {
    if (dogmaSkills.constructor === Array) {
      const skillsBoard = dogmaSkills;
      return skillsBoard;
    }

    return Object.values(dogmaSkills).reduce((acc, dogmaSkill) => {
      const mods = Fit.#createBoard_singleType(dogmaSkill, true);
      const board = mods.map((mod) => ({
        ...mod,
        domainID: `skill:${mod.typeName}`,
      }));
      return acc.concat(board);
    }, []);
  };
  static #createBoard_singleType = function (type, isStackException = false) {
    if (!type) return [];

    // effectID: 132,effectName: "skillEffect",
    const invalidEffectIDs = [132];
    // ExtrovertEffect is effect have modifierInfo
    // Existence of modifierInfo ensures effect affect anonymous attribute with given value
    const extrovertEffects = !!type.typeEffectsStats
      ? type.typeEffectsStats.filter(
          (effect) =>
            effect.modifierInfo !== undefined &&
            !invalidEffectIDs.includes(effect.effectID)
        )
      : [];

    const mods = [];
    extrovertEffects.forEach((effect) => {
      effect.modifierInfo.forEach((mod) => {
        const modifyingAttribute = Fit.#common_findAttributeByID(
          type,
          mod.modifyingAttributeID
        );
        const modifyingAttributeValue = !!mod.modifyingAttributeValue
          ? mod.modifyingAttributeValue
          : modifyingAttribute?.value;

        mods.push({
          domainID: type.domainID,
          typeName: type.typeName,
          ...mod,
          effectName: effect.effectName,
          effectCategory: effect.effectCategory,
          modifyingAttributeValue: modifyingAttributeValue,
          typeID: type.typeID,
          typeState: type.iconID !== 33 ? type.typeState : "passive",
          typeGroupID: type.groupID,
          typeSkills: type.typeSkills,
          isStackException:
            mod.isStackException !== undefined
              ? mod.isStackException
              : isStackException,
        });
      });
    });

    return mods;
  };
  static getCurrentState = function (type) {
    return Fit.#createBoard_setState(type);
  };
  static getInitialState = function (type) {
    if (!type || !type.typeEffectsStats) return undefined;
    if (type.iconID === 33) return "passive"; // if type is skill

    return type.typeEffectsStats.reduce((acc, efft) => {
      if (
        (efft.effectCategory === "activation" && efft.effectID !== 16) ||
        efft.effectCategory === "target"
      )
        //effectCategory: "activation", effectID: 16, effectName: "online"
        return "activation";

      return acc;
    }, "passive");
  };
  static #createBoard_setState = function (type) {
    if (!type && type !== 0) return undefined;
    if (!type.typeEffectsStats || type.iconID === 33) return "passive"; // if type is skill
    const initialState = type.typeEffectsStats.reduce((acc, efft) => {
      if (
        (efft.effectCategory === "activation" && efft.effectID !== 16) ||
        efft.effectCategory === "target"
      )
        //effectCategory: "activation", effectID: 16, effectName: "online"
        return "activation";

      return acc;
    }, "passive");
    const currentState = type.typeState;

    if (currentState === undefined) return initialState;
    if (initialState === "passive" && currentState === "activation")
      return "passive";
    return currentState;
  };

  static #common_findAttributeByID = function (type, attributeID) {
    if (!type || !type.typeAttributesStats) return undefined;
    if (type.typeAttributesStats.constructor !== Array) return undefined;

    const attribute = type.typeAttributesStats.find(
      (entry) => entry.attributeID === attributeID
    );

    return attribute;
  };
  static #common_operation = function (
    baseValue,
    applyValue,
    operation,
    penCount
  ) {
    //TODO: findout why does eve developers made shit like this typeID=31760 effect is weird
    if (applyValue === undefined) return baseValue;

    let value = baseValue;
    switch (operation) {
      case "preMul":
      case "postMul":
        value = Fit.#oepration_mul(baseValue, applyValue, penCount);
        break;
      case "prePercent":
      case "postPercent":
        value = Fit.#oepration_per(baseValue, applyValue, penCount);
        break;
      case "modAdd":
        value = Fit.#operation_add(baseValue, applyValue);
        break;
      case "modSub":
        value = Fit.#operation_sub(baseValue, applyValue);
        break;
      case "postDiv":
        value = Fit.#operation_div(baseValue, applyValue);
        break;
      case "postAssignment":
        return applyValue;
      default:
        break;
    }
    return value;
  };
  static #oepration_mul = function (baseValue, mulValue, penCount = 0) {
    return baseValue * ((mulValue - 1) * Fit.#common_penaltyMul(penCount) + 1);
  };
  static #oepration_per = function (baseValue, perValue, penCount = 0) {
    return (
      baseValue * ((perValue / 100) * Fit.#common_penaltyMul(penCount) + 1)
    );
  };
  static #operation_add = function (baseValue, addValue) {
    return baseValue + addValue;
  };
  static #operation_sub = function (baseValue, subValue) {
    return baseValue - subValue;
  };
  static #operation_div = function (baseValue, divValue) {
    return baseValue / divValue;
  };
  static #common_penaltyMul = function (penCount) {
    return Math.pow(Math.E, -0.140274 * penCount * penCount);
  };
  static #common_penalizedModifyingValue = function (
    applyValue,
    operation,
    penCount
  ) {
    switch (operation) {
      case "preMul":
      case "postMul":
        return 1 + Fit.#common_penaltyMul(penCount) * (applyValue - 1);
      case "prePercent":
      case "postPercent":
        return Fit.#common_penaltyMul(penCount) * applyValue;
      case "modAdd":
      case "modSub":
        return applyValue;
      case "postDiv":
        return applyValue / Fit.#common_penaltyMul(penCount);
      default:
        return applyValue;
    }
  };
}
