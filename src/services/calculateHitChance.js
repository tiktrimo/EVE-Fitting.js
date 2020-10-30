export default function calculateHitChance(
  distance,
  distanceVector,
  onBoardVector,
  hostileVector,
  trackingValue,
  signatureRadius,
  optimalRange,
  fallOffRange
) {
  const _angularVelocity = angularVelocity(
    distance,
    distanceVector,
    onBoardVector,
    hostileVector
  );
  const _trackingPart = trackingPart(
    _angularVelocity,
    trackingValue,
    signatureRadius
  );

  const _distancePart = distancePart(optimalRange, fallOffRange, distance);

  return Math.pow(0.5, _trackingPart + _distancePart).toFixed(3);
}

function trackingPart(angularVelocity, trackingValue, signatureRadius) {
  const denominator = trackingValue * signatureRadius;
  const numerator = angularVelocity * 40000;
  return Math.pow(numerator / denominator, 2);
}
function distancePart(optimal, fallOff, distance) {
  const denominator = fallOff;
  const numerator = Math.max(0, distance * 1000 - optimal);
  return Math.pow(numerator / denominator, 2);
}

function angularVelocity(
  distance,
  distanceVector,
  onBoardVector,
  hostileVector
) {
  if (
    validateVector(distanceVector) &&
    validateVector(onBoardVector.vector) &&
    validateVector(hostileVector.vector)
  ) {
    const perpendicularVector = { x: -distanceVector.y, y: distanceVector.x };
    const perpendicularUnitVector = makeUnitVector(perpendicularVector);
    const hostileOrbitalVelocity = innerProduct(
      perpendicularUnitVector,
      hostileVector.vector
    );
    const onBoardOrbitalVelocity = innerProduct(
      perpendicularUnitVector,
      onBoardVector.vector
    );
    const trueObitalVelocity =
      (hostileOrbitalVelocity - onBoardOrbitalVelocity) * 3;
    return trueObitalVelocity / (distance * 1000);
  } else return false;
}
function innerProduct(unitVector, velocityVector) {
  return unitVector.x * velocityVector.x + unitVector.y * velocityVector.y;
}
function makeUnitVector(vector) {
  const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return { x: vector.x / length, y: vector.y / length };
}
function validateVector(vector) {
  if (vector.x !== undefined && vector.y !== undefined) return true;
  else return false;
}
