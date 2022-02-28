import Fit from "../../../../fitter/src/Fit";
import EveMath from "./EveMath";
import Summary from "./Summary";

export default class Simulator {
  static test(slots, fit1, situation) {
    const summarizedSlots1 = Summary.getSummarizedSlots(
      slots,
      situation.onboard
    );
    const summarizedSlots2 = Summary.getSummarizedSlots(
      fit1,
      situation.hostile
    );
    console.log(summarizedSlots1, summarizedSlots2, situation);

    Fit.mapSlots(
      summarizedSlots1,
      (slot) => {
        if (!slot?.summary?.activationState) return false;
        slot.summary.activationState.isActive = true;
        slot.summary.activationState.nextActivationTick = 0;
        slot.summary.activationState.nextActivation = 0;
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

    console.log(
      "CAPACITOR_BY_LEVEL",
      HAL.manageActivation_getCapUsageLevels(summarizedSlots1)
    );
    const capLog = [];
    for (let i = 0; i < 2; i++) {
      const schedules = HAL.getSchedules(summarizedSlots1, summarizedSlots2, i);
      console.log(schedules);
      HAL.manageSchedules(schedules, summarizedSlots1, situation.onboard);

      capLog.push({ x: i, y: summarizedSlots1.summary.load.capacitor.HP });
    }

    console.log(capLog);
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
    const delta = Simulator.simulate_capacitor_getDelta(target);

    // MUTATION!
    capacitorState.HP += delta;
    if (capacitorState.HP === 0) capacitorState.HP = 1;

    return delta;
  };
  static simulate_passive_capacitor_getDelta = (target) => {
    if (target.summary.load.capacitor.HP <= 0) return 1;

    const capacitorState = target.summary.load.capacitor;
    const capacitorInfo = target.summary.capacity.capacitor;

    const ambientChargeRate = EveMath.getAmbientChargeRateMath(
      capacitorInfo.HP,
      capacitorState.HP,
      capacitorInfo.bonusRate
    );

    return ambientChargeRate;
  };
  static simulate_shield = (target) => {
    const shieldState = target.summary.load.shield;
    const delta = Simulator.simulate_capacitor_getDelta(target);

    // MUTATION!
    shieldState.HP += delta;
    if (shieldState.HP === 0) shieldState.HP += 1;

    return delta;
  };
  static simulate_passive_shield_getDelta = (target) => {
    if (target.summary.load.shield.HP <= 0) return 0.1;

    const shieldState = target.summary.load.shield;
    const shieldInfo = target.summary.capacity.shield;

    const ambientChargeRate = EveMath.getAmbientChargeRateMath(
      shieldInfo.HP,
      shieldState.HP,
      shieldInfo.bonusRate
    );

    return ambientChargeRate;
  };

  //Currently target boost (remote armor repair is not possible
  static simulate_defense_getDelta = (summary) => {
    return {
      armorDelta: summary.bonusPerAct.self.armor,
      shieldDelta: summary.bonusPerAct.self.shield,
      structureDelta: summary.bonusPerAct.self.structure,
    };
  };
  static activateDefense = (summary) => {
    const owner = summary.root;

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
    /*  } */
  };

  static simulate_damage_getDelta = (summary, target) => {
    const debug = [];
    const owner = summary.isDrone ? summary : summary.root;
    const _target = target || summary.target;
    //prettier-ignore
    const situationalModifiedSummary = Simulator.#activateDamage_getSituationalModifiedSummary(summary, owner, _target, debug);
    //prettier-ignore
    const alpha = Simulator.activateDamage_getAlpha(situationalModifiedSummary, _target);

    return {
      armorDelta: -alpha.armor,
      shieldDelta: -alpha.shield,
      structureDelta: -alpha.structure,
      debug,
    };
  };
  static activateDamage = (summary) => {
    const debug = [];
    const owner = summary.isDrone ? summary : summary.root;
    const target = summary.target;
    //prettier-ignore
    const situationalModifiedSummary = Simulator.#activateDamage_getSituationalModifiedSummary(summary, owner, target, debug );
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
    target,
    debug
  ) => {
    const situationalMul = Simulator.#activateDamage_getSituationalMul(
      summary,
      owner,
      target,
      debug
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
  static #activateDamage_getSituationalMul = (
    summary,
    owner,
    target,
    debug
  ) => {
    if (summary.isDrone) {
      //prettier-ignore
      const droneAccuracy = EveMath.getDroneAccuracy(summary, owner, target, debug);
      const randomDamageModifier = EveMath.getTurretRandomDamageModifier();
      const isHit = Math.random() <= droneAccuracy;
      debug.push({
        type: "drone_random_damage_multiplier",
        value: randomDamageModifier,
      });
      debug.push({
        type: "hit",
        value: isHit,
      });

      return isHit ? randomDamageModifier : 0;
    } else if (!!summary.range.tracking) {
      //prettier-ignore
      const turretAccuracy = EveMath.getTurretAcurracy(summary, owner, target, debug);
      const randomDamageModifier = EveMath.getTurretRandomDamageModifier();
      const isHit = Math.random() <= turretAccuracy;
      debug.push({
        type: "turret_random_damage_multiplier",
        value: randomDamageModifier,
      });
      debug.push({
        type: "hit",
        value: isHit,
      });

      return isHit ? randomDamageModifier : 0;
    } else if (!!summary.range.explosionRadius) {
      //prettier-ignore
      const launcherAccracy = EveMath.getLauncherAccuracy(summary, owner, target, debug);
      //prettier-ignore
      const damageModifier = EveMath.getLauncherDamageModifier(summary, target, debug);
      const isHit = Math.random() <= launcherAccracy;
      debug.push({
        type: "hit",
        value: isHit,
      });

      return isHit ? damageModifier : 0;
    } else return 0;
  };

  static simulate_capacitor_getDelta = (summary) => {
    const owner = summary.root;
    const target = summary.target;
    //prettier-ignore
    const situationalModifiedSummary = Simulator.#activateCapacitor_getSituationalModifiedSummary(summary, owner, target);

    return {
      target: {
        capacitorDelta: situationalModifiedSummary.bonusPerAct.target,
      },
      self: {
        capacitorDelta: situationalModifiedSummary.bonusPerAct.owner,
      },
    };
  };

  static activateCapacitor = (summary) => {
    const owner = summary.root;
    const target = summary.target;
    //prettier-ignore
    const situationalModifiedSummary = Simulator.#activateCapacitor_getSituationalModifiedSummary(summary, owner, target);

    // MUTATION!
    target.summary.load.capacitor.HP +=
      situationalModifiedSummary.bonusPerAct.target;
    if (target.summary.load.capacitor.HP < 0)
      target.summary.load.capacitor.HP = 0;
    if (target.summary.capacity.capacitor.HP < target.summary.load.capacitor.HP)
      target.summary.load.capacitor.HP = target.summary.capacity.capacitor.HP;

    owner.summary.load.capacitor.HP +=
      situationalModifiedSummary.bonusPerAct.owner;
    if (owner.summary.load.capacitor.HP < 0)
      owner.summary.load.capacitor.HP = 0;
    if (owner.summary.capacity.capacitor.HP < owner.summary.load.capacitor.HP)
      owner.summary.load.capacitor.HP = owner.summary.capacity.capacitor.HP;
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
          owner: symmetricBonusPerAct,
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

    const isCapBoosterOrNeut =
      !summary.isNosferatuBloodRaiderOverriden &&
      !summary.isCapacitorTransmitter &&
      !summary.isNosferatu;

    return isCapBoosterOrNeut ? 1 : rangeModifier;
  };

  static simulateActivationCapUse = (summary) => {
    const capacitorState =
      summary.load.capacitor || summary.root.summary.load.capacitor;
    const state = summary.activationState;
    const info = summary.activationInfo;

    // MUTATION!
    capacitorState.HP -= info.activationCost;
    state.activationLeft--;

    return summary;
  };
  static simulateActivation = (summary) => {
    const capacitorState =
      summary.load.capacitor || summary.root.summary.load.capacitor;
    const state = summary.activationState;
    const info = summary.activationInfo;

    // MUTATION!
    capacitorState.HP -= info.activationCost;
    state.activationLeft--;
    state.lastActivation = state.nextActivation;

    // Check if ammo left is 0, set time
    if (state.activationLeft === 0) {
      state.nextActivation =
        state.lastActivation + info.duration + info.reloadTime;
      state.activationLeft = info.activationLimit;
    } else
      state.nextActivation = Number(
        (state.lastActivation + info.duration).toFixed(10)
      );

    state.nextActivationTick = Math.floor(state.nextActivation);

    return summary;
  };
}
export class HAL {
  static getSchedules(summarizedSlots, target, tick) {
    HAL.getSchedules_setTarget(summarizedSlots, target);
    return Fit.mapSlots(
      summarizedSlots,
      (summarizedSlot) => {
        if (!summarizedSlot.summary) return false;
        return HAL.#getSchedules_getFragment(summarizedSlot.summary, tick);
      },
      {
        isIterate: {
          highSlots: true,
          midSlots: true,
          lowSlots: true,
          droneSlots: true,
        },
      }
    )
      .reduce((acc, fragment) => {
        if (!fragment) return acc;
        return acc.concat(fragment);
      }, [])
      .sort((a, b) => a.time - b.time);
  }
  static getSchedules_setTarget = (summarizedSlots, target) => {
    Fit.mapSlots(
      summarizedSlots,
      (summarizedSlot) => {
        if (!summarizedSlot.summary) return false;
        let newTarget = false;
        switch (summarizedSlot?.summary?.operation) {
          case "damage":
          case "capacitor":
          case "defense":
            newTarget = target;
            break;

          default:
            newTarget = false;
            break;
        }
        summarizedSlot.summary["target"] = newTarget;
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
  static #getSchedules_getFragment = (summary, tick) => {
    const _summary = HAL.#getSchedules_copySummary(summary);
    const fragment = HAL.#getSchedules_getFragmentRecursion(_summary, tick);
    return fragment.map((schedule) => {
      schedule["summary"] = summary;
      return schedule;
    });
  };
  static #getSchedules_copySummary = (summary) => {
    const _summary = JSON.parse(
      JSON.stringify({ ...summary, root: undefined, target: undefined })
    );
    if (!!_summary?.activationState)
      Object.keys(_summary.activationState).forEach((key) => {
        if (_summary.activationState[key] === null)
          // MUTATION!!
          _summary.activationState[key] = Infinity;
      });
    if (!!_summary?.activationInfo)
      Object.keys(_summary.activationInfo).forEach((key) => {
        if (_summary.activationInfo[key] === null)
          // MUTATION!!
          _summary.activationInfo[key] = Infinity;
      });

    return _summary;
  };
  static #getSchedules_getFragmentRecursion = (summary, tick) => {
    if (
      !summary?.activationState?.isActive ||
      summary?.activationState?.nextActivationTick !== tick
    )
      return [];
    const currentTime = summary.activationState.nextActivation;
    const state = summary.activationState;
    const info = summary.activationInfo;
    //prettier-ignore TODO: for testing, check tick is okay
    if (state.isActive && state.nextActivationTick < tick)
      console.warn("ERR: Tick is not in sync");

    // MUTATION!
    state.activationLeft--;
    state.lastActivation = state.nextActivation;

    // Check if ammo left is 0, set time
    if (state.activationLeft === 0) {
      state.nextActivation =
        state.lastActivation + info.duration + info.reloadTime;
      state.activationLeft = info.activationLimit;
    } else
      state.nextActivation = Number(
        (state.lastActivation + info.duration).toFixed(10)
      );

    state.nextActivationTick = Math.floor(state.nextActivation);

    // Check if next activation is in same tick
    let subSecSchedule = [];
    if (state.nextActivationTick === tick)
      subSecSchedule = HAL.#getSchedules_getFragmentRecursion(summary, tick);

    return [{ time: currentTime }, ...subSecSchedule];
  };

  static manageSchedules(schedules, summarizedSlot, location) {
    schedules.forEach((schedule) => {
      if (!HAL.manageSchedules_validate(schedule.summary)) {
        // MUTATION!
        schedule.summary.activationState.isActive = false;
        if (schedule.summary.operation === "resistance")
          // Summary.updateSummaries(summarizedSlot, location); deprecated.

          return;
      } // TODO: loop through schedules with tick is moving

      HAL.#manageSchedules_executeSchedule(schedule);
    });
  }
  static #manageSchedules_executeSchedule = (schedule) => {
    Simulator.simulateActivation(schedule.summary);
    switch (schedule.summary.operation) {
      case "damage":
        Simulator.activateDamage(schedule.summary);
        break;
      case "defense":
        Simulator.activateDefense(schedule.summary);
        break;
      case "capacitor":
        Simulator.activateCapacitor(schedule.summary);
        break;
      default:
        break;
    }
  };
  static manageSchedules_validate(summary) {
    if (!summary || !summary.activationState.isActive) return false;

    const isCapacitorValidated = HAL.manageSchedules_validateCapacitor(summary);
    const isStructureValidated = HAL.manageSchedules_validateStructure(summary);
    if (!isCapacitorValidated || !isStructureValidated) return false;

    return true;
  }
  static manageSchedules_validateCapacitor(summary) {
    const activationInfo = summary.activationInfo;
    const capacitorState =
      summary?.load?.capacitor || summary.root.summary.load.capacitor;

    if (capacitorState.HP < activationInfo.activationCost) return false;
    else return true;
  }
  static manageSchedules_validateStructure(summary) {
    const structureHP = summary?.load?.structure?.HP;
    const rootStructureHP = summary.root.summary.load.structure.HP;

    if (structureHP <= 0 || rootStructureHP <= 0) return false;
    else return true;
  }

  // currently on halt. no ai included
  static manageActivation(summarizedSlots, tick) {
    // Find out current tick's cap usage amount
    const capUsage = 0;
    Fit.mapSlots(
      summarizedSlots,
      (summarizedSlot) => {
        if (summarizedSlot.summary.activationState.nextActivationTick != tick)
          return false;

        capUsage += summarizedSlot.summary.activationInfo.activationCost;
      },
      {
        isIterate: {
          highSlots: true,
          midSlots: true,
          lowSlots: true,
        },
      }
    );

    if (
      summarizedSlots.summary.load.capacitor.HP - capUsage <
      summarizedSlots.summary.capacity.capacitor.HP * 0.3
    )
      return;
  }
  static manageActivation_getCapUsageLevels = (summarizedSlots) => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((activationPriority) => {
      const capUsageRates = [];
      Fit.mapSlots(
        summarizedSlots,
        (slot) => {
          const info = slot?.summary?.activationInfo;
          const state = slot?.summary?.activationState;
          if (!info || !state || state.activationPriority > activationPriority)
            return 0;
          const capUsageRate = info.activationCost / info.duration || 0;
          capUsageRates.push({ capUsageRate, slot });
        },
        {
          isIterate: {
            highSlots: true,
            midSlots: true,
            lowSlots: true,
          },
        }
      );

      return { activationPriority, capUsageRates };
    });
  };
}
