import Fit from "../../../../fitter/src/Fit";
import { findAttributebyID } from "../../../../services/dataManipulation/findAttributes";
import Stat from "./Stat";

export default class Simulator {
  static test(slots, fit1, situation) {
    const summaries1 = Summary.addSummaries(slots, situation.onboard);
    const summaries2 = Summary.addSummaries(fit1, situation.hostile);
    console.log(summaries1, summaries2);
    summaries1.summary.load.shield.HP = 100;
    if (!!summaries1?.midSlots?.[0]?.summary) {
      summaries1.midSlots[0].summary.activationState.isActive = true;
      summaries1.midSlots[0].summary.activationState.nextActivation = 0;
      summaries1.midSlots[0].summary.activationState.nextActivationTick = 0;
      for (let i = 0; i < 100; i++) {
        Simulator.activateDefense(
          summaries1.midSlots[0].summary,
          summaries1,
          summaries2,
          i
        );
        console.log(summaries1.summary.load.shield.HP);
      }
    }
  }

  static simulate_oneTick = (owner, target, tick) => {
    Simulator.simulate_capacitor(owner);
    Simulator.simulate_shield(owner);
    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.summary) return false;
        switch (slot.summary.operation) {
          case "damage":
            Simulator.activateDamage(slot.summary, owner, target, tick);
            break;
          case "defense":
            Simulator.activateDefense(slot.summary, owner, target, tick);
            break;
          case "capacitor":
            Simulator.activateCapacitor(slot.summary, owner, target, tick);
            break;
        }
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
  };
  static simulate_capacitor = (target) => {
    const capacitorState = target.summary.load.capacitor;
    const capacitorInfo = target.summary.capacity.capacitor;

    const ambientChargeRate = EveMath.getAmbientChargeRateMath(
      capacitorInfo.HP,
      capacitorState.HP,
      capacitorInfo.bonusRate
    );

    // MUTATION!
    capacitorState.HP += ambientChargeRate;
    if (capacitorState.HP === 0) capacitorState.HP = 1;

    return ambientChargeRate;
  };
  static simulate_shield = (target) => {
    const shieldState = target.summary.load.shield;
    const shieldInfo = target.summary.capacity.shield;

    const ambientChargeRate = EveMath.getAmbientChargeRateMath(
      shieldInfo.HP,
      shieldState.HP,
      shieldInfo.bonusRate
    );

    // MUTATION!
    shieldState.HP += ambientChargeRate;
    if (shieldState.HP === 0) shieldState.HP += 1;

    return ambientChargeRate;
  };
  //Currently target boost (remote armor repair is nor possible)
  static activateDefense = (summary, owner, target, tick) => {
    //prettier-ignore
    const numOfActivation = Simulator.manageActivationState(owner,summary,tick);
    if (numOfActivation == 0) return false;

    for (let i = 0; i < numOfActivation; i++) {
      // MUTATION!
      owner.summary.load.shield.HP += summary.bonusPerAct.self.shield;
      if (owner.summary.capacity.shield.HP < owner.summary.load.shield.HP)
        owner.summary.load.shield.HP = owner.summary.capacity.shield.HP;

      owner.summary.load.armor.HP += summary.bonusPerAct.self.armor;
      if (owner.summary.capacity.armor.HP < owner.summary.load.armor.HP)
        owner.summary.load.armor.HP = owner.summary.capacity.armor.HP;

      owner.summary.load.structure.HP += summary.bonusPerAct.self.structure;
      if (owner.summary.capacity.structure.HP < owner.summary.load.structure.HP)
        owner.summary.load.structure.HP = owner.summary.capacity.structure.HP;
    }
  };

  static activateDamage = (summary, owner, target, tick) => {
    //prettier-ignore
    const numOfActivation = Simulator.manageActivationState(owner,summary,tick);
    if (numOfActivation == 0) return false;
    for (let i = 0; i < numOfActivation; i++) {
      //prettier-ignore
      const situationalModifiedSummary = Simulator.#activateDamage_getSituationalModifiedSummary(summary, owner, target);
      //prettier-ignore
      const alpha = Simulator.activateDamage_getAlpha(situationalModifiedSummary, target);

      // MUTATION!
      target.summary.load.shield.HP -= alpha.shield;
      if (target.summary.load.shield.HP < 0) target.summary.load.shield.HP = 0;
      target.summary.load.armor.HP -= alpha.armor;
      if (target.summary.load.armor.HP < 0) target.summary.load.armor.HP = 0;
      target.summary.load.structure.HP -= alpha.structure;
      if (target.summary.load.structure.HP < 0)
        target.summary.load.structure.HP = 0;
    }
  };
  static activateDamage_getAlpha = (summary, target) => {
    if (!summary.damagePerAct.alpha)
      return { shield: 0, armor: 0, structure: 0 };

    //prettier-ignore
    const shieldDamage = Simulator.#activateDamage_getDamageResult(summary.damagePerAct, target, "shield");
    if (shieldDamage.remaining.alpha <= 0.01)
      return { shield: shieldDamage.appplied.alpha, armor: 0, structure: 0 };

    //prettier-ignore
    const armorDamage = Simulator.#activateDamage_getDamageResult(shieldDamage.remaining, target, "armor");
    if (armorDamage.remaining.alpha <= 0.01)
      return {
        shield: shieldDamage.appplied.alpha,
        armor: armorDamage.appplied.alpha,
        structure: 0,
      };

    //prettier-ignore
    const structureDamage = Simulator.#activateDamage_getDamageResult(armorDamage.remaining, target, "structure");
    return {
      shield: shieldDamage.appplied.alpha,
      armor: armorDamage.appplied.alpha,
      structure: structureDamage.appplied.alpha,
    };
  };
  static #activateDamage_getDamageResult = (damagePerAct, target, type) => {
    //prettier-ignore
    const shot = Simulator.#activateDamage_getShot(damagePerAct, target, type);
    const damageCapMultiplier =
      target.summary.load[type].HP / shot.alpha_damaging < 1
        ? target.summary.load[type].HP / shot.alpha_damaging
        : 1;

    const EM_applied = shot.EM_damaging * damageCapMultiplier;
    const TH_applied = shot.TH_damaging * damageCapMultiplier;
    const KI_applied = shot.KI_damaging * damageCapMultiplier;
    const EX_applied = shot.EX_damaging * damageCapMultiplier;
    const alpha_applied = EM_applied + TH_applied + KI_applied + EX_applied;

    const EM_remaining = damagePerAct.EM - EM_applied - shot.EM_blocked;
    const TH_remaining = damagePerAct.TH - TH_applied - shot.TH_blocked;
    const KI_remaining = damagePerAct.KI - KI_applied - shot.KI_blocked;
    const EX_remaining = damagePerAct.EX - EX_applied - shot.EX_blocked;
    const alpha_remaining =
      EM_remaining + TH_remaining + KI_remaining + EX_remaining;

    return {
      appplied: {
        alpha: alpha_applied,
        EM: EM_applied,
        TH: TH_applied,
        KI: KI_applied,
        EX: EX_applied,
      },
      remaining: {
        alpha: alpha_remaining,
        EM: EM_remaining,
        TH: TH_remaining,
        KI: KI_remaining,
        EX: EX_remaining,
      },
    };
  };
  static #activateDamage_getShot = (damagePerAct, target, type) => {
    const EM_blocked =
      (damagePerAct.EM * target.summary.capacity[type].EM) / 100;
    const TH_blocked =
      (damagePerAct.TH * target.summary.capacity[type].TH) / 100;
    const KI_blocked =
      (damagePerAct.KI * target.summary.capacity[type].KI) / 100;
    const EX_blocked =
      (damagePerAct.EX * target.summary.capacity[type].EX) / 100;
    const alpha_blocked = EM_blocked + TH_blocked + KI_blocked + EX_blocked;

    const EM_damaging = damagePerAct.EM - EM_blocked;
    const TH_damaging = damagePerAct.TH - TH_blocked;
    const KI_damaging = damagePerAct.KI - KI_blocked;
    const EX_damaging = damagePerAct.EX - EX_blocked;
    const alpha_damaging =
      EM_damaging + TH_damaging + KI_damaging + EX_damaging;

    return {
      alpha_damaging,
      EM_damaging,
      TH_damaging,
      KI_damaging,
      EX_damaging,
      alpha_blocked,
      EM_blocked,
      TH_blocked,
      KI_blocked,
      EX_blocked,
    };
  };
  static #activateDamage_getSituationalModifiedSummary = (
    summary,
    owner,
    target
  ) => {
    const situationalMul = Simulator.#activateDamage_getSituationalMul(
      summary,
      owner,
      target
    );

    return {
      ...summary,
      damagePerAct: {
        alpha: summary.damagePerAct.alpha * situationalMul,
        EM: summary.damagePerAct.EM * situationalMul,
        TH: summary.damagePerAct.TH * situationalMul,
        KI: summary.damagePerAct.KI * situationalMul,
        EX: summary.damagePerAct.EX * situationalMul,
      },
    };
  };
  static #activateDamage_getSituationalMul = (summary, owner, target) => {
    if (!!summary.capacity.propulsion.orbitRange) {
      //prettier-ignore
      const droneAccuracy = EveMath.getDroneAccracy(summary, owner, target);

      return Math.random() <= droneAccuracy
        ? EveMath.getTurretRandomDamageModifier()
        : 0;
    } else if (!!summary.range.tracking) {
      //prettier-ignore
      const turretAccuracy = EveMath.getTurretAcurracy(summary, owner, target);

      return Math.random() <= turretAccuracy
        ? EveMath.getTurretRandomDamageModifier()
        : 0;
    } else if (!!summary.range.explosionRadius) {
      //prettier-ignore
      const launcherAccracy = EveMath.getLauncherAccuracy(summary, owner, target);

      return Math.random() <= launcherAccracy
        ? EveMath.getLauncherDamageModifier(summary, target)
        : 0;
    } else return 0;
  };

  static activateCapacitor = (summary, owner, target, tick) => {
    //prettier-ignore
    const numOfActivation = Simulator.manageActivationState(owner,summary,tick);
    if (numOfActivation == 0) return false;

    for (let i = 0; i < numOfActivation; i++) {
      //prettier-ignore
      const situationalModifiedSummary = Simulator.#activateCapacitor_getSituationalModifiedSummary(summary, owner, target);

      // MUTATION!
      target.summary.load.capacitor.HP +=
        situationalModifiedSummary.bonusPerAct.target;
      if (target.summary.load.capacitor.HP < 0)
        target.summary.load.capacitor.HP = 0;
      if (
        target.summary.capacity.capacitor.HP < target.summary.load.capacitor.HP
      )
        target.summary.load.capacitor.HP = target.summary.capacity.capacitor.HP;

      owner.summary.load.capacitor.HP +=
        situationalModifiedSummary.bonusPerAct.owner;
      if (owner.summary.load.capacitor.HP < 0)
        owner.summary.load.capacitor.HP = 0;
      if (owner.summary.capacity.capacitor.HP < owner.summary.load.capacitor.HP)
        owner.summary.load.capacitor.HP = owner.summary.capacity.capacitor.HP;
    }
  };
  static #activateCapacitor_getSituationalModifiedSummary = (
    summary,
    owner,
    target
  ) => {
    const ownerCapacitorHP = owner.summary.load.capacitor.HP;
    const targetCapacitorHP = target.summary.load.capacitor.HP;

    // prettier-ignore
    const situationalMul = Simulator.#activateCapacitor_getSituationalMul(summary, owner, target);
    const bonusPerActOwner = summary.bonusPerAct.self * situationalMul;
    const bonusPerActTarget = summary.bonusPerAct.target * situationalMul;

    if (summary.isNosferatu) {
      const maxBonusPerAct = Math.min(bonusPerActOwner, targetCapacitorHP);
      let symmetricBonusPerAct = maxBonusPerAct;

      if (
        !summary.isNosferatuBloodRaiderOverriden &&
        targetCapacitorHP + bonusPerActTarget < ownerCapacitorHP
      )
        symmetricBonusPerAct = Math.max(
          Math.floor((targetCapacitorHP - ownerCapacitorHP) / 2),
          0
        );
      symmetricBonusPerAct = Math.min(maxBonusPerAct, symmetricBonusPerAct);
      return {
        ...summary,
        bonusPerAct: {
          self: symmetricBonusPerAct,
          target: -symmetricBonusPerAct,
        },
      };
    }

    return {
      ...summary,
      bonusPerAct: {
        owner: bonusPerActOwner,
        target: bonusPerActTarget,
      },
    };
  };
  static #activateCapacitor_getSituationalMul = (summary, owner, target) => {
    const rangeModifier = EveMath.getRangeModifier(summary, owner, target);

    const isCapacitorBooster = summary.slot.item?.typeEffectsStats?.reduce(
      (acc, efft) => {
        if (efft.effectID === 48)
          //effectID: 48, effectName: "powerBooster"
          return true;
        return acc;
      },
      false
    );

    return isCapacitorBooster ? 1 : rangeModifier;
  };

  static manageActivationState = (owner, summary, tick) => {
    const state = summary.activationState;
    const info = summary.activationInfo;
    if (state.isActive && state.nextActivationTick < tick)
      console.warn("ERR: Tick is not in sync"); //TODO: for testing, check tick is okay
    if (!state.isActive || state.nextActivationTick !== tick) return 0;
    //prettier-ignore
    const activationCost = Simulator.#manageActivationState_capcitor(owner, summary);
    if (activationCost === false) {
      state.isActive = false; // TODO: for testing, auto off if capacitor is out. make ai control capacitor
      return 0;
    }

    // MUTATION!
    state.activationLeft--;
    state.lastActivation = state.nextActivation;

    // Check if ammo left is 0, set time
    if (state.activationLeft === 0) {
      state.nextActivation =
        state.lastActivation + info.duration + info.reloadTime;
      state.activationLeft = info.activationLimit;
    } else state.nextActivation = state.lastActivation + info.duration;
    state.nextActivationTick = Math.floor(state.nextActivation);

    // Check if next activation is in same tick
    let subSecActivation = 0;
    if (state.nextActivationTick === tick)
      subSecActivation = Simulator.manageActivationState(owner, summary, tick);

    return (1 + subSecActivation) * state.typeCount;
  };
  static #manageActivationState_capcitor = (owner, summary) => {
    const activationInfo = summary.activationInfo;
    const capacitorState = owner.summary.load.capacitor;
    if (capacitorState.HP < activationInfo.activationCost) return false;

    // MUTATION!
    capacitorState.HP -= activationInfo.activationCost;

    return activationInfo.activationCost;
  };
}
class Summary extends Stat {
  static addSummaries = (slots, situation) => {
    const _slots = JSON.parse(JSON.stringify(slots));
    const fit = Fit.apply(_slots);

    if (!!_slots) _slots["summary"] = Summary.getSummary_ship(fit, situation);

    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.item) return false;

