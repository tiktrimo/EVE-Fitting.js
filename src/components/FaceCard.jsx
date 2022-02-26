import React from "react";
import {
  Grid,
  Card,
  Chip,
  Fab,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import CacheService from "../cache/cacheService";

import ShipCard from "./simpleEdition/shipCardComponents/ShipCard.jsx";
import ShipSelection from "./simpleEdition/ShipSelection";
import SkillSlider from "./simpleEdition/SkillSlider";
import ShipCanvas from "./simpleEdition/ShipCanvas";
import { useEffect } from "react";
import { database, storage } from "../index";
import { useState } from "react";
import cJSON from "compressed-json";

const ttl = 60 * 60 * 1;
const cache = new CacheService(ttl);

export default function FaceCard(props) {
  const [skills, setSkills] = useState([5, 5, 5]);

  const [distance, setDistance] = useState(1750);
  const [hostileVector, setHostileVector] = useState({});
  const [distanceVector, setDistanceVector] = useState({});
  const [onBoardVector, setOnBoardVector] = useState({});

  const [optimalRange, setOptimalRange] = useState(0);
  const [fallOffRange, setFallOffRange] = useState(0);
  const [trackingValue, setTrackingValue] = useState(0);

  const [signatureRadius, setSignatureRadius] = useState(0);

  const [hitChance, setHitChance] = useState(0);
  const [calculatedValue, setCalculatedValue] = useState(false);
  const [openLicense, setOpenLicense] = useState(false);

  useEffect(() => {
    setHitChance(
      chanceToHit(
        distance,
        distanceVector,
        onBoardVector,
        hostileVector,
        trackingValue,
        signatureRadius,
        optimalRange,
        fallOffRange
      )
    );
  }, [
    distance,
    distanceVector,
    onBoardVector,
    hostileVector,
    trackingValue,
    signatureRadius,
    optimalRange,
    fallOffRange,
  ]);

  useEffect(() => {
    setCalculatedValue({
      optimal: optimalRange,
      falloff: fallOffRange,
      tracking: trackingValue,
    });
  }, [optimalRange, fallOffRange, trackingValue]);

  useEffect(() => {
    cache.get("/marketCategories", () => {
      return storage
        .ref("json/test/marketCategories.json")
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
        });

      /* return database
        .ref("/compressed/compressedArray/marketCategories")
        .once("value")
        .then((data) => data.val()); */

      /*  return fetch(
        "https://us-central1-eve-damagecontrol.cloudfunctions.net/compressed-getMarketCategories"
      ).then((data) => data.json()); */
    });
  }, []);

  useEffect(() => {
    cache.get("/typeIDsTable", () => {
      return storage
        .ref("/json/test/listInvTypesTable.json")
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
        });

      /*  return database
        .ref("/compressed/compressedArray/typeIDsTable")
        .once("value")
        .then((data) => data.val()); */

      /* return fetch(
        "https://us-central1-eve-damagecontrol.cloudfunctions.net/compressed-getArrayTypeIDsTable"
      ).then((data) => data.json()); */
    });
  }, []);

  return (
    <React.Fragment>
      <Grid spacing={2} container>
        <Grid style={{ height: 40 }} container item xs={12}></Grid>
        <Grid container item xs={12} justifyContent="center">
          <ShipCard
            skills={skills}
            calculatedValues={calculatedValue}
            setOptimalRange={setOptimalRange}
            setFallOffRange={setFallOffRange}
            setTrackingValue={setTrackingValue}
            cache={cache}
          />
        </Grid>

        <Grid container item xs={12} justifyContent="center">
          <ShipSelection
            setSignatureRadius={setSignatureRadius}
            cache={cache}
          />
        </Grid>
        <Grid container item xs={12} justifyContent="center">
          <div style={{ width: 320 }}>
            <Chip
              style={{ marginInlineEnd: 5 }}
              color="primary"
              size="small"
              label="All Skill V"
            />

            <Chip
              size="small"
              label={`Chance to hit: ${(hitChance * 100).toFixed(1)}%`}
              color={hitChance > 0.5 ? "primary" : "secondary"}
            />
          </div>
        </Grid>

        <Grid container item xs={12} justifyContent="center">
          <ShipCanvas
            distance={setDistance}
            hostileVector={setHostileVector}
            onBoardVector={setOnBoardVector}
            distanceVector={setDistanceVector}
          />
        </Grid>

        {/* <Grid container item xs={12} justifyContent="center">
          <SkillSlider setSkills={setSkills} />
        </Grid> */}
      </Grid>

      <Grid container item xs={12} justifyContent="center">
        <Card
          style={{ height: 100, width: 320, margin: 5, padding: 10 }}
          elevation={0}
        >
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  alt="T"
                  src="https://images.evetech.net/characters/95966660/portrait?size=128"
                />
              </ListItemAvatar>

              <ListItemText
                primary="Tiktrimo"
                secondary="ISK is always appreciated!!"
              />
            </ListItem>
          </List>
        </Card>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Chip
          color="primary"
          variant="default"
          label="License and More"
          onClick={() => {
            setOpenLicense(!openLicense);
          }}
          clickable
        />
      </Grid>
      <Grid
        style={{ height: 50 }}
        container
        item
        xs={12}
        justifyContent="center"
      >
        {openLicense && (
          <div>
            <Card style={{ padding: 10, margin: 10 }} elevation={2}>
              <Typography variant="h5" color="textPrimary">
                Patch History:
              </Typography>

              <Typography variant="body2" color="textSecondary">
                2020/05/17: Added mobile friendly feature(magnify button,
                pantool button)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/05/16: Network latency optimized
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/05/13: Performance optimized
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/05/12: Ship fitting service introduced
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/04/17: Website posted
              </Typography>
            </Card>
            <Card style={{ padding: 10 }} elevation={2}>
              <Typography variant="h5" color="textPrimary">
                <br />
                Used Frameworks & Libraries:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Material UI - MIT
                <br />
                Konva - MIT
                <br />
                Node-cache - MIT
                <br />
                Node-fetch - MIT
                <br />
                React - MIT
                <br />
                React-Konva - MIT
                <br />
                React-script - MIT
                <br />
                Styled-components - MIT
                <br />
              </Typography>
            </Card>
          </div>
        )}
      </Grid>

      <Fab
        style={{ position: "fixed", right: "85%", bottom: "5%" }}
        color={hitChance > 0.5 ? "primary" : "secondary"}
        size="small"
      >
        <Typography variant="caption">
          {`${(hitChance * 100).toFixed(1)}%`}
        </Typography>
      </Fab>
    </React.Fragment>
  );
}
function chanceToHit(
  distance,
  distanceVector,
  onBoardVector,
  hostileVector,
  trackingValue,
  signatureRadius,
  optimalRange,
  fallOffRange
) {
  const _angularVelocity = angularVelocity(
    distance,
    distanceVector,
    onBoardVector,
    hostileVector
  );
  const _trackingPart = trackingPart(
    _angularVelocity,
    trackingValue,
    signatureRadius
  );

  const _distancePart = distancePart(optimalRange, fallOffRange, distance);

  return Math.pow(0.5, _trackingPart + _distancePart).toFixed(3);
}

