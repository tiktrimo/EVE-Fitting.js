import React from "react";
import {
  ListItem,
  makeStyles,
  Grid,
  Typography,
  TextField,
} from "@material-ui/core";
import { useState } from "react";

import Stat from "./services/Stat";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    marginBottom: 8,
    width: "100%",
    paddingLeft: 10,
  },
  boldTypography: {
    fontSize: 14,
    fontWeight: 700,
  },
}));

const GridBoldTypography = (props) => {
  const classes = useStyles();

  return (
    <Grid style={{ flexBasis: 140, maxWidth: 140 }}>
      <TextField
        label={
          <Typography className={classes.boldTypography} noWrap>
            {props.children}
          </Typography>
        }
        value={props.value || 0}
        InputProps={{
          readOnly: true,
          disableUnderline: true,
        }}
        inputProps={{
          style: {
            padding: "2px 0px 2px 0px",
            fontSize: 14,
            fontWeight: 700,
          },
        }}
      />
    </Grid>
  );
};

export default function ResourcesMiscellaneousListItem(props) {
  const classes = useStyles();

  const [misc, setMisc] = useState(Stat.defaultStat.miscellaneous);

  useEffect(() => {
    setMisc(props.stat.miscellaneous);
  }, [props.stat.miscellaneous]);

  return (
    <ListItem className={classes.root} key="onlyOne">
      <Grid justifyContent="center" container>
        <GridBoldTypography
          value={misc.sensor.maximumLockedTarget}
        >{`Max Locked Target`}</GridBoldTypography>
        <GridBoldTypography
          value={misc.sensor.maximumTargetingRange}
        >{`Max Trageting Range (m)`}</GridBoldTypography>
        <GridBoldTypography
          value={misc.sensor.scanResolution}
        >{`Scan Resolution (mm)`}</GridBoldTypography>

        <GridBoldTypography
          value={misc.sensor.strength.gravimetric?.toFixed(1)}
        >
          {`Gravimetric (point)`}
        </GridBoldTypography>
        <GridBoldTypography
          value={misc.sensor.strength.magnetometric?.toFixed(1)}
        >
          {`Magnetometric (point)`}
        </GridBoldTypography>
        <GridBoldTypography
          value={misc.sensor.strength.ladar?.toFixed(1)}
        >{`Ladar (point)`}</GridBoldTypography>
        <GridBoldTypography
          value={misc.sensor.strength.radar?.toFixed(1)}
        >{`Radar (point)`}</GridBoldTypography>

        <GridBoldTypography
          value={misc.propulsion.TextFieldmaximumVelocity?.toFixed(2)}
        >{`Max Velocity (m/sec)`}</GridBoldTypography>
        <GridBoldTypography
          value={misc.propulsion.inertialModifier?.toFixed(6)}
        >{`Inertia Modifier (x)`}</GridBoldTypography>
        <GridBoldTypography
          value={misc.propulsion.warpSpeedMultiplier}
        >{`Warp Speed Modifier (x)`}</GridBoldTypography>
        <GridBoldTypography
          value={misc.misc.signatureRadius?.toFixed(2)}
        >{`Signature Radius (m)`}</GridBoldTypography>
        <Grid style={{ flexBasis: 140 }} item />
      </Grid>
    </ListItem>
  );
}
