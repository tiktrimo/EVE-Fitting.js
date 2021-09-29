import { useTheme } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import LinearProgressLabel from "../FitCard/Stats/LinearProgressLabel.jsx";

export default function ShipStatusPanel(props) {
  const theme = useTheme();

  return (
    <React.Fragment>
      {!!props.summaries && (
        <React.Fragment>
          <LinearProgressLabel
            value={
              (props.summaries?.summary.load.shield.HP /
                props.summaries?.summary.capacity.shield.HP) *
              100
            }
            label={`${props.summaries?.summary.load.shield.HP.toFixed(
              1
            )} / ${props.summaries?.summary.capacity.shield.HP.toFixed(1)}`}
            backgroundColor={theme.palette.property.blueSecondary}
            color={theme.palette.property.blue}
          />
          <LinearProgressLabel
            value={
              (props.summaries?.summary.load.armor.HP /
                props.summaries?.summary.capacity.armor.HP) *
              100
            }
            label={`${props.summaries?.summary.load.armor.HP.toFixed(
              1
            )} / ${props.summaries?.summary.capacity.armor.HP.toFixed(1)}`}
            backgroundColor={theme.palette.property.redSecondary}
            color={theme.palette.property.red}
          />
          <LinearProgressLabel
            value={
              (props.summaries?.summary.load.structure.HP /
                props.summaries?.summary.capacity.structure.HP) *
              100
            }
            label={`${props.summaries?.summary.load.structure.HP.toFixed(
              1
            )} / ${props.summaries?.summary.capacity.structure.HP.toFixed(1)}`}
            backgroundColor={theme.palette.property.greySecondary}
            color={theme.palette.property.grey}
          />
          <LinearProgressLabel
            value={
              (props.summaries?.summary.load.capacitor.HP /
                props.summaries?.summary.capacity.capacitor.HP) *
              100
            }
            label={`${props.summaries?.summary.load.capacitor.HP.toFixed(
              1
            )} / ${props.summaries?.summary.capacity.capacitor.HP.toFixed(1)}`}
            backgroundColor={theme.palette.property.orgSecondary}
            color={theme.palette.property.org}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
