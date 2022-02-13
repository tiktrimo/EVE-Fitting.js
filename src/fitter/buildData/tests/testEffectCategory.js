// Update database from 2020-10 to 2022-02
// effectCategory was string such as "activation", "passive".
// At new version effectCateogry is number such as 1, 0
// Test if we can convert number into string as I use string to calcaulte fit

//result of 2022-02-12 19:53
const result = [
  "activation=1",
  "target=2",
  "passive=0",
  "online=4",
  "overload=5",
  "dungeon=6",
  "system=7",
  "area=3",
  "passive=7",
];
// Used this reulst at @buildTypeDogmaEffects to convert numbers into string
// number 7 is problematic
// the effect having "passive=7" is shown below
// [8075, 8076, 8077, 8078, 8080] which name is
// 8075 systemHullEmResistance / 8076 systemHullThermalResistance / 8077 systemHullKineticResistance / 8078 systemHullExplosiveResistance
// 8080 systemProbeStrengthBonus
// Seems pretty far from player's boardable ship attribute.

// 7 will be converted into system

const yaml = require("js-yaml");
const fs = require("fs");

try {
  const oldDogmaEffects = yaml.safeLoad(
    fs.readFileSync("../../yamls/legacy/dogmaEffects.yaml", "utf8")
  );

  const newDogmaEffects = yaml.safeLoad(
    fs.readFileSync("../../yamls/ignore/dogmaEffects.yaml", "utf8")
  );

  const categorySet = [];

  for (let i = 0; i < 10000; i++) {
    if (!!oldDogmaEffects[i] && !!newDogmaEffects[i]) {
      if (
        !categorySet.includes(
          `${oldDogmaEffects[i].effectCategory}=${newDogmaEffects[i].effectCategory}`
        )
      ) {
        categorySet.push(
          `${oldDogmaEffects[i].effectCategory}=${newDogmaEffects[i].effectCategory}`
        );
      }

      if (
        `${oldDogmaEffects[i].effectCategory}=${newDogmaEffects[i].effectCategory}` ===
        "passive=7"
      ) {
        console.log(i);
      }
    }
  }
} catch (e) {
  console.log(e);
}
