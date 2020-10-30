import React, { useState } from "react";
import { Card, Grid, makeStyles } from "@material-ui/core";
import ShipCardHead from "./ShipCardHead";
import ShipCardMain from "./ShipCardMain";
import { useEffect } from "react";
import {
  getModifiedAttrBonusSkillTypeID,
  getModifiedAttrBonusValueMul,
} from "../../../services/dataManipulation/getModifiedAttrBonusValue";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 320,
    minHeight: 320,
  },
  gridHead: {
    minHeight: 320,
    width: "100%",
  },
}));

export default React.memo(function ShipCanvas(props) {
  const classes = useStyles();

  const [ship, setShip] = useState(false);
  const [shipBonuses, setShipBonuses] = useState(false);
  const [activeBonuses, setActiveBonuses] = useState({
    optimal: 1,
    falloff: 1,
    tracking: 1,
  });
  const [turret, setTurret] = useState(false);

  useEffect(() => {
    if (!shipBonuses) return;

    const optimalBonusValue = shipBonuses
      .find((entry) => entry.skillTypeID === turret.primarySkillRequired)
      ?.bonuses.find((entry) => entry.modifiedAttributeID === 54)?.value;
    const falloffBonusValue = shipBonuses
      .find((entry) => entry.skillTypeID === turret.primarySkillRequired)
      ?.bonuses.find((entry) => entry.modifiedAttributeID === 158)?.value;
    const trackingBonusValue = shipBonuses
      .find((entry) => entry.skillTypeID === turret.primarySkillRequired)
      ?.bonuses.find((entry) => entry.modifiedAttributeID === 160)?.value;

    const optimalRange = turret.optimalRange * (1 + props.skills[2] * 0.05);
    const trackingValue = turret.trackingValue * (1 + props.skills[0] * 0.05);
    const falloffRange = turret.falloffRange * (1 + props.skills[1] * 0.05);

    props.setOptimalRange(
      !!optimalBonusValue ? optimalRange * optimalBonusValue : optimalRange
    );
    props.setTrackingValue(
      !!trackingBonusValue ? trackingValue * trackingBonusValue : trackingValue
    );
    props.setFallOffRange(
      !!falloffBonusValue ? falloffRange * falloffBonusValue : falloffRange
    );

    setActiveBonuses({
      optimal: optimalBonusValue,
      falloff: falloffBonusValue,
      tracking: trackingBonusValue,
    });
  }, [turret, ...props.skills, shipBonuses]);
  /* props.skills = [tracking, fallOff, optiaml] */
  /*54: optimal  160: tracking 158: falloff*/
  return (
    <Card className={classes.root} elevation={!!ship.highSlotsCount ? 1 : 6}>
      <Grid container justify="center">
        <Grid
          className={classes.gridHead}
          style={{ height: "100%" }}
          container
          item
          xs={12}
        >
          <ShipCardHead
            cache={props.cache}
            activeBonuses={activeBonuses}
            setShip={setShip}
            setShipBonuses={setShipBonuses}
            calculatedValues={props.calculatedValues}
          />
        </Grid>
        <Grid style={{ height: "100%" }} container item xs={12}>
          <ShipCardMain
            ship={ship}
            highSlotCount={ship.highSlotsCount}
            midSlotCount={ship.midSlotsCount}
            lowSlotCount={ship.lowSlotsCount}
            setTurret={setTurret}
            cache={props.cache}
          />
        </Grid>
      </Grid>
    </Card>
  );
});
