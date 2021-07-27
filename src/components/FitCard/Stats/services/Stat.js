import { findAttributebyID } from "../../../../services/dataManipulation/findAttributes";
import Fit from "../../../../fitter/src/Fit";

export default class Stat {
  static defaultStat = {
    damage: {
      turretLauncherDamage: { max: 0, effective: 0, alpha: 0 },
      turretLauncherRange: [],
      droneDamage: { max: 0, effective: 0, alpha: 0 },
    },
    defense: {
      resistance: {
        armor: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
        shield: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
        structure: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
      },
      active: {
        shieldBonus: 0,
        armorBonus: 0,
        structureBonus: 0,
      },
    },
    capacitor: {
      ambientChargeRate: 0,
      boosterChargeRate: 0,
      activationUseRate: 0,
      stableLevel: 0,
    },
    resource: {
      capacity: {
        turret: 0,
        launcher: 0,
        calibration: 0,
        droneBandwidth: 0,
        droneBay: 0,
        droneActive: 5,
      },
      load: {
        turret: 0,
        launcher: 0,
        calibration: 0,
        droneBandwidth: 0,
        droneBay: 0,
        droneActive: 0,
      },
    },
    engineering: {
      pg: { load: 0, output: 0 },
      cpu: { load: 0, output: 0 },
    },
    miscellaneous: {
      sensor: {
        scanResolution: 0,
        maximumLockedTarget: 0,
        maximumTargetingRange: 0,
        strength: {
          gravimetric: 0,
          magnetometric: 0,
          ladar: 0,
          radar: 0,
        },
      },
      propulsion: {
        inertialModifier: 0,
        maximumVelocity: 0,
        warpSpeedMultiplier: 0,
      },
      misc: {
        cargoBayCapacity: 0,
        signatureRadius: 0,
      },
    },
  };
  static stat(fit) {
    const propCapacitor = Stat.capacitor(fit);

    return {
      damage: Stat.damage(fit),
      defense: Stat.defense(fit),
      capacitor: {
        ...propCapacitor,
        stableLevel: Stat.capacitor_stableLevel(fit, propCapacitor),
      },
      engineering: Stat.engineering(fit),
      resource: Stat.resource(fit),
      miscellaneous: Stat.miscellaneous(fit),
    };
  }

