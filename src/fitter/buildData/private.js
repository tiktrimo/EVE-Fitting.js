const PRIVATE_TYPE_IDs = {
  34319: {
    typeName: "Confessor Defense Mode",
    marketGroupID: 10001,
  },
  34321: {
    typeName: "Confessor Sharpshooter Mode",
    marketGroupID: 10001,
  },
  34323: {
    typeName: "Confessor Propulsion Mode",
    marketGroupID: 10001,
  },
  35676: {
    typeName: "Jackdaw Defense Mode",
    marketGroupID: 10002,
  },
  35677: {
    typeName: "Jackdaw Propulsion Mode",
    marketGroupID: 10002,
  },
  35678: {
    typeName: "Jackdaw Sharpshooter Mode",
    marketGroupID: 10002,
  },
  35686: {
    typeName: "Hecate Defense Mode",
    marketGroupID: 10003,
  },
  35687: {
    typeName: "Hecate Propulsion Mode",
    marketGroupID: 10003,
  },
  35688: {
    typeName: "Hecate Sharpshooter Mode",
    marketGroupID: 10003,
  },
  34564: {
    typeName: "Svipul Defense Mode",
    marketGroupID: 10004,
  },
  34566: {
    typeName: "Svipul Propulsion Mode",
    marketGroupID: 10004,
  },
  34570: {
    typeName: "Svipul Sharpshooter Mode",
    marketGroupID: 10004,
  },
  28668: {
    typeName: "Nanite Repair Paste",
    marketGroupID: 1103,
  },
};
const PRIVATE_MARKET_GROUP_IDs = [
  {
    marketGroupID: 10000,
    marketGroupName: "Tactical Destroyer Mode",
    hasTypes: false,
    iconFileName: "99_64_8_.png",
  },
  {
    parentGroupID: 10000,
    marketGroupID: 10001,
    marketGroupName: "Amarr",
    hasTypes: true,
    iconFileName: "MarketIcon_16px_Amarr.png",
  },
  {
    parentGroupID: 10000,
    marketGroupID: 10002,
    marketGroupName: "Caldari",
    hasTypes: true,
    iconFileName: "MarketIcon_16px_Caldari.png",
  },
  {
    parentGroupID: 10000,
    marketGroupID: 10003,
    marketGroupName: "Gallente",
    hasTypes: true,
    iconFileName: "MarketIcon_16px_Gallente.png",
  },
  {
    parentGroupID: 10000,
    marketGroupID: 10004,
    marketGroupName: "Minmatar",
    hasTypes: true,
    iconFileName: "MarketIcon_16px_Minmatar.png",
  },
];

exports.PRIVATE_TYPE_IDs = PRIVATE_TYPE_IDs;
exports.PRIVATE_MARKET_GROUP_IDs = PRIVATE_MARKET_GROUP_IDs;
