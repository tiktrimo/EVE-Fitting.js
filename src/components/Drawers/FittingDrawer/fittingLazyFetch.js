import { database, storage } from "../../../index";
import cJSON from "compressed-json";

export default function lazyFetch(cache, typeIDs) {
  typeIDs.forEach((typeID) => {
    cache.get(`typeID/${typeID}`, () => {
      //storage version
      const saved = localStorage.getItem(`typeID/${typeID}`);
      if (saved !== null) return Promise.resolve(JSON.parse(saved));

      return storage
        .ref(`/typeIDs/typeID${typeID}.json`)
        .getDownloadURL()
        .then(async (url) => {
          const result = await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
          localStorage.setItem(`typeID/${typeID}`, JSON.stringify(result));
          return result;
        });
      //realtime database version
      return database
        .ref(`typeIDs/${typeID}`)
        .once("value")
        .then((data) => data.val());
    });
  });
}
