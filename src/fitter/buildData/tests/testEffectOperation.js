// Update database from 2020-10 to 2022-02
// operation in modifierInfo was string such as "modAdd", "postPercent".
// At new version operations are numbers such as 1, 0
// Test if we can convert number into string as I use string to calcaulte fit

//result of 2022-02-12 19:39
const result = [
  "modAdd=2",
  "postMul=4",
  "specialSkillOp=9",
  "preMul=0",
  "postPercent=6",
  "preAssignment=-1",
  "modSub=3",
  "postAssignment=7",
  "undefined=undefined",
  "postDiv=5",
];
// Used this reulst at @buildTypeDogmaEffects to convert numbers into string

const yaml = require("js-yaml");
const fs = require("fs");

try {
  const oldDogmaEffects = yaml.safeLoad(
    fs.readFileSync("../../yamls/legacy/dogmaEffects.yaml", "utf8")
  );

  const newDogmaEffects = yaml.safeLoad(
    fs.readFileSync("../../yamls/ignore/dogmaEffects.yaml", "utf8")
  );

  const operationSet = [];

  for (let i = 0; i < 10000; i++) {
    if (!!newDogmaEffects[i]?.modifierInfo)
      newDogmaEffects[i].modifierInfo.forEach((mod) => {
        if (mod.operation === undefined)
          console.log("no operation modifer Info, effectID :  ", i);
      }); //--> There is some modInfo dont have operation. all of them was from warpScrambler's effect. such as "Warp Scramble" "warpScrambleBlockMWDWithNPCEffect" "behaviorWarpScramble" "shipModuleFocusedWarpScramblingScript"

    if (
      !!oldDogmaEffects[i]?.modifierInfo &&
      !!newDogmaEffects[i]?.modifierInfo
    ) {
      oldDogmaEffects[i].modifierInfo.forEach((mod) => {
        const nMod = newDogmaEffects[i].modifierInfo.find(
          (n_mod) =>
            n_mod.domain === mod.domain &&
            n_mod.modifiedAttributeID === mod.modifiedAttributeID &&
            n_mod.modifyingAttributeID === mod.modifyingAttributeID
        );

        if (
          !!nMod &&
          !operationSet.includes(`${mod.operation}=${nMod.operation}`)
        )
          operationSet.push(`${mod.operation}=${nMod.operation}`);
      });
    }
  }

  console.log(operationSet);
} catch (e) {
  console.log(e);
}
