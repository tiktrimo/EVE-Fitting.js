// Extract information from dogmaAttributes, dogmaEffects with specitic typeID
// Package extracted informations and typeID into single Object

const yaml = require("js-yaml");
const fs = require("fs");
const CJSON = require("compressed-json");
const PRIVATE_TYPE_IDs = require("./private").PRIVATE_TYPE_IDs;
const PRIVATE_MARKET_GROUP_IDs = require("./private").PRIVATE_MARKET_GROUP_IDs;

const buildTypeDogmaAttributes = require("./services/buildTypeDogmaAttributes");
const buildTypeDogmaEffects = require("./services/buildTypeDogmaEffects");
const buildTypeDogmaSkills = require("./services/buildTypeDogmaSkills");
const buildIconFileName = require("./services/buildIconFileName");

try {
  const typeIDs = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/typeIDs.yaml", "utf8")
  );
  const typeIDsIterable = Object.entries(typeIDs).map((typeID) => ({
    ...typeID[1],
    typeID: typeID[0],
  }));
  const typeDogmas = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/typeDogma.yaml", "utf8")
  );
  const dogmaAttributes = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/dogmaAttributes.yaml", "utf8")
  );
  const dogmaEffects = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/dogmaEffects.yaml", "utf8")
  );
  const dogmaAttributesCategories = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/dogmaAttributeCategories.yaml", "utf8")
  );
  const iconIDs = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/iconIDs.yaml", "utf8")
  );
  const marketGroups = yaml.safeLoad(
    fs.readFileSync("../yamls/ignore/marketGroups.yaml", "utf8")
  );

  const props = {
    typeIDs,
    typeIDsIterable,
    typeDogmas,
    dogmaAttributes,
    dogmaEffects,
    dogmaAttributesCategories,
    iconIDs,
    marketGroups,
  };

  console.time("test");
  const _typeIDs = weaveTypeIDs(props);
  const listTypeIDs = extractListTypeIDs(props);
  const skills = extractOnlySkills(_typeIDs);
  const attributesCategories = extractAttributesCategories(props);
  const marketCategories = extractMarketGroups(props);
  /* getEffectiveIcons(props); */
  console.timeEnd("test");



  //Pretty print
  fs.writeFileSync(
    "../jsons/ignore/typeIDsPretty.json",
    JSON.stringify(_typeIDs, null, 2)
  );
  fs.writeFileSync(
    "../jsons/ignore/skillsPretty.json",
    JSON.stringify(skills, null, 2)
  );
  fs.writeFileSync(
    "../jsons/ignore/listInvTypesTablePretty.json",
    JSON.stringify(listTypeIDs, null, 2)
  );
  fs.writeFileSync(
    "../jsons/ignore/attributesCategoriesPretty.json",
    JSON.stringify(attributesCategories, null, 2)
  );
  fs.writeFileSync(
    "../jsons/ignore/marketCategoriesPretty.json",
    JSON.stringify(marketCategories, null, 2)
  );
  //Compressed print
  fs.writeFileSync(
    "../jsons/ignore/attributesCategories.json",
    JSON.stringify(CJSON.compress(attributesCategories))
  );
  fs.writeFileSync(
    "../jsons/ignore/skills.json",
    JSON.stringify(CJSON.compress(skills))
  );
  fs.writeFileSync(
    "../jsons/ignore/listInvTypesTable.json",
    JSON.stringify(CJSON.compress(listTypeIDs))
  );
  fs.writeFileSync(
    "../jsons/ignore/marketCategories.json",
    JSON.stringify(CJSON.compress(marketCategories))
  );
} catch (e) {
  console.log(e);
}

