// show all domain name in string

const yaml = require("js-yaml");
const fs = require("fs");

try {
  const newDogmaEffects = yaml.safeLoad(
    fs.readFileSync("../../yamls/ignore/dogmaEffects.yaml", "utf8")
  );

  const domain = [];

  for (let i = 0; i < 10000; i++) {
    if (!!newDogmaEffects[i]?.modifierInfo) {
      newDogmaEffects[i].modifierInfo.forEach((mod) => {
        if (!domain.includes(mod.domain)) domain.push(mod.domain);
      });
    }
  }

  console.log(domain);
} catch (e) {
  console.log(e);
}
