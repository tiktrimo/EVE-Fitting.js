import Fit from "../../../../fitter/src/Fit";
import EveMath from "./EveMath";
import Summary from "./Summary";

export default class Simulator {
  static test(slots, fit1, situation) {
    /* let stack = 0;
    const owner = { summary: { load: { capacitor: { HP: 2000 } } } };
    const summary = {
      activationState: {
        isActive: true,
        lastActivation: 0,
        nextActivation: 0,
        nextActivationTick: 0,
        activationLeft: 30,
      },
      activationInfo: {
        duration: 0.2765,
        reloadTime: 10,
        activationLimit: 30,
      },
    };
    for (let i = 0; i < 100; i++) {
      const activation = Simulator.manageActivationState(owner, summary, i);
      stack += activation.length;
      console.log(
        activation.length,
        activation,
        activation?.[activation.length - 1]?.time
      );
    } */
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
    const numOfActivation = Simulator.simulateActivation(owner,summary,tick).length;
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
    const numOfActivation = Simulator.simulateActivation(owner,summary,tick).length;
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
    const numOfActivation = Simulator.simulateActivation(owner,summary,tick).length;
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

  static simulateActivation = (owner, summary, tick) => {
    const currentTime = summary.activationState.nextActivation;
    const state = summary.activationState;
    const info = summary.activationInfo;
    if (state.isActive && state.nextActivationTick < tick)
      console.warn("ERR: Tick is not in sync"); //TODO: for testing, check tick is okay
    if (!state.isActive || state.nextActivationTick !== tick) return [];
    //prettier-ignore
    const activationCost = Simulator.#simulateActivation_capcitor(owner, summary);
    if (activationCost === false) {
      state.isActive = false; // TODO: for testing, auto off if capacitor is out. make ai control capacitor
      return [];
    }

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
    let subSecActivation = [];
    if (state.nextActivationTick === tick)
      subSecActivation = Simulator.simulateActivation(owner, summary, tick);

    return [{ time: currentTime, summary }, ...subSecActivation];
  };
  static #simulateActivation_capcitor = (summary) => {
    const activationInfo = summary.activationInfo;
    const capacitorState =
      summary.load.capacitor || summary.root.load.capacitor;
    if (capacitorState.HP < activationInfo.activationCost) return false;

    // MUTATION!
    capacitorState.HP -= activationInfo.activationCost;

    return activationInfo.activationCost;
  };
}
class HAL {
  static manageSchedules(schedules) {
    schedules.forEach((schedule) => {
      switch (schedule.summary.operation) {
        case "damage":
          Simulator.activateDamage(
            schedule.summary,
            schedule.summary.root,
            schedule.summary.target
          );
      }
    });
  }
  static manageSchedules_validateCapacitor(summary) {
    const activationInfo = summary.activationInfo;
    const capacitorState =
      summary?.load?.capacitor || summary.root.load.capacitor;

    if (capacitorState.HP < activationInfo.activationCost) return false;
    else return true;
  }
  static manageSchedules_validateStructure(summary) {
    const structureHP = summary?.load?.structure?.HP;
    const rootStructureHP = summary.root.load.structure.HP;

    if (structureHP <= 0 || rootStructureHP <= 0) return false;
    else return true;
  }

  static getSchedules(slots, target, tick) {
    HAL.#getSchedules_setTarget(slots, target);
    return Fit.mapSlots(
      slots,
      (slot) => {
        if (!slot.item) return false;

        return HAL.#getSchedules_getFragment(slot, tick);
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
  static #getSchedules_setTarget = (slots, target) => {
    Fit.mapSlots(
      slots,
      (slot) => {
        let _target = false;
        switch (slot?.summary?.operation) {
          case "damage":
          case "defense":
          case "capacitor":
            _target = target;
            break;
          default:
            _target = false;
            break;
        }
        slot.summary["target"] = _target;
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
    const _summary = JSON.parse(JSON.stringify(summary));
    const fragment = HAL.#getSchedules_getFragmentRecursion(_summary, tick);
    return fragment.map((schedule) => {
      schedule["summary"] = summary;
      return schedule;
    });
  };
  static #getSchedules_getFragmentRecursion = (summary, tick) => {
    const currentTime = summary.activationState.nextActivation;
    const state = summary.activationState;
    const info = summary.activationInfo;
    if (!state.isActive || state.nextActivationTick !== tick) return [];
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
}
