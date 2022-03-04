const yaml = require("js-yaml");
const fs = require("fs");
const CJSON = require("compressed-json");
const firebaseAPI = require("../../key/ignore/firebaseAPI");
const firebase = require("firebase/app").default;
require("firebase/storage");
const buffer = require("buffer");

firebase.initializeApp(firebaseAPI);
const storage = firebase.storage();
const typeIDs = yaml.safeLoad(
  fs.readFileSync("../jsons/ignore/typeIDsPretty.json", "utf8")
);

const addTypeToStorage = (typeIDs, id) => {
  const type = typeIDs[id];
  const typeIDref = storage.ref(`/typeIDs/typeID${id}.json`);
  const blob = buffer.Buffer.from(JSON.stringify(CJSON.compress(type)));

  return typeIDref
    .put(blob)
    .then(() => {
      return true;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });

  /* fs.writeFileSync(
    `../jsons/ignore/typeIDs/typeID${id}.json`,
    JSON.stringify(CJSON.compress(type))
  ); */
};
const uploadInRange = async (typeIDs, from, to) => {
  try {
    const ids = Object.keys(typeIDs)
      .map((id) => Number(id))
      .slice(from, to);
    let index = from;
    const promises = [];
    for (id of ids) {
      console.log(index++, to);
      if (!!typeIDs[id]) promises.push(addTypeToStorage(typeIDs, id));
    }

    const success = await Promise.all(promises)
      .then((d) => {
        if (to > typeIDs.length) return false;
        return true;
      })
      .catch((e) => {
        console.log(e);
        return false;
      });

    if (success) {
      return uploadInRange(typeIDs, to, to + (to - from));
    } else return false;
  } catch (e) {
    console.log(e);
  }
};
(async () => {
  const isGood = await uploadInRange(typeIDs, 0, 500);
  console.log("finish", isGood);
})();

// Update all typeIDs in storage/typeIDs folder. it will take some time. be patient. error will be shown when fetch fails
// IMPORTANT!! dont forget to update storage rule -> write = true!
