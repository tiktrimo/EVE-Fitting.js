import { database } from "../../../index";

export default function lazyFetch(cache, typeIDs) {
  typeIDs.forEach((typeID) => {
    cache.get(`typeID/${typeID}`, () => {
      return database
        .ref(`typeIDs/${typeID}`)
        .once("value")
        .then((data) => data.val());
    });
  });
}
