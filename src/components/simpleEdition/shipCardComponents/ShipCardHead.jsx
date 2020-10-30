import React from "react";
import {
  findAttributesbyID,
  findAttributesByName,
} from "../../../services/dataManipulation/findAttributes";
import {
  makeStyles,
  Avatar,
  Grid,
  Button,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import {
  getModifiedAttrBonusValueMul,
  aggregateModifiedAttrBonusBySkillID,
} from "../../../services/dataManipulation/getModifiedAttrBonusValue";

import { useState } from "react";
import { useEffect } from "react";
import ItemSelectionList from "../../itemSelection/ItemSelectionList";
import PopperDedicated from "./PopperDedicated";
import { effectLazyFetch } from "../../../services/networks/lazyFetch";
import { useCallback } from "react";

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: 15,
    width: 75,
    height: 75,
  },
}));

export default function ShipCardHead(props) {
  const classes = useStyles();
  const [ship, setShip] = useState(false);

  const [rootBonusesBoard, setRootBonusesBoard] = useState([]);
  const [childrenBonusesBoard, setChildrenBonusesBoard] = useState([]);

  const [popoverShow, setPopoverShow] = useState(false);
  const [isPopoverOpened, setIsPopoverOpened] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback(
    (e) => {
      setIsPopoverOpened(true);
      setPopoverShow(!popoverShow);
      setAnchorEl(e.currentTarget);
    },
    [popoverShow]
  );

  const handleClose = useCallback(() => {
    setPopoverShow(false);
  }, []);

  useEffect(() => {
    handleClose();
  }, [ship.typeID]);

  useEffect(() => {
    props.setShip({
      highSlotsCount: findAttributesByName(ship, "High Slots"),
      midSlotsCount: findAttributesByName(ship, "Medium Slots"),
      lowSlotsCount: findAttributesByName(ship, "Low Slots"),
    });
  }, [ship.typeAttributesStats]);

  useEffect(() => {
    if (!ship.typeID) return;

    setIsDataFetching(true);

    const bonuses = getShipBonuses(ship);
    if (!bonuses || bonuses.constructor !== Array) return;

    const requiredSkills = getShipRequiredSkills(ship);
    if (!requiredSkills) return;

    const spreadedBonuses = [];
    bonuses.forEach((entry) =>
      entry.forEach((entry) => spreadedBonuses.push(entry))
    );

    const fetchedModifierInfos = [];
    Promise.all([
      Promise.resolve(spreadedBonuses),
      ...requiredSkills.map((entry) => effectLazyFetch(entry, props.cache)),
    ]).then((data) => {
      const spreadedBonuses = data[0];
      const requiredSkillsEffects = data.filter((_, index) => index > 0);
      requiredSkillsEffects.forEach((entry) => {
        entry.typeEffectsStats.forEach((stats) => {
          if (stats.effectID === 132) return; //132 is skilltraining time effectID
          stats.modifierInfo.forEach((info) =>
            fetchedModifierInfos.push({
              skillTypeID: entry.typeID,
              ...info,
            })
          );
        });
      });
      //TODO_LEGACY: make skill levels customizable in next
      setRootBonusesBoard(fetchedModifierInfos);
      setChildrenBonusesBoard(spreadedBonuses);
      setIsDataFetching(false);
    });
  }, [
    ship.typeID,
    ship?.typeAttributesStats?.[0]?.attributeID,
    ship?.typeAttributesStats?.[10]?.attributeID,
    ship?.typeAttributesStats?.[20]?.attributeID,
  ]);

  useEffect(() => {
    if (rootBonusesBoard.length === 0 || childrenBonusesBoard.length === 0)
      return;

    const rootModifiedAttributeIDs = rootBonusesBoard.map(
      (entry) => entry.modifiedAttributeID
    );
    const multipliedChildrenBonusesBoard = childrenBonusesBoard.map((entry) => {
      return {
        ...entry,
        value: rootModifiedAttributeIDs.includes(entry.modifyingAttributeID)
          ? entry.value * 5
          : entry.value,
      };
    });

    props.setShipBonuses(
      aggregateModifiedAttrBonusBySkillID(multipliedChildrenBonusesBoard)
    );
  }, [rootBonusesBoard, childrenBonusesBoard]);

  return (
    <Grid container alignContent="flex-start">
      <Grid container item xs={4} justify="center"></Grid>
      <Grid
        style={{ height: 105, width: 105 }}
        container
        item
        xs={4}
        justify="center"
      >
        <Avatar
          className={classes.avatar}
          alt="E"
          src={props.src}
          variant="rounded"
        >
          WILL
          <br />
          ADD
        </Avatar>
      </Grid>

      <Grid container item xs={4} justify="center"></Grid>

      <Grid container item xs={12} justify="center">
        <Button
          style={{ width: "100%", fontSize: 16 }}
          size="small"
          color={!!ship.typeID ? "primary" : "secondary"}
          onClick={handleClick}
        >
          {ship.typeName ? ship.typeName : "SELECT SHIP"}
        </Button>
      </Grid>
      <Grid container item xs={12} justify="center">
        <Grid style={{ margin: 10 }} container item xs={12} justify="center">
          {isDataFetching && <CircularProgress />}
          {props.activeBonuses.tracking > 1 && (
            <Chip
              style={{ margin: 5 }}
              size="small"
              label={`${
                (props.activeBonuses.tracking - 1) * 100
              }% bonus to tracking speed`}
            />
          )}
          {props.activeBonuses.optimal > 1 && (
            <Chip
              style={{ margin: 5 }}
              size="small"
              label={`${
                (props.activeBonuses.optimal - 1) * 100
              }% bonus to optimal range`}
            />
          )}
          {props.activeBonuses.falloff > 1 && (
            <Chip
              style={{ margin: 5 }}
              size="small"
              label={`${
                (props.activeBonuses.falloff - 1) * 100
              }% bonus to falloff range`}
            />
          )}
        </Grid>
        <Grid style={{ margin: 10 }} container item xs={12} justify="center">
          {props.calculatedValues.tracking > 0 ? (
            <Chip
              color="primary"
              variant="outlined"
              size="small"
              //prettier-ignore
              label={`Turret Tracking:${props.calculatedValues.tracking.toFixed(2)}`}
            />
          ) : undefined}
        </Grid>
        <Grid container item xs={12} justify="center">
          {props.calculatedValues.tracking > 0 ? (
            <Chip
              color="primary"
              variant="outlined"
              size="small"
              //prettier-ignore
              label={`Range:${props.calculatedValues.optimal.toFixed(2)} + ${props.calculatedValues.falloff.toFixed(2)}m`}
            />
          ) : undefined}
        </Grid>
      </Grid>

      <PopperDedicated
        ID={`shipCardHead`}
        visibility={popoverShow}
        itemRef={anchorEl}
        open={isPopoverOpened}
        _onClose={handleClose}
      >
        <ItemSelectionList
          /*   test={test()} */
          eveListConfig={{
            rootMarketGroupID: 4,
            state: {
              item: ship,
              setItem: setShip,
            },
          }}
          cache={props.cache}
        />
      </PopperDedicated>
    </Grid>
  );
}
function getShipRequiredSkills(ship) {
  if (!ship || !ship.typeAttributesStats) return undefined;

  //primary: 182 //secondary: 183 //triatry: 184
  const primary = findAttributesbyID(ship, 182);
  const secondary = findAttributesbyID(ship, 183);
  const triatry = findAttributesbyID(ship, 184);

  return [primary, secondary, triatry].filter((entry) => entry != undefined);
}
function getShipBonuses(ship) {
  if (!ship || !ship.typeEffectsStats) return undefined;
  if (!ship || !ship.typeAttributesStats) return undefined;
  if (!ship || !ship.traits || !ship.traits.types) return undefined;

  const typeAttributesStats = ship.typeAttributesStats;
  const typeEffectsStats = ship.typeEffectsStats;

  const bindTypeEffectsStatsWithValue = [];
  typeEffectsStats.forEach((entry) => {
    bindTypeEffectsStatsWithValue.push(
      entry.modifierInfo.map((info) => {
        const attributeStat = typeAttributesStats.find(
          (stat) => stat.attributeID === info.modifyingAttributeID
        );
        return {
          ...info,
          value: attributeStat.value,
        };
      })
    );
  });
  return bindTypeEffectsStatsWithValue;
}

