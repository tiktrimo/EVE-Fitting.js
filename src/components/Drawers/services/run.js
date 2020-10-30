const EFT = require("./EFT_P");
const fs = require("fs");
const typeIDsTable = JSON.parse(
  fs.readFileSync(
    "../../../fitter/jsons/ignore/listInvTypesTablePretty.json",
    "utf8"
  )
);
const fitText =
  "[Proteus,Cookie Warehouse]\r\nSmall Armor Repairer II\r\nMagnetic Field Stabilizer II\r\nReactive Armor Hardener\r\nMagnetic Field Stabilizer II\r\nMedium Armor Repairer II\r\nMultispectrum Energized Membrane II\r\n\r\n10MN Afterburner II\r\nTracking Computer II\r\nTracking Computer II\r\nSensor Booster II\r\n\r\n250mm Railgun II\r\n250mm Railgun II\r\n250mm Railgun II\r\n250mm Railgun II\r\n250mm Railgun II\r\n250mm Railgun II\r\n\r\nMedium Explosive Armor Reinforcer II\r\nMedium Capacitor Control Circuit II\r\nMedium Capacitor Control Circuit II\r\n\r\nProteus Core - Augmented Fusion Reactor\r\nProteus Defensive - Nanobot Injector\r\nProteus Offensive - Hybrid Encoding Platform\r\nProteus Propulsion - Hyperspatial Optimization\r\n\r\n\r\nHobgoblin II x5\r\nHornet II x5\r\n\r\n\r\nAgency 'Hardshell' TB3 Dose I\r\n\r\n\r\nFederation Navy Antimatter Charge M x406\r\nECCM Script x1\r\nTracking Speed Script x2";
