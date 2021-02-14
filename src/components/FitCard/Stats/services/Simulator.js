import Fit from "../../../../fitter/src/Fit";
import { findAttributebyID } from "../../../../services/dataManipulation/findAttributes";
import Stat from "./Stat";

export default class Simulator {
  static test(fit, fit1, situation) {
    /* const summaries1 = Summary.getSummaries(fit, situation.onboard);
    const summaries2 = Summary.getSummaries(fit1, situation.hostile);

    console.log(summaries1);

    if (!!summaries1?.capacitor?.[0]) {
      summaries1.capacitor[0].activationState.isActive = true;
      summaries1.capacitor[0].activationState.nextActivation = 0;
      summaries1.capacitor[0].activationState.nextActivationTick = 0;
      summaries1.ship.load.capacitor.HP = 200;
      for (let i = 0; i < 100; i++) {
        this.activateCapacitor(
          summaries1.capacitor[0],
          summaries1,
          summaries2,
          i
        );
        console.log("summaries", { summaries1, summaries2 });
        console.log("CAPfor owner", summaries1.ship.load.capacitor.HP);
        console.log("CAPfor offender", summaries2.ship.load.capacitor.HP);
      }
       for (let i = 0; i < 1000; i++) {
        this.activateDefense(summaries1.defense[0], summaries1, summaries2, i);
        this.simulate_capacitor(summaries1);
        console.log(
          summaries1.ship.load.capacitor.HP,
          summaries1.defense[0].activationState.isActive
        );
      }
    } */
  }

  static simulate_capacitor = (target) => {
    const capacitorState = target.ship.load.capacitor;
    const capacitorInfo = target.ship.capacity.capacitor;

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
    const shieldState = target.ship.load.shield;
    const shieldInfo = target.ship.capacity.shield;

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

  static activateDefense = (summary, owner, target, tick) => {
    //prettier-ignore
    const numOfActivation = Simulator.manageActivationState(owner,summary,tick);
    if (numOfActivation == 0) return false;

    for (let i = 0; i < numOfActivation; i++) {
      // MUTATION!
      target.ship.load.shield.HP += summary.bonusPerAct.shield;
      if (target.ship.capacity.shield.HP < target.ship.load.shield.HP)
        target.ship.load.shield.HP = target.ship.capacity.shield.HP;

      target.ship.load.armor.HP += summary.bonusPerAct.armor;
      if (target.ship.capacity.armor.HP < target.ship.load.armor.HP)
        target.ship.load.armor.HP = target.ship.capacity.armor.HP;

      target.ship.load.structure.HP += summary.bonusPerAct.structure;
      if (target.ship.capacity.structure.HP < target.ship.load.structure.HP)
        target.ship.load.structure.HP = target.ship.capacity.structure.HP;
    }
  };

  static activateDamage = (summary, owner, target, tick) => {
    //prettier-ignore
    const numOfActivation = Simulator.manageActivationState(owner,summary,tick);
    if (numOfActivation == 0) return false;
    //TODO: make drone work!
    for (let i = 0; i < numOfActivation; i++) {
      //prettier-ignore
      const situationalModifiedSummary = Simulator.#activateDamage_getSituationalModifiedSummary(summary, owner, target);
      //prettier-ignore
      const alpha = Simulator.activateDamage_getAlpha(situationalModifiedSummary, target);

      // MUTATION!
      target.ship.load.shield.HP -= alpha.shield;
      target.ship.load.armor.HP -= alpha.armor;
      target.ship.load.structure.HP -= alpha.structure;
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
      target.ship.load[type].HP / shot.alpha_damaging < 1
        ? target.ship.load[type].HP / shot.alpha_damaging
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
    const EM_blocked = (damagePerAct.EM * target.ship.capacity[type].EM) / 100;
    const TH_blocked = (damagePerAct.TH * target.ship.capacity[type].TH) / 100;
    const KI_blocked = (damagePerAct.KI * target.ship.capacity[type].KI) / 100;
    const EX_blocked = (damagePerAct.EX * target.ship.capacity[type].EX) / 100;
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
    if (!!summary.range.tracking) {
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
      target.ship.load.capacitor.HP +=
        situationalModifiedSummary.bonusPerAct.target;
      if (target.ship.load.capacitor.HP < 0) target.ship.load.capacitor.HP = 0;
      if (target.ship.capacity.capacitor.HP < target.ship.load.capacitor.HP < 0)
        target.ship.capacity.capacitor.HP = target.ship.load.capacitor.HP < 0;

      owner.ship.load.capacitor.HP +=
        situationalModifiedSummary.bonusPerAct.self;
      if (owner.ship.load.capacitor.HP < 0) owner.ship.load.capacitor.HP = 0;
      if (owner.ship.capacity.capacitor.HP < owner.ship.load.capacitor.HP < 0)
        owner.ship.capacity.capacitor.HP = owner.ship.load.capacitor.HP < 0;
    }
  };
  static #activateCapacitor_getSituationalModifiedSummary = (
    summary,
    owner,
    target
  ) => {
    const ownerCapacitorHP = owner.ship.load.capacitor.HP;
    const targetCapacitorHP = target.ship.load.capacitor.HP;

    // prettier-ignore
    const situationalMul = Simulator.#activateCapacitor_getSituationalMul(summary, owner, target);
    const bonusPerActSelf = summary.bonusPerAct.self * situationalMul;
    const bonusPerActTarget = summary.bonusPerAct.target * situationalMul;

    if (summary.isNosferatu) {
      const maxBonusPerAct = Math.min(bonusPerActSelf, targetCapacitorHP);
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
        self: bonusPerActSelf,
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

    return 1 + subSecActivation;
  };
  static #manageActivationState_capcitor = (owner, summary) => {
    const activationInfo = summary.activationInfo;
    const capacitorState = owner.ship.load.capacitor;
    if (capacitorState.HP < activationInfo.activationCost) return false;

    // MUTATION!
    capacitorState.HP -= activationInfo.activationCost;

    return activationInfo.activationCost;
  };
}
class Summary extends Stat {
  static getSummaries = (slots, situation) => {
    const fit = Fit.apply(slots);
    const shipSummary = Summary.getSummary_ship(fit, situation);
    const moduleSummaries = {};
    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.item) return false;

