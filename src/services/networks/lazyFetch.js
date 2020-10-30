import { database } from "../../index";

export function itemLazyFetch(item, cache) {
  if (!item) return Promise.resolve(undefined);
  if (!!item.typeAttributeStats || !item.typeID)
    return Promise.resolve(undefined);

  return cache.get(`typeID/${item.typeID}`, () => {
    return database
      .ref(`/compressed/completeInvTypesTable/${item.typeID}`)
      .once("value")
      .then((data) => data.val());

    /* return fetch(
      `https://us-central1-eve-damagecontrol.cloudfunctions.net/compressed-getCompleteTypeID?typeID=${item.typeID}`
    ).then((data) => data.json()); */
  });
}
export function effectLazyFetch(typeID, cache) {
  return cache.get(`typeEffectsStats/${typeID}`, () => {
    return database
      .ref(`/compressed/completeInvTypesTable/${typeID}/typeEffectsStats`)
      .once("value")
      .then((data) => data.val())
      .then((data) => {
        if (data === null) return data;
        else
          return {
            typeID: typeID,
            typeEffectsStats: [...data],
          };
      });

    /* return fetch(
      `https://us-central1-eve-damagecontrol.cloudfunctions.net/compressed-getCompleteTypeEffects?typeID=${typeID}`
    ).then((data) => data.json()); */
  });
}
