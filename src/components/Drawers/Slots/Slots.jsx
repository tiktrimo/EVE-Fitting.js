import React from "react";
import Slot from "./Slot";
import { useState, useEffect } from "react";
import EFT from "../services/EFT";
import { translateVariant } from "../Drawers";
import { getSlotCount } from "../FittingDrawer/FittingDrawer.jsx";
import Fit from "../../../fitter/src/Fit";
import { findAttributebyID } from "../../../services/dataManipulation/findAttributes";
import { Avatar, Divider, makeStyles, Typography } from "@material-ui/core";
import { blueGrey, orange } from "@material-ui/core/colors";

const useStyles = makeStyles(() => ({
  root: {
    position: "relative",
  },
  lodingIndicator: {
    position: "absolute",
    height: 10,
    width: 10,
    top: 2,
    left: 2,
    backgroundColor: blueGrey[200],
  },
  divider: {
    width: "200%",
  },
}));

export default function Slots(props) {
  const classes = useStyles();
  //prettier-ignore
  const [rawItems, setRawItems] = useState(new Array(props.slotCount).fill(false));
  //prettier-ignore
  const [rawCharges, setRawCharges] = useState(new Array(props.slotCount).fill(false));
  //prettier-ignore
  const [fetchedItems, setFetchedItems] = useState(new Array(props.slotCount).fill(false));
  //prettier-ignore
  const [fetchedCharges, setFetchedCharges] = useState(new Array(props.slotCount).fill(false));
  const setters = {
    setRawItems,
    setFetchedItems,
    setRawCharges,
    setFetchedCharges,
  };

  const [activeSlotNumber, setActiveSlotNumber] = useState(0);
  const [isLoop, setIsLoop] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    if (!!props.importFitText || props.variant === "SHIP") return undefined;

    setRawItems(new Array(props.slotCount).fill(false));
    setRawCharges(new Array(props.slotCount).fill(false));
  }, [props.slots?.ship?.typeID]);

  useEffect(() => {
    if (!!props.importFitText || props.variant === "SHIP") return undefined;

    rawItems.length = props.slotCount;
    setRawItems(Array.from(rawItems, (item) => item || false));
    rawCharges.length = props.slotCount;
    setRawCharges(Array.from(rawCharges, (charge) => charge || false));
  }, [props.slotCount]);

  //Import fitText using EFT class
  useEffect(() => {
    console.log(props.importFitText);
    if (props.importFitText !== false) importSlots(props, setters);
  }, [props.importFitText]);

  //Raw items, charges input [REFACTOR!!]
  useEffect(() => {
    switch (props.listItems[props.variant]) {
      case false:
      case undefined:
        return undefined;
      case "DEL":
        rawItems[activeSlotNumber] = false;
        rawCharges[activeSlotNumber] = false;
        break;
      case "ADD":
        const activeItem = rawItems[activeSlotNumber];
        activeItem["typeCount"] = loopNumber(activeItem.typeCount, 1, 6);
        break;
      case "activation":
        changeState(rawItems[activeSlotNumber], "activation");
        break;
      case "offline":
        changeState(rawItems[activeSlotNumber], "offline");
        break;
      case "passive":
        changeState(rawItems[activeSlotNumber], "passive");
        break;
      case "overload":
        changeState(rawItems[activeSlotNumber], "overload");
        break;
      //prettier-ignore
      case "LOOPLOOP": setIsLoop(!isLoop); return;
      default:
        // New item is comming
        if (validateHardpoints(props.fit, props.listItems[props.variant])) {
          assignItemToSlot(props, rawItems, rawCharges, activeSlotNumber);
          addCountToDroneSlots(props, rawItems[activeSlotNumber]);
          changeState(rawItems[activeSlotNumber], "activation");
        }
        break;
    }
    setRawItems([...rawItems]);
    setRawCharges([...rawCharges]);
    props.dispatchListItems({ type: props.variant, payload: false });
    if (isLoop === true)
      setActiveSlotNumber(
        loopNumber(activeSlotNumber, 0, props.slotCount, props.variant)
      );
  }, [props.listItems[props.variant]]);

  useEffect(() => {
    switch (props.listItems["AMMO"]) {
      case false:
      case undefined:
      case "activation":
      case "offline":
      case "passive":
      case "overload":
        return undefined;
      case "DEL":
        rawCharges[activeSlotNumber] = false;
        setFetchedCharges([...rawCharges]);
        break;
      //prettier-ignore
      case "LOOPLOOP": setIsLoop(!isLoop); break;
      default:
        if (props.slotsOpen.AMMO.slotVariant !== props.variant) break;
        if (!rawItems[activeSlotNumber]) break;
        rawCharges[activeSlotNumber] = props.listItems["AMMO"];
        changeState(rawCharges[activeSlotNumber], "passive");
        setRawCharges([...rawCharges]);
    }
    props.dispatchListItems({ type: "AMMO", payload: false });
    if (isLoop === true)
      setActiveSlotNumber(loopNumber(activeSlotNumber, 0, props.slotCount));
  }, [props.listItems["AMMO"]]);

  //Fetched items, charges input
  useEffect(() => {
    setSession(session + 1);
    setIsLoading(true);
    (async function (props, rawItems, rawCharges, session) {
      const data = await Promise.all(
        createFetchPromises(props, rawItems, rawCharges, session)
      );

      const sessionData = data[data.length - 1];
      const fetchedData = data.slice(0, data.length - 1);

      if (sessionData === false || sessionData !== session) {
        //prettier-ignore
        console.log( "FETCH ERROR:SESSION MISFETCHED", props.variant, {sessionData, session, fetchedData, rawItems, rawCharges} );
        return undefined;
      } else
        processFetchedData(props, fetchedData, rawItems, rawCharges, setters);
      setIsLoading(false);
    })(props, rawItems, rawCharges, session + 1);
  }, [checkData(rawItems, rawCharges)]);

  if (props.slotCount > 0)
    return (
      <React.Fragment>
        <div
          className={classes.root}
          style={{
            padding: props.variant === "SHIP" ? 0 : "10px 0px 10px 0px",
          }}
        >
          {new Array(props.slotCount).fill(undefined).map((slot, index) => {
            return (
              <Slot
                key={`${props.variant}:${index}`}
                variant={props.variant}
                open={props.open}
                slotsOpen={props.slotsOpen}
                slots={props.slots}
                fetchedItem={fetchedItems[index]}
                fetchedCharge={fetchedCharges[index]}
                dispatchSlotsOpen={props.dispatchSlotsOpen}
                setActiveSlot={props.setActiveSlot}
                isActive={
                  activeSlotNumber === index &&
                  (props.slotsOpen[props.variant].open ||
                    props.slotsOpen.AMMO.slotVariant === props.variant)
                }
                index={index}
                setActiveSlotNumber={setActiveSlotNumber}
                cache={props.cache}
              />
            );
          })}
          {isLoading && (
            <Avatar className={classes.lodingIndicator}>{""}</Avatar>
          )}
        </div>
        <Divider className={classes.divider} />
      </React.Fragment>
    );
  else return false;
}
function validateHardpoints(fit, listItems) {
  if (
    listItems.typeIsTurretFitted !== true &&
    listItems.typeIsLauncherFitted !== true
  )
    return true;

  const pointLoad = extractHardpoints(fit);

  if (listItems.typeIsTurretFitted === true) {
    const turretPoint = findAttributebyID(fit.ship, 102); //attributeID: 102, attributeName: "Turret Hardpoints"
    return turretPoint > pointLoad.turretPointLoad;
  } else if (listItems.typeIsLauncherFitted === true) {
    const launcherPoint = findAttributebyID(fit.ship, 101); //attributeID: 101, attributeName: "Launcher Hardpoints"
    return launcherPoint > pointLoad.launcherPointLoad;
  }
}
function extractHardpoints(fit) {
  let turretPointLoad = 0;
  let launcherPointLoad = 0;
  Fit.mapSlots(
    fit,
    (slot) => {
      const isTurretFitted = !!slot?.item?.typeEffectsStats?.find(
        (efft) => efft.effectID === 42
      ); //effectID: 42, effectName: "turretFitted"
      const isLauncherFitted = !!slot?.item?.typeEffectsStats?.find(
        (efft) => efft.effectID === 40
      ); //effectID: 40, effectName: "launcherFitted"
      if (isTurretFitted === true) return ++turretPointLoad;
      if (isLauncherFitted === true) return ++launcherPointLoad;
    },
    { isIterate: { highSlots: true } }
  );
  return { turretPointLoad, launcherPointLoad };
}
function importSlots(props, setters) {
  if (!props.importFitText) return undefined;

  (async (fitText) => {
    const typeIDs = await props.cache.wait("/typeIDsTable");
    const fitFromText = EFT.buildFitFromText(fitText, typeIDs);
    const ship = await props.cache.wait(`typeID/${fitFromText.ship.typeID}`);

    if (props.variant === "SHIP") {
      setters.setRawItems([fitFromText.ship]);
      return undefined;
    }

    const slotCount = getSlotCountAtImport({ ship }, fitFromText, props);
    const items = new Array(slotCount).fill(false);
    const charges = new Array(slotCount).fill(false);

    const slots = fitFromText[translateVariant(props.variant)] || [];
    console.log(translateVariant(props.variant), slotCount, slots);
    //prettier-ignore
    slots.forEach((slot, index) => {
      items[index] = !!slot.item && { ...slot.item, typeState: "activation" };
      charges[index] = !!slot.charge && {...slot.charge, typeState: "passive",};
    });

    setters.setRawItems(items);
    setters.setRawCharges(charges);

    props.importStateFlag[props.variant] = true;
    props.setImportStateFlag({ ...props.importStateFlag });
  })(props.importFitText);
}
function getSlotCountAtImport(fit, fitFromText, props) {
  const isTacCruiser = fit.ship.groupID === 963;
  if (isTacCruiser === true)
    return fitFromText[translateVariant(props.variant)].length;
  else return getSlotCount(fit, props.variant);
}
function createFetchPromises(props, rawItems, rawCharges, session) {
  if (rawItems.length !== rawCharges.length) return [Promise.resolve(false)];

  const promisesItem = rawItems.map((rawItem) => {
    if (rawItem === false) return Promise.resolve(false);
    return props.cache.wait(`typeID/${rawItem?.typeID}`);
  });
  const promisesCharge = rawCharges.map((rawCharge) => {
    if (rawCharge === false) return Promise.resolve(false);
    return props.cache.wait(`typeID/${rawCharge?.typeID}`);
  });
  const sessionPromise = Promise.resolve(session);
  return [...promisesItem, ...promisesCharge, sessionPromise];
}
function processFetchedData(props, data, rawItems, rawCharges, setters) {
  const items = data.slice(0, data.length / 2);
  const charges = data.slice(data.length / 2);
  const payload = [];
  items.forEach((fetcheditem, index) => {
    const itemState = !!rawItems[index]
      ? Fit.getCurrentState({
          ...rawItems[index],
          ...fetcheditem,
        })
      : undefined;
    const item = !!rawItems[index]
      ? { ...rawItems[index], ...fetcheditem, typeState: itemState }
      : false;
    const charge = Fit.validateChargeSlot({ item, charge: charges[index] })
      ? { ...rawCharges[index], ...charges[index] }
      : false;
    rawItems[index] = item;
    rawCharges[index] = charge;
    payload.push({ item, charge });
    // If validation of charge fails, set rawCharge as false value
    if (charge === false) rawCharges[index] = false;
    // Set rawItems state as fetch complete(initial value was activation)
    if (!!rawItems[index] && !!itemState)
      rawItems[index]["typeState"] = itemState;
  });

  props.dispatchSlots({ type: props.variant, payload: payload });
  setters.setFetchedCharges([...rawCharges]); // If validation of charge fails, set rawCharge as false value
  setters.setFetchedItems([...rawItems]);
}

