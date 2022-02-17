import {
  Avatar,
  Grid,
  ListItem,
  TextField,
  Typography,
  useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import LinearProgressLabel from "../FitCard/Stats/LinearProgressLabel.jsx";
import {
  ArmorIcon,
  EhpIcon,
  ShieldIcon,
  StructureIcon,
} from "../Icons/defenseIcons.jsx";
import { CapacitorChargeIcon } from "../Icons/capacitorIcons";

const useStyles = makeStyles((theme) => ({}));

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

export default function ShipStatusPanel(props) {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <React.Fragment>
      {!!props.summaries && (
        <div style={{ width: "100%" }}>
          <div
            style={{ width: "100%", height: 10, backgroundColor: props.color }}
          ></div>
          <div style={{ width: "100%" }}>
            <ListItem style={{ width: "100%" }}>
              <Grid justifyContent="center" container>
                <GridBoldTypography
                  value={props.summaries.summary?.capacity.misc.signatureRadius}
                >{`Signature Radius (m)`}</GridBoldTypography>
                <GridBoldTypography
                  value={
                    props.summaries.summary?.capacity.propulsion.maximumVelocity
                  }
                >{`Max Velocity (m/sec)`}</GridBoldTypography>
              </Grid>
            </ListItem>
          </div>
          <div style={{ width: "100%" }}>
            <LinearProgressLabel
              showDivider
              value={
                (props.summaries.summary?.load.shield.HP /
                  props.summaries.summary?.capacity.shield.HP) *
                100
              }
              label={`${props.summaries.summary?.load.shield.HP.toFixed(1)}`}
              /*  description={`/ ${props.summaries.summary?.capacity.shield.HP.toFixed(
                1
              )}`} */
              typographyProps={{
                style: {
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: 14,
                },
              }}
              /*   backgroundColor={theme.palette.property.blueSecondary}
              color={theme.palette.property.blue} */
              backgroundColor={theme.palette.action.opaqueHover}
              color={theme.palette.background.paper}
              Icon={
                <div style={{ height: 24 }}>
                  <ShieldIcon color={theme.palette.text.primary} />
                </div>
              }
            />
            <LinearProgressLabel
              showDivider
              value={
                (props.summaries.summary?.load.armor.HP /
                  props.summaries.summary?.capacity.armor.HP) *
                100
              }
              label={`${props.summaries.summary?.load.armor.HP.toFixed(
                1
              )} / ${props.summaries.summary?.capacity.armor.HP.toFixed(1)}`}
              typographyProps={{
                style: {
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: 14,
                },
              }}
              /*  backgroundColor={theme.palette.property.redSecondary}
              color={theme.palette.property.red} */
              backgroundColor={theme.palette.action.opaqueHover}
              color={theme.palette.background.paper}
              Icon={
                <div style={{ height: 24 }}>
                  <ArmorIcon color={theme.palette.text.primary} />
                </div>
              }
            />
            <LinearProgressLabel
              showDivider
              value={
                (props.summaries.summary?.load.structure.HP /
                  props.summaries.summary?.capacity.structure.HP) *
                100
              }
              label={`${props.summaries.summary?.load.structure.HP.toFixed(
                1
              )} / ${props.summaries.summary?.capacity.structure.HP.toFixed(
                1
              )}`}
              typographyProps={{
                style: {
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: 14,
                },
              }}
              backgroundColor={theme.palette.action.opaqueHover}
              color={theme.palette.background.paper}
              Icon={
                <div style={{ height: 24 }}>
                  <StructureIcon color={theme.palette.text.primary} />
                </div>
              }
            />
            <LinearProgressLabel
              value={
                (props.summaries.summary?.load.capacitor.HP /
                  props.summaries.summary?.capacity.capacitor.HP) *
                100
              }
              label={`${props.summaries.summary?.load.capacitor.HP.toFixed(
                1
              )} / ${props.summaries.summary?.capacity.capacitor.HP.toFixed(
                1
              )}`}
              backgroundColor={theme.palette.property.orgSecondary}
              color={theme.palette.property.org}
            />
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

function feedSource(summary) {
  const itemID = summary.itemID;

  return (
    <img
      draggable="false"
      style={{ width: "100%" }}
      src={`https://images.evetech.net/types/${itemID}/icon?size=64`}
    />
  );
}