// Still in development attributeName and effectName will be deleted at production
function weaveTypeIDs(props) {
  const _typeIDs = {};
  for (let i = 0; i < 380000; i++) {
    const typeID = weaveTypeID(i, props);
    if (typeID !== undefined) _typeIDs[i] = typeID;
  }
  return _typeIDs;
}
function weaveTypeID(ID, props) {
  if (!props.typeIDs[ID]) return undefined;
  const isPrivateTypeID = Object.keys(PRIVATE_TYPE_IDs).includes(String(ID));
  if (!isPrivateTypeID) {
    if (!props.typeIDs[ID].published) return undefined;
    if (!props.typeIDs[ID].marketGroupID) return undefined;
  }

  const type = props.typeIDs[ID];
  const dogmaAttribute = buildTypeDogmaAttributes(ID, props);
  const dogmaEffect = buildTypeDogmaEffects(ID, props);
  const dogmaSkills = buildTypeDogmaSkills(props.typeDogmas[ID]);
  const iconFileName = buildIconFileName(type, props);

  /* const traits = buildTraits(typeID.traits); */

  const exclude = {
    description: undefined,
    name: undefined,
    masteries: undefined,
    traits: undefined,
    sofFactionName: undefined,
    soundID: undefined,
    radius: undefined,
    raceID: undefined,
    portionSize: undefined,
    graphicID: undefined,
    factionID: undefined,
    basePrice: undefined,
  };
  // Custom defined data structure
  return {
    ...type,
    ...exclude,

    typeID: ID,
    iconFileName: iconFileName,
    typeName: type.name !== undefined ? type.name.en : undefined,
    typeSkills: dogmaSkills,
    typeAttributesStats: dogmaAttribute,
    typeEffectsStats: dogmaEffect,
  };
}

function extractListTypeIDs(props) {
  const listTypeIDs = [];
  for (let i = 0; i < 380000; i++) {
    const typeID = extractListTypeID(i, props);
    if (typeID !== undefined) listTypeIDs.push(typeID);
  }
  return listTypeIDs;
}
function extractListTypeID(ID, props) {
  if (!props.typeIDs[ID]) return undefined;
  const isPrivateTypeID = Object.keys(PRIVATE_TYPE_IDs).includes(String(ID));
  if (!isPrivateTypeID) {
    if (!props.typeIDs[ID].published) return undefined;
    if (!props.typeIDs[ID].marketGroupID) return undefined;
  }

  const typeID = props.typeIDs[ID];
  const dogmaAttributes =
    props.typeDogmas[ID] !== undefined
      ? props.typeDogmas[ID].dogmaAttributes
      : undefined;
  const dogmaEffects =
    props.typeDogmas[ID] !== undefined
      ? props.typeDogmas[ID].dogmaEffects
      : undefined;

  const findAttributeByID = (ID, dogmaAttributes) => {
    if (dogmaAttributes === undefined) return undefined;
    const attribute = dogmaAttributes.find((entry) => entry.attributeID === ID);
    return attribute !== undefined ? attribute.value : undefined;
  };
  const findEffectByID = (ID, dogmaEffects) => {
    if (dogmaEffects === undefined) return undefined;

    const effect = dogmaEffects.find((efft) => efft.effectID === ID);
    if (effect === undefined) return undefined;
    else return true;
  };
  const typeMetaGroupID = typeID.metaGroupID;
  const typeDroneSize = findAttributeByID(1272, dogmaAttributes); //attributeID: 1272, attributeName: "Bandwidth Needed"
  const typeFighterSize = findAttributeByID(2215, dogmaAttributes); //"attributeID": 2215,"attributeName": "Squadron Size",
  const typeRigSize = findAttributeByID(1547, dogmaAttributes);
  const typeChargeSize = findAttributeByID(128, dogmaAttributes);
  const typeSlotNumber = findAttributeByID(331, dogmaAttributes) ||  findAttributeByID(1087, dogmaAttributes)// "attributeID": 331,"attributeName": "Implant Slot", "attributeID": 1087,"attributeName": "Booster Slot",

  const isHiPower = findEffectByID(12, dogmaEffects);
  const isMedPower = findEffectByID(13, dogmaEffects);
  const isLoPower = findEffectByID(11, dogmaEffects);
  const isTurretFitted = findEffectByID(42, dogmaEffects);
  const isLauncherFitted = findEffectByID(40, dogmaEffects);

  if (!isPrivateTypeID) {
    if (!dogmaEffects || dogmaEffects.length === 0) return undefined;
  }

  // Custom defined data structure
  return {
    typeID: ID,
    typeGroupID: typeID.groupID,
    typeName: typeID.name !== undefined ? typeID.name.en : undefined,
    marketGroupID: typeID.marketGroupID || PRIVATE_TYPE_IDs[ID].marketGroupID,
    typeDroneSize: typeDroneSize,
    typeFighterSize: typeFighterSize,
    typeRigSize: typeRigSize,
    typeChargeSize: typeChargeSize,
    typeMetaGroupID: typeMetaGroupID,
    typeIsHiPower: isHiPower,
    typeIsMedPower: isMedPower,
    typeIsLoPower: isLoPower,
    typeIsTurretFitted: isTurretFitted,
    typeIsLauncherFitted: isLauncherFitted,
    typeSlotNumber: typeSlotNumber
  };
}