function assignItemToSlot(props, rawItems, rawCharges, activeSlotNumber) {
  rawItems[activeSlotNumber] = { ...props.listItems[props.variant] };

  //Sync chargeSlots count to itemSlots count
  if (rawCharges[activeSlotNumber] === undefined)
    rawCharges[activeSlotNumber] = false;
}
function addCountToDroneSlots(props, activeItem) {
  if (props.variant === "DRONE_SLOT" && activeItem.typeCount === undefined)
    activeItem["typeCount"] = 1;
}
function changeState(activeItem, state) {
  if (activeItem.typeState === undefined)
    activeItem["typeState"] = "activation";

  switch (state) {
    case "offline":
    case "overload":
    case "passive":
    case "activation":
      activeItem.typeState = state;
      break;
    default:
      activeItem.typeState = "activation";
      break;
  }
}
function checkData(rawItems, rawCharges) {
  return [
    ...hashTypes(rawItems),
    ...hashState(rawItems),
    ...hashCount(rawItems),
    ...hashTypes(rawCharges),
  ].join(":");
}
function hashTypes(types) {
  return types.map((type) => !!type && type.typeName).join("-");
}
function hashState(rawTypes) {
  return rawTypes.map((type) => !!type && type.typeState).join("-");
}
function hashCount(rawTypes) {
  return rawTypes.map((type) => !!type && type.typeCount).join("-");
}
function loopNumber(number, floor, ceiling, variant) {
  if (variant === "DRONE_SLOT") {
    if (number >= ceiling) return floor;
    return number + 1;
  }

  if (number + 1 >= ceiling) return floor;
  else return number + 1;
}
