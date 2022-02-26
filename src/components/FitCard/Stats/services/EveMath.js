export default class EveMath {
  static getAmbientChargeRateMath(Cmax, Cnow, Tchg) {
    return ((10 * Cmax) / Tchg) * (Math.sqrt(Cnow / Cmax) - Cnow / Cmax) || 0;
  }
  static getTurretAcurracy(summary, owner, target) {
    const onBoardVector = owner.summary.location.vector;
    const hostileVector = target.summary.location.vector;
    const distanceVector = {
      x:
        target.summary.location.anchors.anchor1X -
        owner.summary.location.anchors.anchor1X,
      y:
        target.summary.location.anchors.anchor1Y -
        owner.summary.location.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    const trackingValue =
      summary.range.tracking * (40000 / summary.range.signatureResolution);
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

    return (trackingModifier * rangeModifier).toFixed(3);
  }
  static getLauncherAccuracy(summary, owner, target) {
    const distanceVector = {
      x:
        target.summary.location.anchors.anchor1X -
        owner.summary.location.anchors.anchor1X,
      y:
        target.summary.location.anchors.anchor1Y -
        owner.summary.location.anchors.anchor1Y,
    };
    const distance =
      Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2)) /
      100;

    return summary.range.optimalRange < distance * 1000 ? 0 : 1;
  }
  static getDroneAccuracy(summary, owner, target) {
    // owner is owner of drone! which is ship
    const targetVelocity = EveMath.#common_getVelocity(target);
    const randomUnitVector = EveMath.#common_makeRandomUnitVector();
    const droneMWDvelocity = summary.capacity.propulsion.maximumVelocity;
    const droneOrbitVelocity = summary.capacity.propulsion.orbitVelocity;

    let drone = { summary: { location: {} } };
    // sentry drone is stationary
    if (summary.isSentry) {
      drone.summary.location = {
        ...owner.summary.location,
        vector: { x: 0, y: 0 },
      };
      return EveMath.getTurretAcurracy(summary, drone, target);
    }
    // drone is slower than target. In this case drone cant reach its turret range and cant hit the target
    if (droneMWDvelocity < targetVelocity) return 0;

    // TODO: This part is imaginary. If there is relible data change modifier value
    // drone is faster than target. Orbiting target. If target is faster than drone orbit speed modifier applied.
    drone.summary.location = {
      anchors: {
        anchor1X:
          target.summary.location.anchors.anchor1X +
          (randomUnitVector.y * summary.capacity.propulsion.orbitRange) / 10, // Currently 1px = 10m
        anchor1Y:
          target.summary.location.anchors.anchor1Y +
          (-randomUnitVector.x * summary.capacity.propulsion.orbitRange) / 10, // place the drone perpendicular to their speed vector. changed position of x and y is intentional
      },
      vector: {
        x: (randomUnitVector.x * droneOrbitVelocity) / 3, // Currently 1px = 3m/s
        y: (randomUnitVector.y * droneOrbitVelocity) / 3,
      },
    };

    const droneAccuracyModifier =
      droneOrbitVelocity < targetVelocity
        ? EveMath.#getDroneAccracy_getAccuracyModifier(summary, targetVelocity)
        : 1;

    return (
      droneAccuracyModifier * EveMath.getTurretAcurracy(summary, drone, target)
    );
  }

  static #getDroneAccracy_getAccuracyModifier = (summary, targetVelocity) => {
    // Estimated modifier - drone movement is too complicated simplify the location when target velocity is higher than orbit velocity
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
        Math.pow(target.summary.location.vector.x, 2) +
          Math.pow(target.summary.location.vector.y, 2)
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
        target.summary.location.anchors.anchor1X -
        owner.summary.location.anchors.anchor1X,
      y:
        target.summary.location.anchors.anchor1Y -
        owner.summary.location.anchors.anchor1Y,
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
      const perpendicularUnitVector =
        EveMath.#common_makeUnitVector(perpendicularVector);
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
    if ((vector.x === 0, vector.y === 0)) return { x: 1, y: 0 };

    const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    return { x: vector.x / length, y: vector.y / length };
  };
  static #common_makeRandomUnitVector = () => {
    const randomRadian = 2 * Math.PI * Math.random();
    return { x: Math.cos(randomRadian), y: Math.sin(randomRadian) };
  };
  static #common_getVelocity = (owner) => {
    // Currently 1px = 3m/s
    return (
      3 *
      Math.sqrt(
        Math.pow(owner.summary.location.vector.x, 2) +
          Math.pow(owner.summary.location.vector.y, 2)
      )
    );
  };
}