        const summary = Summary.#getSummaries_modules(slot);
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

  static #getSummaries_modules = (slot) => {
    if (!slot?.item?.typeEffectsStats) return false;
    const item = slot.item;
    const charge = slot.charge;

    const path = slot.item.domainID.split(".").slice(0, 2).join(".");
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
        typeCount: activationInfo.typeCount,
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

class EveMath {
  static getAmbientChargeRateMath(Cmax, Cnow, Tchg) {
    return ((10 * Cmax) / Tchg) * (Math.sqrt(Cnow / Cmax) - Cnow / Cmax) || 0;
  }
  static getTurretAcurracy(summary, owner, target) {
    const onBoardVector = owner.summary.situation.vector;
    const hostileVector = target.summary.situation.vector;
    const distanceVector = {
      x:
        target.summary.situation.anchors.anchor1X -
        owner.summary.situation.anchors.anchor1X,
      y:
        target.summary.situation.anchors.anchor1Y -
        owner.summary.situation.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    const trackingValue =
      summary.range.tracking * (40000 / summary.range.signatureResolution);
    const optimalRange = summary.range.optimalRange;
    const fallOffRange = summary.range.optimalRange;
    const signatureRadius = target.summary.capacity.misc.signatureRadius;

    const _angularVelocity = EveMath.#getTurretAcurracy_angularVelocuty(
      distance,
      distanceVector,
      onBoardVector,
      hostileVector
    );
    const _trackingPart = EveMath.#getTurretAcurracy_trackingPart(
      _angularVelocity,
      trackingValue,
      signatureRadius
    );

