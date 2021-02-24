import { findAttributebyID } from "../../../../services/dataManipulation/findAttributes";
import Fit from "../../../../fitter/src/Fit";
import Stat from "./Stat";

export default class Summary extends Stat {
  static addSummaries = (slots, situation) => {
    const _slots = Summary.addSummaries_duplicateSlots(slots);
    const fit = Fit.apply(_slots);

    if (!!_slots) _slots["summary"] = Summary.getSummary_ship(fit, situation);

    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.item) return false;

        const summary = Summary.#getSummaries_modules(slot);
        summary["root"] = _slots.summary;
        const _slot = !!summary && SimFit.toPath(_slots, summary.path);
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

        const summary = Summary.#getSummaries_drones(slot, situation);
        summary["root"] = _slots.summary;
        const _slot = !!summary && SimFit.toPath(_slots, summary.path);
        if (!!_slot) _slot["summary"] = summary;
      },
      {
        isIterate: {
          droneSlots: true,
        },
      }
    );
    return _slots;
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

  static #getSummaries_modules = (slot) => {
    if (!slot?.item?.typeEffectsStats) return false;
    const item = slot.item;
    const charge = slot.charge;

    const path = slot.item.domainID.split(".").slice(0, 2).join("."); //eg)highSlots.1
    const summary = item.typeEffectsStats
      .map((efft) => {
        const activationDataSet = Summary.createActivationDataSet(slot);
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
          default:
            return false;
        }
        return { ...summary, ...activationDataSet, operation, path };
      })
      .filter((summary) => !!summary);

    if (summary.length > 1)
      console.error(
        "ERR: more than one summary produced in single module",
        slot
      );
    else return summary[0] || false;
  };
  static #getSummaries_drones = (slot) => {
    if (!slot?.item?.typeEffectsStats) return false;
    const item = slot.item;
    const isSentry = slot.item.marketGroupID === 911; // marketGroupID: 911 "marketGroupName": "Sentry Drones"

    const path = slot.item.domainID.split(".").slice(0, 2).join(".");
    // These functions from Stat class is targeted for ship. modified to fit in drone in this case
    const defense = this.defense_resistance({ ship: slot.item });
    const capacitor = this.capacitor_getChargeInfo({ ship: slot.item });

    const misc = this.miscellaneous({ ship: slot.item });
    const orbitVelocity = findAttributebyID(slot.item, 508); // attributeID: 508, attributeName: "Orbit Velocity"
    const orbitRange = findAttributebyID(slot.item, 416); //attributeID: 416, attributeName: "entityFlyRange"
    const maximumVelocity = findAttributebyID(slot.item, 37); // attributeID: 37, attributeName: "Maximum Velocity"
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
    const moduleSummary = item.typeEffectsStats
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
        return { ...summary, ...activationDataSet, operation, path };
      })
      .filter((summary) => !!summary);

    const situation_decription =
      "Currently situation is not calculated BUT! always hitted by smart bomb";

    if (moduleSummary.length > 1)
      console.error(
        "ERR: more than one summary produced in single module",
        slot
      );
    else
      return {
        ...droneSumamry,
        ...moduleSummary[0],
        situation_decription,
        isSentry,
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
  static getSummary_ship = (fit, situation) => {
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
      situation: situation,
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
    return path.split(".").reduce((p, c) => (p && p[c]) || undefined, slots);
  }
}