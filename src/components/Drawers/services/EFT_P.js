export default class EFT {
  static extractIDs(fitText, typeIDs) {
    if (!typeIDs) return [];

    const typeNames = EFT.#extractIDs_getTypeNames(fitText);
    return typeNames.reduce((acc, typeName) => {
      const type = typeIDs.find((typeID) => typeID.typeName === typeName);
      if (!!type) acc.push(type.typeID);
      else console.log("ERROR", "EFT:typeName is not found", typeName);
      return acc;
    });
  }
  static #extractIDs_getTypeNames = function (fitText) {
    const shipText = fitText.slice(0, fitText.indexOf("]") + 1);
    const moduleText = fitText.substring(fitText.indexOf("]") + 1);

    const shipName = shipText.replace("[", "").split(",")[0];
    const moduleNames = [
      ...new Set(
        moduleText.split(/\r?\n/).reduce((acc, moduleTextLine) => {
          const dividedByComma = moduleTextLine.split(",");
          const dividedByX = moduleTextLine.split(" x");

          if (dividedByComma.length === 2) {
            const item = dividedByComma[0];
            const charge = dividedByComma[1];
            charge[0] === " " && charge.shift();
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
    return [...shipName, ...moduleNames];
  };
  static extractAll(fitText, typeIDs) {
    if (fitText.constructor !== String) return fitText;

    const dividedText = EFT.#divide(fitText, typeIDs);

    const ship = EFT.#findIdByName(dividedText.ship, typeIDs);
    const lowSlots = EFT.#extractSlots(dividedText.lowSlots, typeIDs);
    const midSlots = EFT.#extractSlots(dividedText.midSlots, typeIDs);
    const highSlots = EFT.#extractSlots(dividedText.highSlots, typeIDs);
    const rigSlots = EFT.#extractSlots(dividedText.rigSlots, typeIDs);
    const droneSlots = EFT.#extractDroneSlots(dividedText.droneSlots, typeIDs);
    const cargoSlots = EFT.#extractSlots(dividedText.cargoSlots, typeIDs);

    return {
      ship,
      lowSlots,
      midSlots,
      highSlots,
      rigSlots,
      droneSlots,
      cargoSlots,
    };
  }

  static #extractSlots = function (slots, typeIDs) {
    if (!slots || slots.constructor !== Array) return [];
    return slots.map((slot) => {
      if (!slot) return slot;
      return {
        item: !!slot.item && EFT.#findIdByName(slot.item, typeIDs),
        charge: !!slot.charge && EFT.#findIdByName(slot.charge, typeIDs),
      };
    });
  };
  static #extractDroneSlots = function (slots, typeIDs) {
    if (!slots || slots.constructor !== Array) return [];
    return slots.map((slot) => {
      if (!slot) return slot;
      //prettier-ignore
      return {
        item: !!slot.item && {...EFT.#findIdByName(slot.item, typeIDs), typeCount: slot.item.typeCount},
        charge: false,
      };
    });
  };
  static #findIdByName = function (type, typeIDs) {
    if (!type) return type;
    return typeIDs.find((typeID) => typeID.typeName === type.typeName);
  };
  //TODO: Make misc slot work (polishing is much needed!)
  static exportAll(fit) {
    const ship = `[${fit?.ship?.typeName}, ${fit?.ship?.typeName} fit]`;
    const lowSlots = EFT.#exportAll_slots(fit?.lowSlots, "[Empty Low slot]");
    const midSlots = EFT.#exportAll_slots(fit?.midSlots, "[Empty Med slot]");
    const highSlots = EFT.#exportAll_slots(fit?.highSlots, "[Empty High slot]");
    const rigSlots = EFT.#exportAll_slots(fit?.rigSlots, "[Empty Rig slot]");
    const drones = EFT.#exportAll_drones(fit?.droneSlots);

    const slots = [ship, lowSlots, midSlots, highSlots, rigSlots].join("\n\n");

    return [slots, drones].join("\n\n\n");
  }
  static #exportAll_slots = function (slots, blankText) {
    if (!slots) return new Array(8).fill(blankText).join("\n");
    return slots
      .map((slot) => {
        if (!slot || !slot.item) return blankText;
        if (!slot.charge) return slot.item.typeName;
        return slot.item.typeName.concat(", ", slot.charge.typeName);
      })
      .join("\n");
  };
  static #exportAll_drones = function (droneSlots) {
    if (!droneSlots) return "";
    return droneSlots
      .map((droneSlot) => {
        if (!droneSlot || !droneSlot.item) return "";
        return `${droneSlot.item.typeName} x${droneSlot.item.typeCount}`;
      })
      .join("\n");
  };

  static compare(fit) {
    const ship = `[${fit?.ship?.typeName}, ${fit?.ship?.typeName} fit] ${fit?.ship?.typeState}`;
    const miscSlots = EFT.#compare_slots(fit?.miscSlots, "[Empty Misc slot]");
    const lowSlots = EFT.#compare_slots(fit?.lowSlots, "[Empty Low slot]");
    const midSlots = EFT.#compare_slots(fit?.midSlots, "[Empty Med slot]");
    const highSlots = EFT.#compare_slots(fit?.highSlots, "[Empty High slot]");
    const rigSlots = EFT.#compare_slots(fit?.rigSlots, "[Empty Rig slot]");
    const drones = EFT.#compare_drones(fit?.droneSlots);

    return [
      ship,
      miscSlots,
      lowSlots,
      midSlots,
      highSlots,
      rigSlots,
      drones,
    ].join("\n\n");
  }
  static #compare_slots = function (slots, blankText) {
    if (!slots) return new Array(8).fill(blankText).join("\n");
    return slots
      .map((slot) => {
        if (!slot || !slot.item) return blankText;
        if (!slot.charge) return `${slot.item.typeName} ${slot.item.typeState}`;
        return `${slot.item.typeName}, ${slot.charge.typeName} ${slot.item.typeState}`;
      })
      .join("\n");
  };
  static #compare_drones = function (droneSlots) {
    if (!droneSlots) return "";
    return droneSlots
      .map((droneSlot) => {
        const drone = droneSlot.item;
        return `${drone.typeName} x${drone.typeCount} ${drone.typeState}`;
      })
      .join("\n");
  };

  static #divide = function (fitText, typeIDs) {
    const slotsText = fitText.split(/\r?\n\r?\n\r?\n/)[0];
    const baysText = fitText.split(/\r?\n\r?\n\r?\n/)[1];

    const ship = EFT.#divideByComma(slotsText.match(/\[(.*?)\]/)[0]);
    const slots = EFT.#divideByDoubleEnter(
      slotsText.split("\n").slice(1).join("\n")
    ).filter((slot) => slot.length !== 0);
    //prettier-ignore
    const lowSlots = slots[0].map((line) => EFT.#divideByComma(line)).filter(line => line !== "");
    const midSlots = slots[1].map((line) => EFT.#divideByComma(line));
    const highSlots = slots[2].map((line) => EFT.#divideByComma(line));
    const rigSlots = slots[3].map((line) => EFT.#divideByComma(line));

    const bays = EFT.#divideByDoubleEnter(baysText);
    const droneSlots = bays
      ? bays.reduce((acc, bay, index, arr) => {
          if (!EFT.#isDrone(bay, typeIDs)) return acc;
          const droneBay = arr.splice(index, 1)[0];
          return acc.concat(droneBay.map((line) => EFT.#divideByX(line)));
        }, [])
      : [];
    const cargoSlots =
      bays.length === 1
        ? bays[0].map((line) => EFT.#divideByX(line))
        : undefined;
    if (ship.typeName)
      return {
        ship,
        lowSlots,
        midSlots,
        highSlots,
        rigSlots,
        droneSlots,
        cargoSlots,
      };
  };
  static #divideByDoubleEnter = function (fitText) {
    if (!fitText) return "";
    const dividedText = fitText.split(/\r?\n/).reduce(
      (acc, text) => {
        if (text === "") acc.push([]);
        else acc[acc.length - 1].push(text);
        return acc;
      },
      [[]]
    );
    return dividedText;
  };
  static #divideByComma = function (fitLine) {
    if (fitLine.indexOf("Empty") !== -1) return false;
    if (fitLine.indexOf("[") === 0) {
      return { typeName: fitLine.slice(1, fitLine.length - 1).split(/[,]/)[0] };
    }
    if (fitLine.indexOf(",") === -1) return { item: { typeName: fitLine } };

    const dividedText = fitLine.split(", ");
    const item = dividedText[0];
    const charge = dividedText[1];
    return { item: { typeName: item }, charge: { typeName: charge } };
  };
  static #isDrone = function (bayText, typeIDs) {
    const sampleBay = EFT.#divideByX(bayText[0]);
    const type = EFT.#findIdByName(sampleBay.item, typeIDs);

    if (!!type && type.typeDroneSize !== undefined) return true;
    return false;
  };
  static #divideByX = function (fitLine) {
    if (!fitLine) return { item: false, charge: false };
    const dividedText = fitLine.split(" x");
    if (dividedText.length !== 2) return { item: { typeName: dividedText[0] } };
    const item = dividedText[0];
    const typeCount = Number(dividedText[1]);
    return { item: { typeName: item, typeCount: typeCount }, charge: false };
  };
}