function trackingPart(angularVelocity, trackingValue, signatureRadius) {
  const denominator = trackingValue * signatureRadius;
  const numerator = angularVelocity * 40000;
  return Math.pow(numerator / denominator, 2);
}
function distancePart(optimal, fallOff, distance) {
  const denominator = fallOff;
  const numerator = Math.max(0, distance * 1000 - optimal);
  return Math.pow(numerator / denominator, 2);
}

function angularVelocity(
  distance,
  distanceVector,
  onBoardVector,
  hostileVector
) {
  if (
    validateVector(distanceVector) &&
    validateVector(onBoardVector.vector) &&
    validateVector(hostileVector.vector)
  ) {
    const perpendicularVector = { x: -distanceVector.y, y: distanceVector.x };
    const perpendicularUnitVector = makeUnitVector(perpendicularVector);
    const hostileOrbitalVelocity = innerProduct(
      perpendicularUnitVector,
      hostileVector.vector
    );
    const onBoardOrbitalVelocity = innerProduct(
      perpendicularUnitVector,
      onBoardVector.vector
    );
    const trueObitalVelocity =
      (hostileOrbitalVelocity - onBoardOrbitalVelocity) * 3;
    return trueObitalVelocity / (distance * 1000);
  } else return false;
}
function innerProduct(unitVector, velocityVector) {
  return unitVector.x * velocityVector.x + unitVector.y * velocityVector.y;
}
function makeUnitVector(vector) {
  const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return { x: vector.x / length, y: vector.y / length };
}
function validateVector(vector) {
  if (vector.x !== undefined && vector.y !== undefined) return true;
  else return false;
}