    const trackingModifier = Math.pow(0.5, _trackingPart);
    const rangeModifier = EveMath.getRangeModifier(summary, owner, target);
    /*  const _distancePart = EveMath.#getTurretAcurracy_distancePart(
      optimalRange,
      fallOffRange,
      distance
    ); */

    /* return (Math.pow(0.5, _trackingPart + _distancePart)).toFixed(3); */
    return (trackingModifier * rangeModifier).toFixed(3);
  }
  static getLauncherAccuracy(summary, owner, target) {
    const distanceVector = {
      x:
        target.summary.situation.anchors.anchor1X -
        owner.summary.situation.anchors.anchor1X,
      y:
        target.summary.situation.anchors.anchor1Y -
        owner.summary.situation.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    return summary.range.optimalRange < distance * 1000 ? 0 : 1;
  }
  static getDroneAccracy(summary, owner, target) {
    // owner is owner of drone! which is ship
    if (summary.isSentry)
      return EveMath.getTurretAcurracy(summary, owner, target);

    const targetUnitVector = EveMath.#common_makeUnitVector(
      target.summary.situation.vector
    );
    const targetVelocity =
      Math.sqrt(
        Math.pow(target.summary.situation.vector.x, 2) +
          Math.pow(target.summary.situation.vector.y, 2)
      ) * 3;
    const isChasing =
      summary.capacity.propulsion.orbitVelocity < targetVelocity;
    if (isChasing) {
      const droneAccuracyModifier = EveMath.#getDroneAccracy_getAccuracyModifier(
        summary,
        targetVelocity
      );
      const absoluteVelocity = summary.capacity.propulsion.orbitVelocity;
      const droneVector = {
        x: targetUnitVector.x * (absoluteVelocity / 3), // Currently 1px = 3m/s
        y: targetUnitVector.y * (absoluteVelocity / 3),
      };
      const droneSituationsummary = {
        summary: {
          situation: {
            anchors: {
              anchor1X:
                target.summary.situation.anchors.anchor1X -
                (targetUnitVector.x * summary.capacity.propulsion.orbitRange) /
                  10, // Currently 1px = 10m
              anchor1Y:
                target.summary.situation.anchors.anchor1Y -
                (targetUnitVector.y * summary.capacity.propulsion.orbitRange) /
                  10,
            },
            vector: droneVector,
          },
        },
      };
      return (
        EveMath.getTurretAcurracy(summary, droneSituationsummary, target) *
        droneAccuracyModifier
      );
    } else {
      const absoluteVelocity =
        summary.capacity.propulsion.orbitVelocity + targetVelocity;
      const droneVector = {
        x: targetUnitVector.x * (absoluteVelocity / 3), // Currently 1px = 3m/s
        y: targetUnitVector.y * (absoluteVelocity / 3),
      }; // drone positions at perpendicular to targetVector
      const droneSituationsummary = {
        summary: {
          situation: {
            anchors: {
              anchor1X:
                target.summary.situation.anchors.anchor1X +
                (targetUnitVector.y * summary.capacity.propulsion.orbitRange) /
                  10, // Currently 1px = 10m
              anchor1Y:
                target.summary.situation.anchors.anchor1Y -
                (targetUnitVector.x * summary.capacity.propulsion.orbitRange) /
                  10,
            },
            vector: droneVector,
          },
        },
      };
      return EveMath.getTurretAcurracy(summary, droneSituationsummary, target);
    }
  }
  static #getDroneAccracy_getAccuracyModifier = (summary, targetVelocity) => {
    // Estimated modifier - drone movement is too complicated simplify the situation when target velocity is higher than orbit velocity
    //prettier-ignore
    const value = 1 -targetVelocity /
        (summary.capacity.propulsion.maximumVelocity - summary.capacity.propulsion.orbitVelocity);
    if (value >= 1) return 1;
    return value >= 0 ? value : 0.01;
  };
  static getLauncherDamageModifier(summary, target) {
    const signatureRadius = target.summary.capacity.misc.signatureRadius;
    const explosionRadius = summary.range.explosionRadius;
    const explosionVelocity = summary.range.explosionVelocity;
    const damageReductionFactor = summary.range.damageReductionFactor;
    const targetVelocity =
      Math.sqrt(
        Math.pow(target.summary.situation.vector.x, 2) +
          Math.pow(target.summary.situation.vector.y, 2)
      ) * 3;

    const simplePart = signatureRadius / explosionRadius;
    const complexPart = Math.pow(
      (signatureRadius * explosionVelocity) /
        (explosionRadius * targetVelocity),
      damageReductionFactor
    );

    return Math.min(1, simplePart, complexPart);
  }
  static getTurretRandomDamageModifier() {
    const randomDamageModifier = Math.random();
    return randomDamageModifier < 0.01 ? 3 : randomDamageModifier + 0.49;
  }
  static getRangeModifier(summary, owner, target) {
    const distanceVector = {
      x:
        target.summary.situation.anchors.anchor1X -
        owner.summary.situation.anchors.anchor1X,
      y:
        target.summary.situation.anchors.anchor1Y -
        owner.summary.situation.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    const optimal = summary.range.optimalRange;
    const falloff = summary.range.falloffRange;
    if (distance * 1000 > optimal + 3 * falloff) return 0;

    const denominator = falloff;
    const numerator = Math.max(0, distance * 1000 - optimal);
    const _distancePart = Math.pow(numerator / denominator, 2);

    return Math.pow(0.5, _distancePart);
  }

  static #getTurretAcurracy_trackingPart = (
    angularVelocity,
    trackingValue,
    signatureRadius
  ) => {
    const denominator = trackingValue * signatureRadius;
    const numerator = angularVelocity * 40000;
    return Math.pow(numerator / denominator, 2);
  };
  static #getTurretAcurracy_distancePart = (optimal, fallOff, distance) => {
    const denominator = fallOff;
    const numerator = Math.max(0, distance * 1000 - optimal);
    return Math.pow(numerator / denominator, 2);
  };
  static #getTurretAcurracy_angularVelocuty = (
    distance,
    distanceVector,
    onBoardVector,
    hostileVector
  ) => {
    if (
      EveMath.#getTurretAcurracy_validateVector(distanceVector) &&
      EveMath.#getTurretAcurracy_validateVector(onBoardVector) &&
      EveMath.#getTurretAcurracy_validateVector(hostileVector)
    ) {
      const perpendicularVector = { x: -distanceVector.y, y: distanceVector.x };
      const perpendicularUnitVector = EveMath.#common_makeUnitVector(
        perpendicularVector
      );
      const hostileOrbitalVelocity = EveMath.#getTurretAcurracy_innerProduct(
        perpendicularUnitVector,
        hostileVector
      );
      const onBoardOrbitalVelocity = EveMath.#getTurretAcurracy_innerProduct(
        perpendicularUnitVector,
        onBoardVector
      );
      const trueObitalVelocity =
        (hostileOrbitalVelocity - onBoardOrbitalVelocity) * 3;
      return trueObitalVelocity / (distance * 1000);
    } else return false;
  };
  static #getTurretAcurracy_innerProduct = (unitVector, velocityVector) => {
    return unitVector.x * velocityVector.x + unitVector.y * velocityVector.y;
  };
  static #getTurretAcurracy_validateVector = (vector) => {
    if (vector.x !== undefined && vector.y !== undefined) return true;
    else return false;
  };
  static #common_makeUnitVector = (vector) => {
    const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    return { x: vector.x / length, y: vector.y / length };
  };
}
