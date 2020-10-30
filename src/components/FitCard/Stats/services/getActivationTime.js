import { findAttributebyID } from "../../../../services/dataManipulation/findAttributes";
import Fit from "../../../../fitter/src/Fit";

export function getActivationTime(item, charge) {
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

  if (!isTypeNeedCharge(item))
    return { max: TAV / 1000, effective: EactivationTime / 1000 };
  if (Fit.validateChargeSlot({ item, charge }))
    return { max: TAV / 1000, effective: EactivationTime / 1000 };
  else return { max: Infinity, effective: Infinity };
}
function isTypeNeedCharge(type) {
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
}
