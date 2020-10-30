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
      scanResolution: 0,
      signatureRadius: 0,
      maximumLockedTarget: 0,
      maximumTargetingRange: 0,
      sensorStrength: {
        gravimetric: 0,
        magnetometric: 0,
        ladar: 0,
        radar: 0,
      },
      inertialModifier: 0,
      maximumVelocity: 0,
      warpSpeedMultiplier: 0,

      cargoBayCapacity: 0,
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
    const turretLauncherDamage = turretLauncherDamageSlots.reduce(
      (acc, slot) => {
        const damage = Stat.#damage_getDamage(slot.item, slot.charge);

        return {
          max: acc.max + damage.max,
          effective: acc.effective + damage.effective,
          alpha: acc.alpha + damage.alpha,
        };
      },
      { max: 0, effective: 0, alpha: 0 }
    );

    const turretLauncherRange = Stat.#damage_range(turrets, launchers);

    const droneDamage = drones.reduce(
      (acc, slot) => {
        const damage = Stat.#damage_getDamage(slot.item, slot.item);
        const typeCount = slot.item.typeCount;
        return {
          max: acc.max + damage.max * typeCount,
          practical: acc.effective + damage.effective * typeCount,
          alpha: acc.alpha + damage.alpha,
        };
      },
      { max: 0, effective: 0, alpha: 0 }
    );

    return { turretLauncherDamage, turretLauncherRange, droneDamage };
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
  static #damage_getDamage = (item, charge) => {
    const rateOfFire = Stat.getActivationTime(item, charge);
    const alphaDamage = Stat.#damage_alphaDamage(item, charge);

    const dps = alphaDamage / rateOfFire.max || 0;
    const Edps = alphaDamage / rateOfFire.effective || 0;
    return { max: dps, effective: Edps, alpha: alphaDamage };
  };
  static #damage_alphaDamage = (item, charge) => {
    const damageModifier = findAttributebyID(item, 64); //attributeID: 64, attributeName: "Damage Modifier"

    const EM_damage = findAttributebyID(charge, 114); //attributeID: 114, attributeName: "EM damage"
    const TH_damage = findAttributebyID(charge, 118); //attributeID: 118, attributeName: "Thermal damage"
    const KI_damage = findAttributebyID(charge, 117); //attributeID: 117, attributeName: "Kinetic damage"
    const EX_damage = findAttributebyID(charge, 116); //attributeID: 116, attributeName: "Explosive damage"
    const mergedDamage = EM_damage + TH_damage + KI_damage + EX_damage;
    const damagePerShot = !!damageModifier
      ? damageModifier * mergedDamage
      : mergedDamage;

    return damagePerShot;
  };
  static #damage_range = (turrets, launchers) => {
    const turretRange = turrets.reduce((acc, slot) => {
      const optimalRange = findAttributebyID(slot.item, 54); //attributeID: 54, attributeName: "Optimal Range"
      const falloffRange = findAttributebyID(slot.item, 158); //attributeID: 158, attributeName: "Accuracy falloff "
      if (!optimalRange || !falloffRange) return acc;

      const overlappingRange = acc.find(
        (range) =>
          range.optimalRange === optimalRange &&
          range.falloffRange === falloffRange
      );
      if (!!overlappingRange) overlappingRange.debug.push(slot);
      else acc.push({ optimalRange, falloffRange, debug: [slot] });
      return acc;
    }, []);
    const launcherRange = launchers.reduce((acc, slot) => {
      const maximumVelocity = findAttributebyID(slot.charge, 37); //attributeID: 37, attributeName: "Maximum Velocity"
      const filghtTime = findAttributebyID(slot.charge, 281); //attributeID: 281, attributeName: "Maximum Flight Time"
      if (!maximumVelocity || !filghtTime) return acc;

      const optimalRange = maximumVelocity * (filghtTime / 1000);
      const overlappingRange = acc.find(
        (range) => range.optimalRange === optimalRange
      );
      if (!!overlappingRange) overlappingRange.debug.push(slot);
      else acc.push({ optimalRange, falloffRange: 0, debug: [slot] });
      return acc;
    }, []);
    const turretLauncherRange = [...turretRange, ...launcherRange];

    return turretLauncherRange;
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
          Stat.#capacitor_getAmbientChargeRateMath(Cmax, Cnow, Tnow) +
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

    const activationTime = Stat.getActivationTime(slot.item, slot.charge);

    return activationCost / activationTime.effective;
  };
  static #capacitor_getAmbientChargeRate = (fit, capacitorLevel) => {
    const Cmax = findAttributebyID(fit.ship, 482); //attributeID: 482, attributeName: "Capacitor Capacity"
    const Tnow = findAttributebyID(fit.ship, 55) / 1000; //attributeID: 55, attributeName: "Capacitor Recharge time"
    const Cnow = (Cmax * capacitorLevel) / 100;

    return Stat.#capacitor_getAmbientChargeRateMath(Cmax, Cnow, Tnow);
  };
  static #capacitor_getBoosterChargeRate = (fit) => {
    const slots = Fit.mapSlots(fit, (slot) => slot, {
      isIterate: { midSlots: true },
    });
    const boosterSlots = slots.filter((slot) => {
      if (!slot?.item?.typeEffectsStats) return false;
      return slot.item.typeEffectsStats.find((efft) => efft.effectID === 48); //effectID: 48, effectName: "powerBooster"
    });

    return boosterSlots.reduce((acc, boosterSlot) => {
      //prettier-ignore
      const activationTime = Stat.getActivationTime(boosterSlot.item, boosterSlot.charge);
      //prettier-ignore
      const capacitorBonus = findAttributebyID(boosterSlot.charge, 67); //attributeID: 67, attributeName: "Capacitor Bonus"
      const boostChargeRate = capacitorBonus / activationTime.effective || 0;

      return acc + boostChargeRate;
    }, 0);
  };
  static #capacitor_getAmbientChargeRateMath = (Cmax, Cnow, Tnow) => {
    return ((10 * Cmax) / Tnow) * (Math.sqrt(Cnow / Cmax) - Cnow / Cmax) || 0;
  };

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
      resistance: Stat.#defense_resistance(fit),
      active: Stat.#defense_active(fit),
    };
  }
  static #defense_resistance = (fit) => {
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
    if (!fit.ship)
      return {
        scanResolution: 0,
        signatureRadius: 0,
        maximumLockedTarget: 0,
        maximumTargetingRange: 0,
        sensorStrength: {
          gravimetric: 0,
          magnetometric: 0,
          ladar: 0,
          radar: 0,
        },
        inertialModifier: 0,
        maximumVelocity: 0,
        warpSpeedMultiplier: 0,

        cargoBayCapacity: 0,
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
      scanResolution,
      signatureRadius,
      maximumLockedTarget,
      maximumTargetingRange,
      sensorStrength: {
        gravimetric: gravimetricSensorStrength,
        magnetometric: magnetometricSensorStrength,
        ladar: ladarSensorStrength,
        radar: radarSensorStrength,
      },
      inertialModifier,
      maximumVelocity,
      warpSpeedMultiplier,
      cargoBayCapacity,
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

  static getActivationTime(item, charge) {
    if (!item) return { max: 0, effective: 0 };

    const reloadTime = findAttributebyID(item, 1795); //attributeID: 1795, attributeName: "Reload Time"
    const activationTime = findAttributebyID(item, 73); // attributeID: 73, attributeName: "Activation time / duration"
    const rateOfFire = findAttributebyID(item, 51); //attributeID: 51, attributeName: "Rate of fire"
    const TAV = !!activationTime ? activationTime : rateOfFire; // True Activation Time

    if (!reloadTime) return { max: TAV / 1000, effective: TAV / 1000 };

    const itemCapacity = item.capacity;
    const chargeVolume = charge.volume;
    const chargePerCycle = findAttributebyID(item, 56); //attributeID: 56, attributeName: "Charges Per Cycle"

    const chargeVolumePerAct = !!chargePerCycle
      ? chargeVolume * chargePerCycle
      : 0;
    const reloadTimePerAct =
      !!reloadTime && !!itemCapacity && !!chargeVolume
        ? reloadTime / Math.floor(itemCapacity / chargeVolumePerAct)
        : 0;
    const EactivationTime = TAV + reloadTimePerAct;

    if (!Stat.#getActivationTime_isTypeNeedCharge(item))
      return { max: TAV / 1000, effective: EactivationTime / 1000 };
    if (Fit.validateChargeSlot({ item, charge }))
      return { max: TAV / 1000, effective: EactivationTime / 1000 };
    else return { max: Infinity, effective: Infinity };
  }
  static #getActivationTime_isTypeNeedCharge = (type) => {
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
}
