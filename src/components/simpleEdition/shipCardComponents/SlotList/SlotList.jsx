import React from "react";
import ItemSelectionListLazy from "../../../itemSelection/ItemSelectionListLazy";
import { useState } from "react";
import Slot from "./Slot";
import { useEffect } from "react";
import PopperDedicated from "../PopperDedicated";
import { itemLazyFetch } from "../../../../services/networks/lazyFetch";
import { useReducer } from "react";
import { findAttributesByName } from "../../../../services/dataManipulation/findAttributes";
import { useCallback } from "react";

const initialItemData = {
  item: {},
  charge: {},
};
function itemDataReducer(state, action) {
  switch (action.type) {
    case "ITEM":
      return {
        ...state,
        item: {
          ...action.payload,
        },
      };
    case "CHARGE":
      return {
        ...state,
        charge: {
          ...action.payload,
        },
      };
    case "RESET":
      return initialItemData;
  }
}

export default function SlotList(props) {
  const [itemData, dispatchItemData] = useReducer(
    itemDataReducer,
    initialItemData
  );
  const [itemSlotNumber, setItemSlotNumber] = useState(false);

  const [slots, setSlots] = useState(new Array(8));
  const [fetchedSlots, setFetchedSlots] = useState(new Array(8));
  const [isFetched, setIsFetched] = useState(new Array(8));

  const [itemPopoverShow, setItemPopoverShow] = useState(false);
  const [isItemPopoverOpened, setIsItemPopoverOpened] = useState(false);

  const [chargePopoverShow, setChargePopoverShow] = useState(false);
  const [isChargePopoverOpened, setIsChargePopoverOpened] = useState(false);

  const [isButtonOpenClicked, setIsButtonOpenClicked] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleItemClick = useCallback(
    (slotNumber) => (e) => {
      setIsItemPopoverOpened(true);

      setItemSlotNumber(slotNumber);
      setItemPopoverShow(
        itemSlotNumber !== slotNumber || !itemPopoverShow
          ? true
          : !itemPopoverShow
      ); // clicking activated slot will close the pooper. clickcing other slot will reamin same // clicking button will not close the popper

      /*   setIsButtonOpenClicked(itemSlotNumber !== slotNumber ? true : false); */
      setAnchorEl(e.currentTarget);
    },
    [itemSlotNumber, itemPopoverShow]
  );

  const handleItemClose = useCallback(() => {
    /* if (isButtonOpenClicked) return;

    setIsButtonOpenClicked(false); */
    setItemPopoverShow(false);
  }, [isButtonOpenClicked]);

  const handleItemDelete = useCallback(
    (slotNumber) => (e) => {
      e.stopPropagation();
      slots[slotNumber] = undefined;
      setSlots([...slots]);
      fetchedSlots[slotNumber] = undefined;
      setFetchedSlots([...fetchedSlots]);
      dispatchItemData({ type: "RESET" });
      setItemSlotNumber(-1);
      props.dispatchSlots({ type: props.type, payload: fetchedSlots });
    },
    [slots, fetchedSlots]
  );

  const handleChargeClick = useCallback(
    (slotNumber) => (e) => {
      e.stopPropagation();
      setIsChargePopoverOpened(true);
      setChargePopoverShow(true);
      setItemSlotNumber(slotNumber);
    },
    []
  );

  const handleChargeClose = useCallback(() => {
    setChargePopoverShow(false);
  }, []);

  useEffect(() => {
    setIsChargePopoverOpened(false);
    dispatchItemData({ type: "CHARGE", payload: {} });
  }, [itemData.item.typeID]);

  useEffect(() => {
    setItemPopoverShow(false);
    setChargePopoverShow(false);
  }, [itemData.item.typeID, itemData.charge.typeID]);

  useEffect(() => {
    setSlots(new Array(8));
    setFetchedSlots(new Array(8));
    setItemSlotNumber(-1);
  }, [
    props.ship?.highSlotsCount,
    props.ship?.midSlotsCount,
    props.ship?.lowSlotsCount,
  ]);

  useEffect(() => {
    if (!!itemData.item.typeID) {
      slots[itemSlotNumber] = itemData;
      setSlots([...slots]);

      isFetched[itemSlotNumber] = false;
      setIsFetched([...isFetched]);

      Promise.all([
        Promise.resolve(itemSlotNumber),
        itemLazyFetch(itemData.item, props.cache),
        itemLazyFetch(itemData.charge, props.cache),
      ]).then((data) => {
        const itemSlotNumber = data[0];
        const item = { ...data[1], ...slots[itemSlotNumber].item };
        const charge = data[2];

        fetchedSlots[itemSlotNumber] = { item, charge };
        setFetchedSlots([...fetchedSlots]);
        props.dispatchSlots({ type: props.type, payload: fetchedSlots });

        isFetched[itemSlotNumber] = true;
        setIsFetched([...isFetched]);

        return;
      });
    }
  }, [itemSlotNumber, itemData.item.typeID, itemData.charge.typeID]);

  return (
    <React.Fragment>
      {createMultipleSlots(props, {
        handleItemClick: handleItemClick,
        handleChargeClick: handleChargeClick,
        handleItemDelete: handleItemDelete,
        itemSlotNumber: itemSlotNumber,
        item: itemData.item,
        charge: itemData.charge,
        isFetched: isFetched,
      })}

      <PopperDedicated
        ID={`${props.type}:ItemPopover`}
        visibility={itemPopoverShow}
        itemRef={anchorEl}
        open={isItemPopoverOpened}
        _onClose={handleItemClose}
      >
        <ItemSelectionListLazy
          eveListConfig={{
            rootMarketGroupID: 9,
            state: {
              item: itemData.item,
              setItem: (payload) => {
                dispatchItemData({ type: "ITEM", payload });
              },
            },
            filter: {
              allowedAttributes: [
                {
                  attributeName: attributeName(props.type),
                  value: true,
                },
              ],
            },
          }}
          cache={props.cache}
        />
      </PopperDedicated>
      <PopperDedicated
        ID={`${props.type}:ChargePopover`}
        visibility={chargePopoverShow}
        itemRef={anchorEl}
        open={isChargePopoverOpened}
        _onClose={handleChargeClose}
      >
        <ItemSelectionListLazy
          eveListConfig={{
            rootMarketGroupID: 11,
            state: {
              item: itemData.charge,
              setItem: (payload) => {
                dispatchItemData({ type: "CHARGE", payload });
              },
            },
            filter: {
              allowedAttributes: [
                {
                  attributeName: "typeGroupID",
                  value: findAttributesByName(
                    fetchedSlots[itemSlotNumber]?.item,
                    "Used with (Charge Group)"
                  ),
                },
                {
                  attributeName: "typeChargeSize",
                  value: findAttributesByName(
                    fetchedSlots[itemSlotNumber]?.item,
                    "Charge size"
                  ),
                },
              ],
            },
          }}
          cache={props.cache}
        />
      </PopperDedicated>
    </React.Fragment>
  );
}
function createMultipleSlots(props, state) {
  if (!props.count) return undefined;

  const count = props.count;
  const multipleSlots = [];
  for (let i = 0; i < count; i++) {
    multipleSlots.push(
      <Slot
        key={`${props.type}:${i}`}
        item={state.itemSlotNumber === i ? state.item : undefined}
        charge={state.itemSlotNumber === i ? state.charge : undefined}
        isFetched={state.isFetched[i]}
        onItemClick={state.handleItemClick(i)}
        onChargeClick={state.handleChargeClick(i)}
        onItemDelete={state.handleItemDelete(i)}
        slotConfig={{
          type: props.type,
          number: i,
        }}
      />
    );
  }

  return multipleSlots;
}
function attributeName(type) {
  switch (type) {
    case "HIGH_SLOT":
      return "typeIsHiPower";
    case "MID_SLOT":
      return "typeIsMedPower";
    case "LOW_SLOT":
      return "typeIsLoPower";
  }
}
/* const state = {
    handleItemClick: Function,
    item: Object,
    itemSlotNumber: Number
  } */
