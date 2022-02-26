import { findAttributebyID } from "../../../../services/dataManipulation/findAttributes";
import Fit from "../../../../fitter/src/Fit";
import Stat from "./Stat";

const capPrioritySet = {
  alwaysOn: 0,
  mostTrivial: 10,
  turretDamage: 1,
  shieldHarden: 2,
  shieldBoost: 2,
  shieldBoostAncillaryFueled: 2,
  shieldBoostAncillary: 5,
  armorHardener: 2,
  armorBoost: 2,
  armorBoostAncillaryFueled: 3,
  armorBoostAncillary: 5,
  damageControl: 0,
  structureBoost: 1,
  capacitorNeutralizer: 3,
  capacitorTransmitter: 4,
};

export default class Summary extends Stat {
  static updateSummaries = (slots, location) => {
    // Make blank slots. used place summary to make summaries
    const blankSlots = {
      highSlots: Array.from(slots.highSlots, () => ({})),
      midSlots: Array.from(slots.midSlots, () => ({})),
      lowSlots: Array.from(slots.lowSlots, () => ({})),
      droneSlots: Array.from(slots.droneSlots, () => ({})),
    };

    const fit = Fit.apply(slots);
    const summaries = Summary.addSummaries(fit, blankSlots, location);
    summaries.utils = {};
    summaries.utils.slots = slots;
    summaries.utils.fit = fit;
    summaries.skills = undefined;

    return summaries;
  };

  static getSummaries = (slots, location) => {
    const _slots = Summary.addSummaries_duplicateSlots(slots);

    // Assign rootID to each of slots
    slots.ship.rootID = location.rootID;
    Fit.mapSlots(
      _slots,
      (slot) => {
        if (!!slot.item) slot.item.rootID = location.rootID;
        if (!!slot.charge) slot.charge.rootID = location.rootID;
      },
      {
        isIterate: {
          highSlots: true,
          midSlots: true,
          lowSlots: true,
          droneSlots: true,
        },
      }
    );
    // Make blank slots. used place summary to make summaries
    const blankSlots = {
      highSlots: Array.from(slots.highSlots, () => ({})),
      midSlots: Array.from(slots.midSlots, () => ({})),
      lowSlots: Array.from(slots.lowSlots, () => ({})),
      // Create drone number of blank object array
      droneSlots: slots.droneSlots.reduce((acc, droneSlot) => {
        if (!droneSlot.item) return acc;
        //prettier-ignore
        return [...acc, ...Array.from(new Array(droneSlot.item.typeCount).fill(false),() => ({}))];
      }, []),
    };

    const fit = Fit.apply(_slots);
    const summaries = Summary.addSummaries(fit, blankSlots, location);
    summaries.utils = {};
    summaries.utils.slots = _slots;
    summaries.utils.fit = fit;
    summaries.skills = undefined;
    return summaries;
  };
  static getSummarizedSlots = (slots, location) => {
    const _slots = Summary.addSummaries_duplicateSlots(slots);

    const fit = Fit.apply(_slots);
    const summarizedSlots = Summary.addSummaries(fit, _slots, location);

    return summarizedSlots;
  };

