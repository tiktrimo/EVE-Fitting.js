const Fit = require("./Fit");
const fs = require("fs");
const CJSON = require("compressed-json");

const skills = JSON.parse(
  fs.readFileSync("../jsons/ignore/skillsPretty.json", "utf8")
);
const skillBoard = Fit.extractSkillsStaticPlaneBoard(skills);

fs.writeFileSync(
  "../jsons/ignore/skillsStaticBoardPretty.json",
  JSON.stringify(skillBoard, null, 2)
);
fs.writeFileSync(
  "../jsons/ignore/skillsStaticBoard.json",
  JSON.stringify(CJSON.compress(skillBoard))
);