  static damage(fit) {
    if (!fit.highSlots)
      return {
        turretLauncherDamage: { max: 0, effective: 0, alpha: 0 },
        turretLauncherRange: [],
        droneDamage: { max: 0, effective: 0, alpha: 0 },
      };

    const turrets = Stat.#damage_turrets(fit);
    const launchers = Stat.#damage_launchers(fit);
    const drones = Stat.#damage_drones(fit);

    const turretLauncherDamageSlots = [...turrets, ...launchers];
    const turretLauncherDamageSummaries = turretLauncherDamageSlots.map(
      (slot) => {
        return Stat.damage_getSummary(slot.item, slot.charge);
      }
    );
    const turretLauncherDamage = turretLauncherDamageSummaries.reduce(
      (acc, summary) => {
        const alpha = summary.damagePerAct.alpha;
        const maxDps = alpha / summary.activationInfo.duration || 0;
        const effectiveDps = alpha / summary.activationInfo.e_duration || 0;

        return {
          max: acc.max + maxDps,
          effective: acc.effective + effectiveDps,
          alpha: acc.alpha + alpha,
        };
      },
      { max: 0, effective: 0, alpha: 0 }
    );

    const turretLauncherRange = turretLauncherDamageSummaries.reduce(
      (acc, summary) => {
        const optimalRange = summary.range.optimalRange;
        const falloffRange = summary.range.falloffRange;

        const overlappingRange = acc.find(
          (range) =>
            range.optimalRange === optimalRange &&
            range.falloffRange === falloffRange
        );
        if (!!overlappingRange) overlappingRange.debug.push(summary.slot);
        else acc.push({ optimalRange, falloffRange, debug: [summary.slot] });
        return acc;
      },
      []
    );

    const droneSummaries = drones.map((drone) => {
      return Stat.damage_getSummary(drone.item, drone.item);
    });
    const droneDamage = droneSummaries.reduce(
      (acc, summary) => {
        const typeCount = summary.typeCount;
        const alpha = summary.damagePerAct.alpha;
        const maxDps = alpha / summary.activationInfo.duration || 0;
        const effectiveDps = alpha / summary.activationInfo.e_duration || 0;
        return {
          max: acc.max + maxDps * typeCount,
          effective: acc.effective + effectiveDps,
          alpha: acc.alpha + alpha,
        };
      },
      { max: 0, effective: 0, alpha: 0 }
    );

    const damageSummaries = [
      ...turretLauncherDamageSummaries,
      ...droneSummaries,
    ];

    return {
      turretLauncherDamage,
      turretLauncherRange,
      droneDamage,
      damageSummaries,
    };
  }
  static #damage_turrets = (fit) => {
    return Fit.mapSlots(
      fit,
      (slot) => {
        const isTurretFitted = !!slot?.item?.typeEffectsStats?.find(
          (efft) => efft.effectID === 42
        ); //effectID: 42, effectName: "turretFitted"
        const isActivated = slot.item.typeState === "activation";
        if (isTurretFitted && Fit.validateChargeSlot(slot) && isActivated)
          return slot;
        else return undefined;
      },
      { isIterate: { highSlots: true } }
    ).filter((slot) => !!slot);
  };
  static #damage_launchers = (fit) => {
    return Fit.mapSlots(
      fit,
      (slot) => {
        const isLauncherFitted = !!slot?.item?.typeEffectsStats?.find(
          (efft) => efft.effectID === 40
        ); //effectID: 40, effectName: "launcherFitted"
        const isActivated = slot.item.typeState === "activation";
        if (isLauncherFitted && Fit.validateChargeSlot(slot) && isActivated)
          return slot;
        else return undefined;
      },
      { isIterate: { highSlots: true } }
    ).filter((slot) => !!slot);
  };
  static #damage_drones = (fit) => {
    return Fit.mapSlots(
      fit,
      (slot) => {
        const isActivated = slot.item.typeState === "activation";
        if (isActivated) return slot;
        else return undefined;
      },
      { isIterate: { droneSlots: true } }
    ).filter((slot) => !!slot);
  };
  static damage_getSummary = (item, charge) => {
    if (!item) return false;

    const damagePerAct = Stat.damage_damagePerAct(item, charge);
    const activationInfo = Stat.getActivationInfo(item, charge);
    const range = Stat.damage_range(item, charge);
    const typeCount = item.typeCount;
    const slot = { item, charge };

    return { activationInfo, damagePerAct, range, typeCount, slot };
  };
  static damage_damagePerAct = (item, charge) => {
    const damageModifier = findAttributebyID(item, 64) || 1; //attributeID: 64, attributeName: "Damage Modifier"

    const EM_damage = findAttributebyID(charge, 114); //attributeID: 114, attributeName: "EM damage"
    const TH_damage = findAttributebyID(charge, 118); //attributeID: 118, attributeName: "Thermal damage"
    const KI_damage = findAttributebyID(charge, 117); //attributeID: 117, attributeName: "Kinetic damage"
    const EX_damage = findAttributebyID(charge, 116); //attributeID: 116, attributeName: "Explosive damage"
    const mergedDamage = EM_damage + TH_damage + KI_damage + EX_damage;

    const alpha = damageModifier * mergedDamage;

    return {
      alpha,
      EM: EM_damage * damageModifier,
      TH: TH_damage * damageModifier,
      KI: KI_damage * damageModifier,
      EX: EX_damage * damageModifier,
    };
  };
  static damage_range = (item, charge) => {
    const isTurretFitted = !!item?.typeEffectsStats?.find(
      (efft) => efft.effectID === 42
    ); //effectID: 42, effectName: "turretFitted"
    const isLauncherFitted = !!item?.typeEffectsStats?.find(
      (efft) => efft.effectID === 40
    ); //effectID: 40, effectName: "launcherFitted"
    const isDrone = item?.typeDroneSize !== undefined;

    if (isTurretFitted || isDrone) {
      const optimalRange = findAttributebyID(item, 54); //attributeID: 54, attributeName: "Optimal Range"
      const falloffRange = findAttributebyID(item, 158); //attributeID: 158, attributeName: "Accuracy falloff "
      const tracking = findAttributebyID(item, 160); // attributeID: 160, attributeName: "Turret Tracking"
      const signatureResolution = findAttributebyID(item, 620); // attributeID: 620, attributeName: "Signature Resolution"

      return { optimalRange, falloffRange, tracking, signatureResolution };
    } else if (isLauncherFitted) {
      const maximumVelocity = findAttributebyID(charge, 37); //attributeID: 37, attributeName: "Maximum Velocity"
      const filghtTime = findAttributebyID(charge, 281); //attributeID: 281, attributeName: "Maximum Flight Time"
      const optimalRange = maximumVelocity * (filghtTime / 1000);
      const explosionVelocity = findAttributebyID(charge, 653); // attributeID: 653, attributeName: "Explosion Velocity"
      const explosionRadius = findAttributebyID(charge, 654); // attributeID: 654, attributeName: "Explosion Radius"
      const damageReductionFactor = findAttributebyID(charge, 1353); // attributeID: 1353, attributeName: "aoeDamageReductionFactor"

      //prettier-ignore
      return { optimalRange, falloffRange: 0, explosionVelocity, explosionRadius, damageReductionFactor };
    } else return { optimalRange: 0, falloffRange: 0 };
  };

  static capacitor(fit) {
    if (!fit)
      return {
        ambientChargeRate: 0,
        boosterChargeRate: 0,
        activationUseRate: 0,
      };
    const debug = [];
    const slots = Fit.mapSlots(fit, (slot) => slot, {
      isIterate: {
        highSlots: true,
        midSlots: true,
        lowSlots: true,
      },
    });
    const activationUseRate = slots.reduce((acc, slot) => {
      const cus = Stat.#capacitor_getUseRate(slot);
      if (cus > 0)
        debug.push({
          typeName: slot.item.typeName,
          capacitorUsePerSec: cus,
          dominID: slot.item.domainID,
        });
      return acc + cus;
    }, 0);
    const ambientChargeRate = Stat.#capacitor_getAmbientChargeRate(fit, 25);
    const boosterChargeRate = Stat.#capacitor_getBoosterChargeRate(fit);
    debug.push({ activationUseRate, ambientChargeRate, boosterChargeRate });

    /* console.log(debug) */
    return { ambientChargeRate, boosterChargeRate, activationUseRate };
  }
  static capacitor_stableLevel(fit, propCapacitor = false) {
    if (!fit.ship?.typeID) return 0;
    const capacitor = !!propCapacitor ? propCapacitor : Stat.capacitor(fit);
    const Cmax = findAttributebyID(fit.ship, 482); //attributeID: 482, attributeName: "Capacitor Capacity"
    const Tnow = findAttributebyID(fit.ship, 55) / 1000; //attributeID: 55, attributeName: "Capacitor Recharge time"

    const capacitorDeltas = [];
    for (let i = 200; i < 1000 + 1; i++) {
      const Cnow = Cmax * (i / 1000);
      capacitorDeltas.push({
        capacitorLevel: i / 10,
        delta:
          Stat.getAmbientChargeRateMath(Cmax, Cnow, Tnow) +
          capacitor.boosterChargeRate -
          capacitor.activationUseRate,
      });
    }
    const positiveDeltas = capacitorDeltas
      .sort((a, b) => a.delta - b.delta)
      .filter((capacitorDelta) => capacitorDelta.delta >= 0);

    if (positiveDeltas[0] === undefined) return 0;
    else return positiveDeltas[0].capacitorLevel;
  }
  static #capacitor_getUseRate = (slot) => {
    if (slot.item.typeState !== "activation") return 0;

    const activationCost = findAttributebyID(slot.item, 6); // attributeID: 6, attributeName: "Activation Cost"
    if (activationCost === undefined) return 0;

    const activationInfo = Stat.getActivationInfo(slot.item, slot.charge);

    return activationCost / activationInfo.e_duration;
  };
  static #capacitor_getAmbientChargeRate = (fit, capacitorLevel) => {
    const chargeInfo = Stat.capacitor_getChargeInfo(fit);
    const Cmax = chargeInfo.HP;
    const Tchg = chargeInfo.bonusRate;
    const Cnow = (Cmax * capacitorLevel) / 100;

    return Stat.getAmbientChargeRateMath(Cmax, Cnow, Tchg);
  };
  static capacitor_getChargeInfo = (fit) => {
    const HP = findAttributebyID(fit.ship, 482) || 0; //attributeID: 482, attributeName: "Capacitor Capacity"
    const bonusRate = findAttributebyID(fit.ship, 55) / 1000 || 0; //attributeID: 55, attributeName: "Capacitor Recharge time"

    return { HP, bonusRate };
  };
  static #capacitor_getBoosterChargeRate = (fit) => {
    const slots = Fit.mapSlots(fit, (slot) => slot, {
      isIterate: { midSlots: true },
    });
    const boosterSlots = slots.filter((slot) => {
      if (!slot?.item?.typeEffectsStats) return false;
      return slot.item.typeEffectsStats.find((efft) => efft.effectID === 48); // effectID: 48, effectName: "powerBooster"
    });

    return boosterSlots.reduce((acc, boosterSlot) => {
      //prettier-ignore
      const activationInfo = Stat.getActivationInfo(boosterSlot.item, boosterSlot.charge);
      //prettier-ignore
      const capacitorBonus = Stat.capacitor_getBonusPerAct_self(boosterSlot.item, boosterSlot.charge);
      const boostChargeRate = capacitorBonus / activationInfo.e_duration || 0;

      return acc + boostChargeRate;
    }, 0);
  };
  static capacitor_getBonusPerAct_self(item, charge) {
    if (!item || !charge) return { capacitorBonus: 0 };

    const bonusPerAct = findAttributebyID(charge, 67); //attributeID: 67, attributeName: "Capacitor Bonus"

    return bonusPerAct;
  }

  static defense(fit) {
    if (!fit || !fit.ship)
      return {
        resistance: {
          armor: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
          shield: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
          structure: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
        },
        active: {
          shieldBonus: 0,
          armorBonus: 0,
          structureBonus: 0,
        },
      };
    return {
      resistance: Stat.defense_resistance(fit),
      active: Stat.#defense_active(fit),
    };
  }
  static defense_resistance = (fit) => {
    if (!fit.ship || !fit.ship.typeAttributesStats)
      return {
        armor: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
        shield: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
        structure: { HP: 0, EM: 0, TH: 0, KI: 0, EX: 0 },
      };

    const shipAttrs = fit.ship.typeAttributesStats;

    const armorHP = shipAttrs.find((attr) => attr.attributeID === 265);
    const armorEM = shipAttrs.find((attr) => attr.attributeID === 267);
    const armorTH = shipAttrs.find((attr) => attr.attributeID === 270);
    const armorKI = shipAttrs.find((attr) => attr.attributeID === 269);
    const armorEX = shipAttrs.find((attr) => attr.attributeID === 268);

    const shieldHP = shipAttrs.find((attr) => attr.attributeID === 263);
    const shieldEM = shipAttrs.find((attr) => attr.attributeID === 271);
    const shieldTH = shipAttrs.find((attr) => attr.attributeID === 274);
    const shieldKI = shipAttrs.find((attr) => attr.attributeID === 273);
    const shieldEX = shipAttrs.find((attr) => attr.attributeID === 272);
    const shieldChargeRate =
      shipAttrs.find((attr) => attr.attributeID === 479).value / 1000 || 0; // attributeID: 479, attributeName: "Shield recharge time"

    const structureHP = shipAttrs.find((attr) => attr.attributeID === 9);
    const structureEM = shipAttrs.find((attr) => attr.attributeID === 113);
    const structureTH = shipAttrs.find((attr) => attr.attributeID === 110);
    const structureKI = shipAttrs.find((attr) => attr.attributeID === 109);
    const structureEX = shipAttrs.find((attr) => attr.attributeID === 111);

    return {
      armor: {
        HP: armorHP.value,
        EM: Stat.#defense_resistance_decimal_fix(armorEM),
        TH: Stat.#defense_resistance_decimal_fix(armorTH),
        KI: Stat.#defense_resistance_decimal_fix(armorKI),
        EX: Stat.#defense_resistance_decimal_fix(armorEX),
      },
      shield: {
        HP: shieldHP.value,
        EM: Stat.#defense_resistance_decimal_fix(shieldEM),
        TH: Stat.#defense_resistance_decimal_fix(shieldTH),
        KI: Stat.#defense_resistance_decimal_fix(shieldKI),
        EX: Stat.#defense_resistance_decimal_fix(shieldEX),
        bonusRate: shieldChargeRate,
      },
      structure: {
        HP: structureHP.value,
        EM: Stat.#defense_resistance_decimal_fix(structureEM),
        TH: Stat.#defense_resistance_decimal_fix(structureTH),
        KI: Stat.#defense_resistance_decimal_fix(structureKI),
        EX: Stat.#defense_resistance_decimal_fix(structureEX),
      },
    };
  };
  static #defense_resistance_decimal_fix = (attr) => {
    return 100 - attr.value * 100;
  };
  static defense_getSummary = (item, charge) => {
    if (!item) return false;

    const activationInfo = Stat.getActivationInfo(item, charge);
    const bonusPerAct = Stat.defense_getBonusPerAct(item, charge);
    const slot = { item, charge };

    return { activationInfo, bonusPerAct, slot };
  };
  static defense_getBonusPerAct = (item, charge) => {
    if (!item) return { shieldBonus: 0, armorBonus: 0, structureBonus: 0 };

    const shield = findAttributebyID(item, 68) || 0; //attributeID: 68, attributeName: "Shield Bonus"
    const armor = findAttributebyID(item, 84) || 0; //attributeID: 84, attributeName: "Armor Hitpoints Repaired"
    const structure = findAttributebyID(item, 83) || 0; //attributeID: 83, attributeName: "Structure Hitpoints Repaired"

    return { shield, armor, structure };
  };
  static #defense_active = (fit) => {
    const active = {
      shieldBonus: 0,
      armorBonus: 0,
      structureBonus: 0,
    };
    if (!fit.ship || !fit.ship.typeAttributesStats) return active;

    Fit.mapSlots(
      fit,
      (slot) => {
        if (!slot.item.typeAttributesStats) return;
        const activationTime = findAttributebyID(slot.item, 73); //attributeID: 73, attributeName: "Activation time / duration"

        const shieldBonus = findAttributebyID(slot.item, 68); //attributeID: 68, attributeName: "Shield Bonus"
        if (!!shieldBonus) {
          active.shieldBonus += (shieldBonus / activationTime) * 1000;
          return;
        }
        const armorBonus = findAttributebyID(slot.item, 84); //attributeID: 84, attributeName: "Armor Hitpoints Repaired"
        if (!!armorBonus) {
          active.armorBonus += (armorBonus / activationTime) * 1000;
          return;
        }
        const structureBonus = findAttributebyID(slot.item, 83); //attributeID: 83, attributeName: "Structure Hitpoints Repaired"
        if (!!structureBonus) {
          active.structureBonus += (structureBonus / activationTime) * 1000;
          return;
        }
      },
      {
        isIterate: { midSlots: true, lowSlots: true },
      }
    );
    return active;
  };

  static engineering(fit) {
    if (!fit.ship?.typeID)
      return {
        pg: { load: 0, output: 0 },
        cpu: { load: 0, output: 0 },
      };

    const pgLoad = findAttributebyID(fit.ship, 15); // attributeID: 15, attributeName: "Power Load"
    const pgOutput = findAttributebyID(fit.ship, 11); //attributeID: 11, attributeName: "Powergrid Output"
    const cpuLoad = findAttributebyID(fit.ship, 49); // attributeID: 49, attributeName: "CPU Load"
    const cpuOutput = findAttributebyID(fit.ship, 48); //attributeID: 48, attributeName: "CPU Output"

    return {
      pg: { load: Number(pgLoad.toFixed(1)), output: pgOutput },
      cpu: { load: Number(cpuLoad.toFixed(1)), output: cpuOutput },
    };
  }

  static resource(fit) {
    if (!fit.ship || !fit.ship.typeAttributesStats)
      return {
        capacity: {
          turret: 0,
          launcher: 0,
          calibration: 0,
          droneBandwidth: 0,
          droneBay: 0,
          droneActive: 5,
        },
        load: {
          turret: 0,
          launcher: 0,
          calibration: 0,
          droneBandwidth: 0,
          droneBay: 0,
          droneActive: 0,
        },
      };

    const turretHardpoint = findAttributebyID(fit.ship, 102); //attributeID: 102, attributeName: "Turret Hardpoints"
    const launcherHardpoint = findAttributebyID(fit.ship, 101); //attributeID: 101, attributeName: "Launcher Hardpoints";
    const calibration = findAttributebyID(fit.ship, 1132); //attributeID: 1132, attributeName: "Calibration"
    const droneCapacity = findAttributebyID(fit.ship, 283); //attributeID: 283, attributeName: "Drone Capacity"
    const droneBandwidth = findAttributebyID(fit.ship, 1271); //ttributeID: 1271, attributeName: "Drone Bandwidth"

    const mountedTurrets = fit.highSlots.reduce((acc, slot) => {
      const isTurretFitted = !!slot?.item?.typeEffectsStats?.find(
        (efft) => efft.effectID === 42
      ); //effectID: 42, effectName: "turretFitted"
      return isTurretFitted && slot.item.typeState !== "offline" ? ++acc : acc;
    }, 0);
    const mountedLaunchers = fit.highSlots.reduce((acc, slot) => {
      const isLauncherFitted = !!slot?.item?.typeEffectsStats?.find(
        (efft) => efft.effectID === 40
      ); //effectID: 40, effectName: "launcherFitted"
      return isLauncherFitted && slot.item.typeState !== "offline"
        ? ++acc
        : acc;
    }, 0);
    const mountedCalibration = fit.rigSlots.reduce((acc, slot) => {
      const calibration = findAttributebyID(slot.item, 1153); //attributeID: 1153, attributeName: "Calibration cost"
      return !!calibration && slot.item.typeState !== "offline"
        ? acc + calibration
        : acc;
    }, 0);
    const mountedDroneBandwidth = fit.droneSlots.reduce((acc, slot) => {
      const droneBandwidth = findAttributebyID(slot.item, 1272); //attributeID: 1272, attributeName: "Bandwidth Needed"
      return !!droneBandwidth && slot.item.typeState === "activation"
        ? acc + droneBandwidth * slot.item.typeCount
        : acc;
    }, 0);
    const mountedDronebay = fit.droneSlots.reduce((acc, slot) => {
      const droneVolume = slot.item.volume;
      return !!droneVolume && slot.item.typeState !== "offline"
        ? acc + droneVolume * slot.item.typeCount
        : acc;
    }, 0);
    const droneActive = fit.droneSlots.reduce((acc, slot) => {
      if (slot.item.typeState === "activation")
        return acc + (slot.item.typeCount || 0);
      return acc;
    }, 0);

    return {
      capacity: {
        turret: turretHardpoint,
        launcher: launcherHardpoint,
        calibration: calibration,
        droneBay: droneCapacity,
        droneBandwidth: droneBandwidth,
        droneActive: 5,
      },
      load: {
        turret: mountedTurrets,
        launcher: mountedLaunchers,
        calibration: mountedCalibration,
        droneBay: mountedDronebay,
        droneBandwidth: mountedDroneBandwidth,
        droneActive: droneActive,
      },
    };
  }

  static miscellaneous(fit) {
    if (!fit?.ship?.typeID)
      return {
        sensor: {
          scanResolution: 0,
          maximumLockedTarget: 0,
          maximumTargetingRange: 0,
          strength: {
            gravimetric: 0,
            magnetometric: 0,
            ladar: 0,
            radar: 0,
          },
        },
        propulsion: {
          inertialModifier: 0,
          maximumVelocity: 0,
          warpSpeedMultiplier: 0,
        },
        misc: {
          cargoBayCapacity: 0,
          signatureRadius: 0,
        },
      };

    const ship = fit.ship;

    const scanResolution = findAttributebyID(ship, 564); //attributeID: 564, attributeName: "Scan Resolution"
    const signatureRadius = findAttributebyID(ship, 552); //attributeID: 552, attributeName: "Signature Radius"

    const gravimetricSensorStrength = findAttributebyID(ship, 211); //attributeID: 211, attributeName: "Gravimetric Sensor Strength"
    const magnetometricSensorStrength = findAttributebyID(ship, 210); //attributeID: 210, attributeName: "Magnetometric Sensor Strength"
    const ladarSensorStrength = findAttributebyID(ship, 209); // attributeID: 209, attributeName: "Ladar Sensor Strength"
    const radarSensorStrength = findAttributebyID(ship, 208); //attributeID: 208, attributeName: "RADAR Sensor Strength"
    const maximumLockedTarget = findAttributebyID(ship, 192); //attributeID: 192, attributeName: "Maximum Locked Targets"
    const maximumTargetingRange = findAttributebyID(ship, 76); // attributeID: 76, attributeName: "Maximum Targeting Range"

    const inertialModifier = findAttributebyID(ship, 70); // attributeID: 70, attributeName: "Inertia Modifier"
    const maximumVelocity = Stat.#miscellaneous_maximumVelocity(fit);
    const warpSpeedMultiplier = findAttributebyID(ship, 600); //attributeID: 600, attributeName: "Warp Speed Multiplier"

    const cargoBayCapacity = findAttributebyID(ship.capacity);

    return {
      sensor: {
        scanResolution,
        maximumLockedTarget,
        maximumTargetingRange,
        strength: {
          gravimetric: gravimetricSensorStrength,
          magnetometric: magnetometricSensorStrength,
          ladar: ladarSensorStrength,
          radar: radarSensorStrength,
        },
      },
      propulsion: {
        inertialModifier,
        maximumVelocity,
        warpSpeedMultiplier,
      },
      misc: {
        signatureRadius,
        cargoBayCapacity,
      },
    };
  }
  static #miscellaneous_maximumVelocity = function (fit) {
    const activePropulsionModules = Fit.mapSlots(
      fit,
      (slot) => {
        const isPropulsionModule = !!slot.item?.typeEffectsStats?.find((efft) =>
          [6730, 6731].includes(efft.effectID)
        ); // effectID: 6731, effectName: "moduleBonusAfterburner"
        // effectID: 6730, effectName: "moduleBonusMicrowarpdrive"
        const isActive = slot.item.typeState === "activation";

        if (isActive && isPropulsionModule) return slot.item;
        else return undefined;
      },
      { isIterate: { midSlots: true } }
    ).filter((slot) => !!slot);
    const shipBaseMaximumVelocity = findAttributebyID(fit.ship, 37); //attributeID: 37, attributeName: "Maximum Velocity"
    if (activePropulsionModules.length === 0) return shipBaseMaximumVelocity;

    //prettier-ignore
    const propModuleMaximumVelocityBonusMul = findAttributebyID( activePropulsionModules[0], 20) / 100 // attributeID: 20, attributeName: "Maximum Velocity Bonus"
    const propModuleThrust = findAttributebyID(activePropulsionModules[0], 567); // attributeID: 567, attributeName: "Thrust",

    const propModuleMassAdd = propModuleThrust / 3;
    const shipMass = findAttributebyID(fit.ship, 4); // attributeID: 4, attributeName: "Mass";
    const mass =
      Fit.mapSlots(fit, (slot) => slot, {
        isIterate: {
          highSlots: true,
          midSlots: true,
          lowSlots: true,
        },
      }).reduce((acc, slot) => {
        if (!!slot.item.mass) return acc + slot.item.mass;
        return acc;
      }, 0) +
      propModuleMassAdd +
      shipMass;

    const shipAppliedMaximumVelocity =
      shipBaseMaximumVelocity *
      (1 + (propModuleMaximumVelocityBonusMul * propModuleThrust) / mass);

    return shipAppliedMaximumVelocity;
  };

  static getActivationInfo(item, charge) {
    if (!item)
      return {
        duration: Infinity,
        e_duration: Infinity,
        activationLimit: 0,
        reloadTime: 0,
        activationCost: 0,
      };

    const activationCost = findAttributebyID(item, 6) || 0; //attributeID: 6, attributeName: "Activation Cost"
    const reloadTime = (findAttributebyID(item, 1795) || undefined) / 1000; //attributeID: 1795, attributeName: "Reload Time"
    const activationTime =
      (findAttributebyID(item, 73) || findAttributebyID(item, 51)) / 1000; // attributeID: 73, attributeName: "Activation time / duration" attributeID: 51, attributeName: "Rate of fire"

    if (!reloadTime || !Stat.#getActivationInfo_isTypeNeedCharge(item))
      return {
        duration: activationTime,
        e_duration: activationTime,
        activationLimit: Infinity,
        reloadTime: 0,
        activationCost,
      };
    if (!Fit.validateChargeSlot({ item, charge }))
      return {
        duration: Infinity,
        e_duration: Infinity,
        activationLimit: 0,
        reloadTime: 0,
        activationCost,
      };

    const itemCapacity = item.capacity;
    const chargeVolume = charge.volume;
    const chargePerCycle = findAttributebyID(item, 56); //attributeID: 56, attributeName: "Charges Per Cycle"

    const chargeVolumePerAct = !!chargePerCycle
      ? chargeVolume * chargePerCycle
      : 0;
    const activationLimit = Math.floor(itemCapacity / chargeVolumePerAct);
    const reloadTimePerAct =
      !!reloadTime && !!itemCapacity && !!chargeVolume
        ? reloadTime / activationLimit
        : 0;
    const EactivationTime = activationTime + reloadTimePerAct;

    return {
      duration: activationTime,
      e_duration: EactivationTime,
      activationLimit,
      reloadTime,
      activationCost,
    };
  }
  static #getActivationInfo_isTypeNeedCharge = (type) => {
    if (!type || !type.typeEffectsStats) return false;

    //TODO: Add command burst effectIDs
    //effectID: 42, effectName: "turretFitted"
    //effectID: 40, effectName: "launcherFitted"
    //effectID: 48, effectName: "powerBooster"
    const thisEffectsNeedCharge = [42, 40, 48];

    return type.typeEffectsStats.reduce((acc, efft) => {
      if (thisEffectsNeedCharge.includes(efft.effectID)) return true;
      return acc;
    }, false);
  };

  static getAmbientChargeRateMath = (Cmax, Cnow, Tchg) => {
    return ((10 * Cmax) / Tchg) * (Math.sqrt(Cnow / Cmax) - Cnow / Cmax) || 0;
  };
}