/* function test() {
  return {
    basePrice: 24000000,
    capacity: 475,
    factionID: 500001,
    graphicID: 2382,
    groupID: 419,
    marketGroupID: 471,
    mass: 14250000,
    portionSize: 1,
    published: true,
    raceID: 1,
    radius: 215,
    sofFactionName: "caldaribase",
    soundID: 20068,
    traits: {
      roleBonuses: [
        {
          bonusText:
            "Can use one <a href=showinfo:3348>Command Burst</a> module",
        },
        {
          bonus: 25,
          bonusText:
            "bonus to <a href=showinfo:3304>Medium Hybrid Turret</a> optimal range and falloff",
        },
        {
          bonus: 50,
          bonusText:
            "bonus to <a href=showinfo:3348>Command Burst</a> area of effect range",
        },
      ],
      types: {
        "33096": [
          {
            bonus: 5,
            bonusText:
              "bonus to <a href=showinfo:3304>Medium Hybrid Turret</a> damage",
          },
          {
            bonus: 10,
            bonusText:
              "bonus to <a href=showinfo:3304>Medium Hybrid Turret</a> optimal range",
          },
        ],
      },
    },
    typeAttributesStats: [
      { attributeID: 3, attributeName: "Item Damage", value: 0 },
      { attributeID: 9, attributeName: "Structure Hitpoints", value: 4000 },
      { attributeID: 11, attributeName: "Powergrid Output", value: 1150 },
      { attributeID: 12, attributeName: "Low Slots", value: 4 },
      { attributeID: 13, attributeName: "Medium Slots", value: 6 },
      { attributeID: 14, attributeName: "High Slots", value: 7 },
      { attributeID: 15, attributeName: "Power Load", value: 0 },
      { attributeID: 19, attributeName: "powerToSpeed", value: 1 },
      { attributeID: 21, attributeName: "warpFactor", value: 0 },
      { attributeID: 37, attributeName: "Maximum Velocity", value: 145 },
      { attributeID: 48, attributeName: "CPU Output", value: 515 },
      { attributeID: 49, attributeName: "CPU Load", value: 0 },
      {
        attributeID: 55,
        attributeName: "Capacitor Recharge time",
        value: 725000,
      },
      { attributeID: 70, attributeName: "Inertia Modifier", value: 0.66 },
      {
        attributeID: 76,
        attributeName: "Maximum Targeting Range",
        value: 75000,
      },
      { attributeID: 79, attributeName: "scanSpeed", value: 7500 },
      { attributeID: 101, attributeName: "Launcher Hardpoints", value: 0 },
      { attributeID: 102, attributeName: "Turret Hardpoints", value: 6 },
      {
        attributeID: 109,
        attributeName: "Structure Kinetic Damage Resistance",
        value: 0.67,
      },
      {
        attributeID: 110,
        attributeName: "Structure Thermal Damage Resistance",
        value: 0.67,
      },
      {
        attributeID: 111,
        attributeName: "Structure Explosive Damage Resistance",
        value: 0.67,
      },
      {
        attributeID: 113,
        attributeName: "Structure EM Damage Resistance",
        value: 0.67,
      },
      { attributeID: 124, attributeName: "mainColor", value: 16777215 },
      { attributeID: 129, attributeName: "maxPassengers", value: 450 },
      { attributeID: 136, attributeName: "uniformity", value: 1 },
      { attributeID: 153, attributeName: "warpCapacitorNeed", value: 8.13e-7 },
      {
        attributeID: 182,
        attributeName: "Primary Skill required",
        value: 33096,
      },
      { attributeID: 192, attributeName: "Maximum Locked Targets", value: 8 },
      { attributeID: 208, attributeName: "RADAR Sensor Strength", value: 0 },
      { attributeID: 209, attributeName: "Ladar Sensor Strength", value: 0 },
      {
        attributeID: 210,
        attributeName: "Magnetometric Sensor Strength",
        value: 0,
      },
      {
        attributeID: 211,
        attributeName: "Gravimetric Sensor Strength",
        value: 19,
      },
      { attributeID: 217, attributeName: "propulsionGraphicID", value: 395 },
      { attributeID: 246, attributeName: "gfxBoosterID", value: 395 },
      { attributeID: 263, attributeName: "Shield Capacity", value: 5250 },
      { attributeID: 265, attributeName: "Armor Hitpoints", value: 3500 },
      {
        attributeID: 267,
        attributeName: "Armor EM Damage Resistance",
        value: 0.5,
      },
      {
        attributeID: 268,
        attributeName: "Armor Explosive Damage Resistance",
        value: 0.9,
      },
      {
        attributeID: 269,
        attributeName: "Armor Kinetic Damage Resistance",
        value: 0.75,
      },
      {
        attributeID: 270,
        attributeName: "Armor Thermal Damage Resistance",
        value: 0.55,
      },
      {
        attributeID: 271,
        attributeName: "Shield EM Damage Resistance",
        value: 1,
      },
      {
        attributeID: 272,
        attributeName: "Shield Explosive Damage Resistance",
        value: 0.5,
      },
      {
        attributeID: 273,
        attributeName: "Shield Kinetic Damage Resistance",
        value: 0.6,
      },
      {
        attributeID: 274,
        attributeName: "Shield Thermal Damage Resistance",
        value: 0.8,
      },
      { attributeID: 277, attributeName: "requiredSkill1Level", value: 1 },
      { attributeID: 283, attributeName: "Drone Capacity", value: 25 },
      { attributeID: 422, attributeName: "Tech Level", value: 1 },
      {
        attributeID: 479,
        attributeName: "Shield recharge time",
        value: 1400000,
      },
      { attributeID: 482, attributeName: "Capacitor Capacity", value: 2900 },
      { attributeID: 484, attributeName: "shieldUniformity", value: 0.75 },
      { attributeID: 524, attributeName: "armorUniformity", value: 0.75 },
      { attributeID: 525, attributeName: "structureUniformity", value: 1 },
      { attributeID: 552, attributeName: "Signature Radius", value: 325 },
      { attributeID: 564, attributeName: "Scan Resolution", value: 195 },
      { attributeID: 600, attributeName: "Warp Speed Multiplier", value: 3.5 },
      { attributeID: 633, attributeName: "Meta Level", value: 0 },
      {
        attributeID: 661,
        attributeName: "maxDirectionalVelocity",
        value: 2000,
      },
      {
        attributeID: 662,
        attributeName: "minTargetVelDmgMultiplier",
        value: 0.25,
      },
      { attributeID: 743, attributeName: "shipBonusCBC1", value: 10 },
      { attributeID: 745, attributeName: "shipBonusCBC2", value: 5 },
      { attributeID: 1132, attributeName: "Calibration", value: 400 },
      { attributeID: 1137, attributeName: "Rig Slots", value: 3 },
      { attributeID: 1154, attributeName: "Rig Slots", value: 3 },
      { attributeID: 1178, attributeName: "heatCapacityHi", value: 100 },
      {
        attributeID: 1179,
        attributeName: "heatDissipationRateHi",
        value: 0.01,
      },
      {
        attributeID: 1196,
        attributeName: "heatDissipationRateMed",
        value: 0.01,
      },
      {
        attributeID: 1198,
        attributeName: "heatDissipationRateLow",
        value: 0.01,
      },
      { attributeID: 1199, attributeName: "heatCapacityMed", value: 100 },
      { attributeID: 1200, attributeName: "heatCapacityLow", value: 100 },
      {
        attributeID: 1224,
        attributeName: "heatGenerationMultiplier",
        value: 0.65,
      },
      { attributeID: 1259, attributeName: "Heat Attenuation", value: 0.79 },
      { attributeID: 1261, attributeName: "heatAttenuationMed", value: 0.76 },
      { attributeID: 1262, attributeName: "heatAttenuationLow", value: 0.63 },
      { attributeID: 1271, attributeName: "Drone Bandwidth", value: 25 },
      { attributeID: 1281, attributeName: "Ship Warp Speed", value: 1 },
      { attributeID: 1547, attributeName: "Rig Size", value: 2 },
      { attributeID: 1555, attributeName: "fwLpKill", value: 200 },
      { attributeID: 1768, attributeName: "typeColorScheme", value: 11324 },
      { attributeID: 2043, attributeName: "roleBonusCBC", value: 25 },
      {
        attributeID: 2574,
        attributeName: "Command Burst Effect Range Bonus",
        value: 50,
      },
    ],
    typeEffectsStats: [
      {
        effectID: 5334,
        effectName: "shipHybridOptimal1CBC1",
        modifierInfo: [
          {
            modifiedAttributeID: 54,
            modifyingAttributeID: 743,
            operation: "postPercent",
            skillTypeID: 3304,
          },
        ],
      },
      {
        effectID: 6173,
        effectName: "battlecruiserMHTRange",
        modifierInfo: [
          {
            modifiedAttributeID: 54,
            modifyingAttributeID: 2043,
            operation: "postPercent",
            skillTypeID: 3304,
          },
          {
            modifiedAttributeID: 158,
            modifyingAttributeID: 2043,
            operation: "postPercent",
            skillTypeID: 3304,
          },
        ],
      },
      {
        effectID: 6177,
        effectName: "shipHybridDmg1CBC2",
        modifierInfo: [
          {
            modifiedAttributeID: 64,
            modifyingAttributeID: 745,
            operation: "postPercent",
            skillTypeID: 3304,
          },
        ],
      },
      {
        effectID: 6783,
        effectName: "commandBurstAoERoleBonus",
        modifierInfo: [
          {
            modifiedAttributeID: 54,
            modifyingAttributeID: 2574,
            operation: "postPercent",
            skillTypeID: 3348,
          },
        ],
      },
    ],
    typeID: 16227,
    typeName: "Ferox",
    volume: 252000,
  };
} */
//54: optimal range //160: turretTracking //158: falloff
