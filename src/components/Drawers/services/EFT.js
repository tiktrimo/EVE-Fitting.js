export default class EFT {
  static extractIDs(fitText, typeIDs) {
    if (!typeIDs) return [];

    const typeNames = EFT.#extractIDs_getTypeNames(fitText);
    return typeNames.reduce((acc, typeName) => {
      const type = typeIDs.find((typeID) => typeID.typeName === typeName);
      if (!!type) acc.push(type.typeID);
      /* else console.log("ERROR", "EFT:typeName is not found", typeName); */
      return acc;
    }, []);
  }
  static #extractIDs_getTypeNames = function (fitText) {
    const shipText = fitText.slice(0, fitText.indexOf("]") + 1);
    const moduleText = fitText.substring(fitText.indexOf("]") + 1);

    const shipName = shipText.replace("[", "").split(",")[0];
    const moduleNames = [
      ...new Set(
        moduleText.split(/\r?\n/).reduce((acc, moduleTextLine) => {
          const dividedByComma = moduleTextLine.split(", ");
          const dividedByX = moduleTextLine.split(" x");

          if (dividedByComma.length === 2) {
            const item = dividedByComma[0];
            const charge = dividedByComma[1];
            return acc.concat([item, charge]);
          }
          if (dividedByX.length === 2) {
            const item = dividedByX[0];
            return acc.concat([item]);
          }

          if (moduleTextLine !== "") return acc.concat(moduleTextLine);
          return acc;
        }, [])
      ),
    ];
    return [shipName, ...moduleNames];
  };

  static buildFitFromText = function (fitText, typeIDs) {
    const [eveFitText, internalFitText] = fitText.split("||\n");
    const shipTextLine = eveFitText.slice(0, eveFitText.indexOf("]") + 1);
    const shipName = shipTextLine.replace("[", "").split(",")[0];
    const ship = EFT.#common_findIdByName(shipName, typeIDs);

    const fitTextBlocks = eveFitText.split(/\r?\n\r?\n\r?\n/);
    const moduleText = EFT.#buildFitFromText_getModuleText(fitTextBlocks);
    const droneText = fitTextBlocks[1]; //At this point we dont know wether this text is drone or not

    //prettier-ignore
    const moduleSlots = EFT.#buildFitFromText_buildModules(moduleText, internalFitText, typeIDs);
    const droneSlots = EFT.#buildFitFromText_buildDrones(droneText, typeIDs);

    return { ship, ...moduleSlots, ...droneSlots };
  };
  static #buildFitFromText_getModuleText = function (fitTextBlocks) {
    const indexOfModuleText = fitTextBlocks[0].indexOf("]") + 1;
    const moduleText = fitTextBlocks[0].substring(indexOfModuleText);
    return moduleText.trimStart();
  };
  static #buildFitFromText_buildModules = function (
    moduleText,
    internalFitText,
    typeIDs
  ) {
    const moduleTextBlocks = moduleText.split(/\r?\n\r?\n/);

    const moduleSlots = {};
    ["lowSlots", "midSlots", "highSlots", "rigSlots", "miscSlots"].forEach(
      (slot, index) => {
        moduleSlots[slot] = EFT.#buildFitFromText_buildModule(
          moduleTextBlocks[index],
          typeIDs
        );
      }
    );

    const intentionalModuleTextBlocks = internalFitText
      ? internalFitText.split(/\r?\n\r?\n/)
      : [];
    ["implantSlots", "drugSlots"].forEach((slot, index) => {
      moduleSlots[slot] = EFT.#buildFitFromText_buildModule(
        intentionalModuleTextBlocks[index],
        typeIDs
      );
    });

    return moduleSlots;
  };
  static #buildFitFromText_buildModule = function (moduleTextBlock, typeIDs) {
    if (!moduleTextBlock) return [];

    const moduleTextLines = moduleTextBlock.split(/\r?\n/);
    return moduleTextLines.map((moduleTextLine) => {
      if (moduleTextLine.indexOf("Empty") !== -1)
        return { item: false, chage: false };
      else {
        const itemName = moduleTextLine.split(", ")[0];
        const chargeName = moduleTextLine.split(", ")[1];
        const item = EFT.#common_findIdByName(itemName, typeIDs);
        const charge = EFT.#common_findIdByName(chargeName, typeIDs);
        return { item, charge };
      }
    });
  };
  static #buildFitFromText_buildDrones = function (droneText, typeIDs) {
    //prettier-ignore
    if (EFT.#buildFitFromText_readoutTextBlock(droneText, typeIDs) !== "droneSlots")
      return {};
    //prettier-ignore
    // filter ''. if there is empty lines under block "" create faulty slot
    const droneTextLines = droneText.split(/\r?\n/).filter(text => text !== "");
    const droneSlots = droneTextLines.map((droneTextLine) => {
      //prettier-ignore
      const {typeName, typeCount} = EFT.#buildFitFromText_divideBy_x(droneTextLine)
      const type = EFT.#common_findIdByName(typeName, typeIDs);
      return { item: { ...type, typeCount }, charge: false };
    });

    return { droneSlots };
  };
  static #buildFitFromText_divideBy_x = function (fitTextLine) {
    const dividedBy_x = fitTextLine.split(" x");
    const typeName = dividedBy_x[0];
    const typeCount = Number(dividedBy_x[1]);

    return { typeName, typeCount };
  };
  static #buildFitFromText_readoutTextBlock = function (textBlock, typeIDs) {
    if (!textBlock) return "undefined";

    const sampleTextLine = textBlock.slice(0, textBlock.search(/\r?\n/));
    if (sampleTextLine.indexOf(" x") !== -1) {
      const typeName = sampleTextLine.split(" x")[0];
      const type = EFT.#common_findIdByName(typeName, typeIDs);
      if (!!type.typeDroneSize) return "droneSlots";
      else return false;
    } else if (sampleTextLine.indexOf(",") !== -1) {
      const typeName = sampleTextLine.split(", ")[0];
      const type = EFT.#common_findIdByName(typeName, typeIDs);
      if (!!type.typeIsHiPower) return "highSlots";
      else if (!!type.typeIsMedPower) return "midSlots";
      else if (!!type.typeIsLoPower) return "lowSlots";
      else return "ship";
    }

    return false;
  };

  static buildInternalTextFromFit = function (fit) {
    const officialEFT = EFT.buildTextFromFit(fit);

    const implantSlots = EFT.#buildTextFromFit_moduleSlots(
      fit?.implantSlots,
      "[Empty Implant slot]"
    );
    const drugSlots = EFT.#buildTextFromFit_moduleSlots(
      fit?.drugSlots,
      "[Empty Drug slot]"
    );
    const privateEFT = [implantSlots, drugSlots].join("\n\n");

    return [officialEFT, privateEFT].join("||\n");
  };

  //prettier-ignore
  static buildTextFromFit = function (fit) {
    const ship = `[${fit?.ship?.typeName}, ${fit?.ship?.typeName} fit]`;
    const lowSlots = EFT.#buildTextFromFit_moduleSlots(fit?.lowSlots, "[Empty Low slot]");
    const midSlots = EFT.#buildTextFromFit_moduleSlots(fit?.midSlots, "[Empty Med slot]");
    const highSlots = EFT.#buildTextFromFit_moduleSlots(fit?.highSlots, "[Empty High slot]");
    const rigSlots = EFT.#buildTextFromFit_moduleSlots(fit?.rigSlots, "[Empty Rig slot]");
    const miscSlots = EFT.#buildTextFromFit_moduleSlots(fit?.miscSlots, "[Empty Subsystem slot]");
    const moduleSlots =  [ship, lowSlots, midSlots, highSlots, rigSlots, miscSlots]
      .filter(slots => !!slots)// In case for miscSlots is empty and returned as false
      .join("\n\n");

    const drones =  EFT.#buildTextFromFit_droneSlots(fit?.droneSlots, "[Empty Subsystem slot]")

    return [moduleSlots, drones].join("\n\n\n");
  };
  static #buildTextFromFit_moduleSlots = function (moduleSlots, emptyText) {
    if (!moduleSlots || moduleSlots.length === 0) return false;

    return moduleSlots
      .map((moduleSlot) => {
        if (!moduleSlot || !moduleSlot.item) return emptyText;
        if (!moduleSlot.charge) return moduleSlot.item.typeName;
        return moduleSlot.item.typeName.concat(
          ", ",
          moduleSlot.charge.typeName
        );
      })
      .join("\n");
  };
  static #buildTextFromFit_droneSlots = function (droneSlots) {
    if (!droneSlots) return "";
    return droneSlots
      .map((droneSlot) => {
        if (!droneSlot || !droneSlot.item) return "";
        return `${droneSlot.item.typeName} x${droneSlot.item.typeCount}`;
      })
      .join("\n");
  };

  //prettier-ignore
  static buildCompareTextFromFit = function (fit) {
    if(!fit?.ship) return "Invalid_fit"; // this line is intentional. makes drawer's fit.apply fired only once when ship is deleted(aka resetting)

    const ship = `[${fit?.ship?.typeName}, ${fit?.ship?.typeName} fit] ${fit?.ship?.typeState}`;
    const miscSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.miscSlots, "[Empty Misc slot]");
    const lowSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.lowSlots, "[Empty Low slot]");
    const midSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.midSlots, "[Empty Med slot]");
    const highSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.highSlots, "[Empty High slot]");
    const rigSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.rigSlots, "[Empty Rig slot]");
    const implantSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.implantSlots, "[Empty Implant slot]");
    const drugSlots = EFT.#buildCompareTextFromFit_moduleSlots(fit?.drugSlots, "[Empty Drug slot]");
    const drones = EFT.#buildCompareTextFromFit_droneSlots(fit?.droneSlots);
    
    const skills = !!fit.skills ? "skills" : "noSkills";

    return [
      ship,
      miscSlots,
      lowSlots,
      midSlots,
      highSlots,
      rigSlots,
      implantSlots,
      drugSlots,
      drones,
      skills
    ].join("\n\n");
  }
  static #buildCompareTextFromFit_moduleSlots = function (slots, blankText) {
    if (!slots) return "";
    return slots
      .map((slot) => {
        if (!slot || !slot.item) return blankText;
        if (!slot.charge) return `${slot.item.typeName} ${slot.item.typeState}`;
        return `${slot.item.typeName}, ${slot.charge.typeName} ${slot.item.typeState}`;
      })
      .join("\n");
  };
  static #buildCompareTextFromFit_droneSlots = function (droneSlots) {
    if (!droneSlots) return "";
    return droneSlots
      .map((droneSlot) => {
        const drone = droneSlot.item;
        return `${drone.typeName} x${drone.typeCount} ${drone.typeState}`;
      })
      .join("\n");
  };

  static #common_findIdByName = function (typeName, typeIDs) {
    if (!typeName) return false;

    const type = typeIDs.find((typeID) => typeID.typeName === typeName);
    return !!type ? type : false;
  };
}