function extractMarketGroups(props) {
  const marketGroups = props.marketGroups;

  const arrayMarketGroups = [];
  for (let i = 0; i < 3000; i++) {
    if (!!marketGroups[i]) {
      const marketGroup = marketGroups[i];
      const iconFileName = buildIconFileName(marketGroup, props);
      let iconTypeID = props.typeIDsIterable.find(
        (type) => type.iconID === marketGroup.iconID
      )?.typeID;

      if (marketGroup.iconID === 1084) iconTypeID = 2956; //Exception for drones
      arrayMarketGroups.push({
        marketGroupID: i,
        parentGroupID: marketGroup.parentGroupID,
        marketGroupName: marketGroup.nameID.en,
        hasTypes: marketGroup.hasTypes,
        iconFileName: iconFileName,
        iconTypeID: iconTypeID || 3584, // description: Severed head (soaked in formaldehyde) - Unknown
      });
    }
  }
  PRIVATE_MARKET_GROUP_IDs.forEach((groupID) =>
    arrayMarketGroups.push(groupID)
  );
  return arrayMarketGroups;
}
function extractOnlySkills(typeIDs) {
  const typeIDsValues = Object.values(typeIDs);

  return typeIDsValues.reduce((result, typeID) => {
    // skillBook image's id = 33
    if (typeID.iconID === 33) {
      //set skill level to 5 //skillLevel attributeID = 280
      if (!!typeID.typeAttributesStats) {
        let isSkillLevelExist = false;
        typeID.typeAttributesStats.forEach((attribute) => {
          if (attribute.attributeID === 280) {
            isSkillLevelExist = true;
            attribute.value = 5;
          }
        });
        if (!isSkillLevelExist)
          typeID.typeAttributesStats.push({
            attributeID: 280,
            attributeName: "Level",
            value: 5,
          });
      }
      // add to result if only affect to ship
      if (!!typeID.typeEffectsStats && typeID.typeEffectsStats.length > 1)
        result[typeID.typeID] = typeID;
    }
    return result;
  }, {});
}
function extractAttributesCategories(props) {
  const dogmaAttributesCategories = props.dogmaAttributesCategories;

  return dogmaAttributesCategories;
}
function getEffectiveIcons(props) {
  const marketCategories = extractMarketGroups(props);
  const missingInImageServer = marketCategories.reduce((missing, ctg) => {
    // description: Severed head (soaked in formaldehyde) - Unknown
    if(ctg.iconTypeID === 3584) missing.push(ctg);
    return missing;
  }, [])
  
  const effectiveIcons =   [
    ...new Set(missingInImageServer.map((ctg) => ctg.iconFileName)),
  ];
  effectiveIcons.forEach((fileName, index) => {
    fs.stat(
      `C:/Users/HSM/Downloads/Invasion_1.0_Icons/Icons/items/${fileName}`,
      (err, stat) => {
        if (err === null) {
          fs.copyFile(
            `C:/Users/HSM/Downloads/Invasion_1.0_Icons/Icons/items/${fileName}`,
            `C:/Users/HSM/Downloads/Invasion_1.0_Icons/Icons/effective/${fileName}`,
            (err) =>  console.log("err", err)
          );
        } else if (err === "ENOENT") {
          console.log("missing", fileName);
        } else console.log("Unknown err", fileName);
      }
    );
  });
}
