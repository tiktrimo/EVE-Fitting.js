import React from "react";
import { Grid, useTheme } from "@material-ui/core";
import LinearProgressLabel from "./LinearProgressLabel";

export function ResistanceProgressLabel(props) {
  const theme = useTheme();

  return (
    <Grid container>
      <Grid item xs={12}>
        <LinearProgressLabel
          value={0}
          label={getLabel(props.resistance, props.active, props.variant)}
          backgroundColor={theme.palette.background.paper}
          Icon={props.Icon}
          typographyProps={{
            style: {
              fontSize: 14,
              fontWeight: 700,
              color: theme.palette.text.primary,
            },
          }}
        />
      </Grid>

      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.EM}
          label={`${props.resistance?.[props.variant]?.EM.toFixed(1)}%`}
          backgroundColor={theme.palette.property.blueSecondary}
          color={theme.palette.property.blue}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.TH}
          label={`${props.resistance?.[props.variant]?.TH.toFixed(1)}%`}
          backgroundColor={theme.palette.property.redSecondary}
          color={theme.palette.property.red}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.KI}
          label={`${props.resistance?.[props.variant]?.KI.toFixed(1)}%`}
          backgroundColor={theme.palette.property.greySecondary}
          color={theme.palette.property.grey}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.EX}
          label={`${props.resistance?.[props.variant]?.EX.toFixed(1)}%`}
          backgroundColor={theme.palette.property.orgSecondary}
          color={theme.palette.property.org}
        />
      </Grid>
    </Grid>
  );
}
//prettier-ignore
function getLabel(resistance, active, variant) {
  if (active[`${variant}Bonus`] === 0) return `${resistance?.[variant]?.HP.toFixed(0)}`;  
  return `${resistance?.[variant]?.HP.toFixed(0)} +${active[`${variant}Bonus`].toFixed(1)}/s`;
}