        Summary.#getSummaries_discriminate(slot).forEach((summary) => {
          if (!moduleSummaries[summary.path])
            moduleSummaries[summary.path] = [];
          moduleSummaries[summary.path].push(summary);
        });
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
    return { ship: shipSummary, ...moduleSummaries };
  };

  static #getSummaries_discriminate = (slot) => {
    if (!slot?.item?.typeEffectsStats) return false;
    const item = slot.item;
    const charge = slot.charge || slot.item;

    return item.typeEffectsStats
      .map((efft) => {
        const activationDataSet = Summary.createActivationDataSet(slot);
        let summary = {};
        let path = false;

        switch (efft.effectID) {
          case 101: // effectID: 101, effectName: "useMissiles"
          case 34: // effectID: 34, effectName: "projectileFired"
          case 10: // effectID: 10, effectName: "targetAttack"
          case 6995: // effectID: 6995, effectName: "targetDisintegratorAttack"
            summary = Summary.getSummary_damage(item, charge);
            if (!summary.damagePerAct.alpha) return false;
            path = "damage";
            break;
          case 4: // effectID: 4, effectName: "shieldBoosting"
          case 26: // effectID: 26, effectName: "structureRepair"
          case 4936: // effectID: 4936, effectName: "fueledShieldBoosting"
          case 27: // effectID: 27, effectName: "armorRepair"
          case 5275: // effectID: 5275, effectName: "fueledArmorRepair"
            summary = Summary.getSummary_defense(item, charge);
            path = "defense";
            break;
          case 48: //effectID: 48, effectName: "powerBooster"
          case 6187: //effectID: 6187, effectName: "energyNeutralizerFalloff"
          case 6197: //effectID: 6197, effectName: "energyNosferatuFalloff"
          case 6148: // effectID: 6184, effectName: "shipModuleRemoteCapacitorTransmitter"
            summary = Summary.getSummary_capacitor(item, charge);
            path = "capacitor";
            break;
          default:
            return false;
        }
        return { ...summary, ...activationDataSet, path };
      })
      .filter((efft) => !!efft);
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
    const slot = { item, charge };

    return { damagePerAct, range, slot };
  }
  static getSummary_defense(item, charge) {
    if (!item) return false;

    const bonusPerAct = this.defense_getBonusPerAct(item, charge);
    const slot = { item, charge };

    return { bonusPerAct, slot };
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

    const slot = { item, charge };

    return {
      bonusPerAct: { self: bonusPerAct_self, target: bonusPerAct_target },
      range: { optimalRange, falloffRange },
      isNosferatuBloodRaiderOverriden,
      isCapacitorTransmitter,
      isNosferatu,
      slot,
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
    const onBoardVector = owner.ship.situation.vector;
    const hostileVector = target.ship.situation.vector;
    const distanceVector = {
      x:
        target.ship.situation.anchors.anchor1X -
        owner.ship.situation.anchors.anchor1X,
      y:
        target.ship.situation.anchors.anchor1Y -
        owner.ship.situation.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    const trackingValue = summary.range.tracking;
    const optimalRange = summary.range.optimalRange;
    const fallOffRange = summary.range.optimalRange;
    const signatureRadius = target.ship.capacity.misc.signatureRadius;

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

    const _distancePart = EveMath.#getTurretAcurracy_distancePart(
      optimalRange,
      fallOffRange,
      distance
    );

    return Math.pow(0.5, _trackingPart + _distancePart).toFixed(3);
  }
  static getLauncherAccuracy(summary, owner, target) {
    const distanceVector = {
      x:
        target.ship.situation.anchors.anchor1X -
        owner.ship.situation.anchors.anchor1X,
      y:
        target.ship.situation.anchors.anchor1Y -
        owner.ship.situation.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    return summary.range.optimalRange < distance * 1000 ? 0 : 1;
  }
  static getLauncherDamageModifier(summary, target) {
    const signatureRadius = target.ship.capacity.misc.signatureRadius;
    const explosionRadius = summary.range.explosionRadius;
    const explosionVelocity = summary.range.explosionVelocity;
    const damageReductionFactor = summary.range.damageReductionFactor;
    const targetVelocity =
      Math.sqrt(
        Math.pow(target.ship.situation.vector.x, 2) +
          Math.pow(target.ship.situation.vector.y, 2)
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
        target.ship.situation.anchors.anchor1X -
        owner.ship.situation.anchors.anchor1X,
      y:
        target.ship.situation.anchors.anchor1Y -
        owner.ship.situation.anchors.anchor1Y,
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
      const perpendicularUnitVector = EveMath.#getTurretAcurracy_makeUnitVector(
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
  static #getTurretAcurracy_makeUnitVector = (vector) => {
    const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    return { x: vector.x / length, y: vector.y / length };
  };
  static #getTurretAcurracy_validateVector = (vector) => {
    if (vector.x !== undefined && vector.y !== undefined) return true;
    else return false;
  };
}