  static addSummaries = (fit, targetSlots, location) => {
    if (!!fit) targetSlots["summary"] = Summary.getSummary_ship(fit, location);

    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.item) return false;
        const summary = Summary.getSummary_module(slot);
        summary["root"] = targetSlots;
        summary["rootID"] = location.rootID;
        const _slot = !!summary && SimFit.toPath(targetSlots, summary.path);
        if (!!_slot) _slot["summary"] = summary;
      },
      {
        isIterate: {
          highSlots: true,
          midSlots: true,
          lowSlots: true,
        },
      }
    );

    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.item) return false;

        const summary = Summary.#getSummaries_drones(slot);
        summary["root"] = targetSlots;
        const _slot = !!summary && SimFit.toPath(targetSlots, summary.path);
        if (!!_slot) _slot["summary"] = summary;
      },
      {
        isIterate: {
          droneSlots: true,
        },
      }
    );
    return targetSlots;
  };
  static addSummaries_duplicateSlots = (slots) => {
    const _droneSlots = Summary.addSummaries_duplicateDroneSlots(slots);
    const _slots = JSON.parse(JSON.stringify(slots));
    _slots.droneSlots = _droneSlots;

    return _slots;
  };
  // duplicate droneslots to number of typecount
  static addSummaries_duplicateDroneSlots = (slots) => {
    let slotCount = 0;
    return slots.droneSlots.reduce((acc, slot) => {
      const slotString = JSON.stringify(slot);
      const _slots = new Array(slot.item.typeCount || 1).fill(false).map(() => {
        const _slot = JSON.parse(slotString);
        if (!!_slot.item) {
          _slot.typeCount = undefined;
          _slot.item.domainID = `droneSlots.${slotCount}.item`;
        }
        slotCount++;

        return _slot;
      });

      return acc.concat(_slots);
    }, []);
  };

  static getResistanceTable = (summaries, slots) => {
    const _slots = JSON.parse(JSON.stringify(slots));

    const resistanceSlots = Fit.mapSlots(
      summaries,
      (slot) => {
        if (slot?.summary?.operation === "resistance") return slot;
        else return false;
      },
      {
        isIterate: {
          midSlots: true,
          lowSlots: true,
        },
      }
    ).filter((slot) => !!slot);

    if (resistanceSlots.length === 0) return {};
    const records = Summary.getResistanceTable_getRecords(resistanceSlots, "");

    const resistanceTable = {};
    records.forEach((record) => {
      Summary.getResistanceTable_applyState(_slots, record);

      const fit = Fit.apply(_slots);
      resistanceTable[record] = this.defense_resistance(fit);
    });

    return resistanceTable;
  };
  static getResistanceTable_getRecords(resistanceSlots, record) {
    if (resistanceSlots.length === 0) return [record.slice(0, -1)];

    const activeRecord = Summary.getResistanceTable_getRecords(
      resistanceSlots.slice(1),
      record.concat(`${resistanceSlots[0].summary.path}.activation|`)
    );

    const passiveRecord = Summary.getResistanceTable_getRecords(
      resistanceSlots.slice(1),
      record.concat(`${resistanceSlots[0].summary.path}.passive|`)
    );
    return [...activeRecord, ...passiveRecord];
  }
  static getResistanceTable_applyState(slots, record) {
    record.split("|").forEach((recordFrag) => {
      const [slotType, slotNum, state] = recordFrag.split(".");
      slots[slotType][slotNum].item.typeState = state;
    });
  }

  static getSummary_module = (slot) => {
    if (!slot?.item?.typeEffectsStats) return false;

    const item = slot.item;
    const charge = slot.charge;

    const structureHP = findAttributebyID(item, 9); //attributeID: 9, attributeName: "Structure Hitpoints"
    const heatDamage = findAttributebyID(item, 1211); // attributeID: 1211, attributeName: "Heat Damage"

    const moduleSummary = {
      load: {
        structure: { HP: structureHP },
      },
      capacity: {
        structure: { HP: structureHP },
        misc: { heatDamage: heatDamage },
      },
    };

    const activationDataSet = Summary.createActivationDataSet(slot);
    const path = item.domainID.split(".").slice(0, 2).join("."); //eg)highSlots.1

    const effectSummary = item.typeEffectsStats
      .map((efft) => {
        let summary = {};
        let operation = false;
        switch (efft.effectID) {
          case 101: // effectID: 101, effectName: "useMissiles"
          case 34: // effectID: 34, effectName: "projectileFired"
          case 10: // effectID: 10, effectName: "targetAttack"
          case 6995: // effectID: 6995, effectName: "targetDisintegratorAttack"
            summary = Summary.getSummary_damage(item, charge);
            if (!summary.damagePerAct.alpha) return false;
            operation = "damage";
            break;
          case 4: // effectID: 4, effectName: "shieldBoosting"
          case 26: // effectID: 26, effectName: "structureRepair"
          case 4936: // effectID: 4936, effectName: "fueledShieldBoosting"
          case 27: // effectID: 27, effectName: "armorRepair"
          case 5275: // effectID: 5275, effectName: "fueledArmorRepair"
            summary = Summary.getSummary_defense(item, charge);
            operation = "defense";
            break;
          case 48: //effectID: 48, effectName: "powerBooster"
          case 6187: //effectID: 6187, effectName: "energyNeutralizerFalloff"
          case 6197: //effectID: 6197, effectName: "energyNosferatuFalloff"
          case 6148: // effectID: 6184, effectName: "shipModuleRemoteCapacitorTransmitter"
            summary = Summary.getSummary_capacitor(item, charge);
            operation = "capacitor";
            break;
          case 5230: // effectID: 5230, effectName: "modifyActiveShieldResonancePostPercent"
          case 4928: // effectID: 4928, effectName: "adaptiveArmorHardener" //TODO: reactive armor bonus should be calculated
          case 5231: // effectID: 5231, effectName: "modifyActiveArmorResonancePostPercent"
          case 7012: // effectID: 7012, effectName: "moduleBonusAssaultDamageControl"
            operation = "resistance";
            break;
          case 6730: // effectID: 6730, effectName: ""moduleBonusMicrowarpdrive""
          case 6731: // effectID: 6731, effectName: 'moduleBonusAfterburner'
            operation = "misc";
            break;
          case 6426: //effectID: 6426, effectName: "remoteWebifierFalloff"
          case 6425: // effectID: 6425, effectName: 'remoteTargetPaintFalloff'
          case 6424: // effectID: 6424, effectName: 'shipModuleTrackingDisruptor'
          case 6423: // effectID: 6423, effectName: 'shipModuleGuidanceDisruptor'
            operation = "target";
            break;
          default:
            return false;
        }

        return {
          ...summary,
          ...activationDataSet,
          operation,
          itemID: item.typeID,
          chargeID: charge.typeID,
          description: `${item.typeName},${charge.typeName}`,
        };
      })
      .filter((summary) => !!summary);

    if (effectSummary.length > 1)
      console.error(
        "ERR: more than one summary produced in single module",
        slot
      );
    else return { ...moduleSummary, ...effectSummary[0], path };
  };
  static #getSummaries_drones = (slot) => {
    if (!slot?.item?.typeEffectsStats) return false;
    const item = slot.item;
    const isSentry = item.marketGroupID === 911; // marketGroupID: 911 "marketGroupName": "Sentry Drones"

    // These functions from Stat class is targeted for ship. modified to fit in drone in this case
    const defense = this.defense_resistance({ ship: item });
    const capacitor = this.capacitor_getChargeInfo({ ship: item });

    const misc = this.miscellaneous({ ship: item });
    const orbitVelocity = findAttributebyID(item, 508); // attributeID: 508, attributeName: "Orbit Velocity"
    const orbitRange = findAttributebyID(item, 416); //attributeID: 416, attributeName: "entityFlyRange"
    const maximumVelocity = findAttributebyID(item, 37); // attributeID: 37, attributeName: "Maximum Velocity"
    misc.propulsion = {
      ...misc.propulsion,
      orbitVelocity,
      orbitRange,
      maximumVelocity,
    };
    const droneSumamry = {
      load: {
        armor: { HP: defense.armor.HP },
        shield: { HP: defense.shield.HP },
        structure: { HP: defense.structure.HP },
        capacitor: { HP: capacitor.HP },
      },
      capacity: { ...defense, ...misc, capacitor },
    };
    const path = item.domainID.split(".").slice(0, 2).join(".");
    const effectSummary = item.typeEffectsStats
      .map((efft) => {
        const activationDataSet = Summary.createActivationDataSet(slot);
        let summary = {};
        let operation = false;

        switch (efft.effectID) {
          case 101: // effectID: 101, effectName: "useMissiles"
          case 34: // effectID: 34, effectName: "projectileFired"
          case 10: // effectID: 10, effectName: "targetAttack"
          case 6995: // effectID: 6995, effectName: "targetDisintegratorAttack"
            summary = Summary.getSummary_drone(item);
            if (!summary.damagePerAct.alpha) return false;
            operation = "damage";
            break;
          default:
            return false;
        }
        return {
          ...summary,
          ...activationDataSet,
          operation,
          itemID: item.typeID,
          description: `${item.typeName}`,
        };
      })
      .filter((summary) => !!summary);

    const situation_decription =
      "Currently location is not calculated BUT! always hitted by smart bomb";

    if (effectSummary.length > 1)
      console.error(
        "ERR: more than one summary produced in single module",
        slot
      );
    else
      return {
        ...droneSumamry,
        ...effectSummary[0],
        situation_decription,
        isSentry,
        isDrone: true,
        path,
      };
  };
  static createActivationDataSet = (slot) => {
    const activationInfo = this.getActivationInfo(slot.item, slot.charge);

    return {
      activationInfo,
      activationState: {
        isActive: false,
        lastActivation: 0,
        nextActivation: 0,
        nextActivationTick: 0,
        activationLeft: activationInfo.activationLimit,
      },
    };
  };
  static getActivationPriority = (efft) => {
    let activationPriority = 10;
    switch (efft.effectID) {
      case 6197: //effectID: 6197, effectName: "energyNosferatuFalloff"
      case 48: //effectID: 48, effectName: "powerBooster"
        activationPriority = capPrioritySet.alwaysOn;
        break;
      case 101: // effectID: 101, effectName: "useMissiles"
      case 34: // effectID: 34, effectName: "projectileFired"
      case 10: // effectID: 10, effectName: "targetAttack"
      case 6995: // effectID: 6995, effectName: "targetDisintegratorAttack"
        activationPriority = capPrioritySet.turretDamage;
        break;
      case 4: // effectID: 4, effectName: "shieldBoosting"
        activationPriority = capPrioritySet.shieldBoost;
        break;
      case 26: // effectID: 26, effectName: "structureRepair"
        activationPriority = capPrioritySet.structureBoost;
        break;
      case 4936: // effectID: 4936, effectName: "fueledShieldBoosting"
        activationPriority = capPrioritySet.shieldBoostAncillaryFueled;
        break;
      case 27: // effectID: 27, effectName: "armorRepair"
        activationPriority = capPrioritySet.armorBoost;
        break;
      case 5275: // effectID: 5275, effectName: "fueledArmorRepair"
        activationPriority = capPrioritySet.armorBoostAncillaryFueled;
        break;
      case 6187: //effectID: 6187, effectName: "energyNeutralizerFalloff"
        activationPriority = capPrioritySet.capacitorNeutralizer;
        break;
      case 6148: // effectID: 6184, effectName: "shipModuleRemoteCapacitorTransmitter"
        activationPriority = capPrioritySet.capacitorTransmitter;
        break;
      case 5230: // effectID: 5230, effectName: "modifyActiveShieldResonancePostPercent"
        activationPriority = capPrioritySet.shieldHardener;
        break;
      case 4928: // effectID: 4928, effectName: "adaptiveArmorHardener"
      case 5231: // effectID: 5231, effectName: "modifyActiveArmorResonancePostPercent"
        activationPriority = capPrioritySet.armorHardener;
        break;
      case 7012: // effectID: 7012, effectName: "moduleBonusAssaultDamageControl"
        activationPriority = capPrioritySet.damageControl;
        break;
      default:
        activationPriority = capPrioritySet.mostTrivial;
    }

    return activationPriority;
  };
  static getSummary_ship = (fit, location) => {
    const defense = this.defense_resistance(fit);
    const misc = this.miscellaneous(fit);
    const capacitor = this.capacitor_getChargeInfo(fit);

    return {
      load: {
        armor: { HP: defense.armor.HP },
        shield: { HP: defense.shield.HP },
        structure: { HP: defense.structure.HP },
        capacitor: { HP: capacitor.HP },
      },
      capacity: { ...defense, ...misc, capacitor },
      location: location,
      description: `${fit.ship.typeName}`,
      itemID: fit.ship.typeID,
    };
  };

  static getSummary_damage(item, charge) {
    if (!item) return false;

    const damagePerAct = this.damage_damagePerAct(item, charge);
    const range = this.damage_range(item, charge);

    return { damagePerAct, range };
  }
  static getSummary_drone(item) {
    if (!item) return false;

    const damagePerAct = this.damage_damagePerAct(item, item);
    const range = this.damage_range(item, item);

    return { damagePerAct, range };
  }
  static getSummary_defense(item, charge) {
    if (!item) return false;

    const bonusPerAct = this.defense_getBonusPerAct(item, charge);

    return { bonusPerAct: { self: bonusPerAct } };
  }
  static getSummary_capacitor(item, charge) {
    if (!item) return false;
    const booster_bonusPerAct = findAttributebyID(charge, 67) || 0; //attributeID: 67, attributeName: "Capacitor Bonus"
    const transfer_bonusPerAct = findAttributebyID(item, 90) || 0; // attributeID: 90, attributeName: "Energy transfer amount"
    const neut_bonusPerAct = findAttributebyID(item, 97) || 0; // attributeID: 97, attributeName: "Neutralization Amount"

    const isNosferatuBloodRaiderOverriden = findAttributebyID(item, 1945) === 1; //attributeID: 1945, attributeName: "nosOverride"
    const isCapacitorTransmitter = !!findAttributebyID(item, 3423); //attributeID: 182, attributeName: "Primary Skill required" (3423: capacitor emission system)
    const isNosferatu = !isCapacitorTransmitter && !!transfer_bonusPerAct;

    const bonusPerAct_self = isCapacitorTransmitter
      ? 0
      : booster_bonusPerAct + transfer_bonusPerAct;
    const bonusPerAct_target = isCapacitorTransmitter
      ? transfer_bonusPerAct
      : -transfer_bonusPerAct - neut_bonusPerAct;

    const optimalRange = findAttributebyID(item, 54); //attributeID: 54, attributeName: "Optimal Range"
    const falloffRange = findAttributebyID(item, 2044); //attributeID: 2044, attributeName: "Effectiveness Falloff"

    return {
      bonusPerAct: { self: bonusPerAct_self, target: bonusPerAct_target },
      range: { optimalRange, falloffRange },
      isNosferatuBloodRaiderOverriden,
      isCapacitorTransmitter,
      isNosferatu,
    };
  }
}

class SimFit extends Fit {
  static changeStateOfModule(slots, path, state) {
    if (!["overload", "activation", "passive", "offline"].includes(state))
      return false;

    const targetSlot = this.toPath(slots, path);
    if (!targetSlot || !targetSlot.item) return false;

    targetSlot.item.typeState = state;
    const fit = this.apply(slots);
    return fit;
  }
  static toPath(slots, path) {
    if (!slots || !path) return {};
    return path.split(".").reduce((p, c) => (p && p[c]) || undefined, slots);
  }
}
