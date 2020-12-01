import React from "react";
import { Button, Grid, ListItem, useTheme } from "@material-ui/core";
import LinearProgressLabel from "./LinearProgressLabel";

export const ResistanceProgressLabel = React.forwardRef((props, ref) => {
  const theme = useTheme();

  return (
    <Grid container>
      <Grid innerRef={ref} item xs={12}>
        <ListItem style={{ width: "100%", padding: 0 }} button={!!props.button}>
          <LinearProgressLabel
            value={0}
            label={getLabel(props)}
            description={getDescription(props)}
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
        </ListItem>
      </Grid>

      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.EM}
          label={`${props.resistance?.EM.toFixed(1)}%`}
          backgroundColor={theme.palette.property.blueSecondary}
          color={theme.palette.property.blue}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.TH}
          label={`${props.resistance?.TH.toFixed(1)}%`}
          backgroundColor={theme.palette.property.redSecondary}
          color={theme.palette.property.red}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.KI}
          label={`${props.resistance?.KI.toFixed(1)}%`}
          backgroundColor={theme.palette.property.greySecondary}
          color={theme.palette.property.grey}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.EX}
          label={`${props.resistance?.EX.toFixed(1)}%`}
          backgroundColor={theme.palette.property.orgSecondary}
          color={theme.palette.property.org}
        />
      </Grid>
    </Grid>
  );
});
function getDescription(props) {
  const ehpFactor = calculateEhpFactor(props.damageType, props.resistance);
  if (ehpFactor === 1 || !ehpFactor) return "";

  if (props.activeBonus === 0)
    return `${(props.resistance?.HP * ehpFactor).toFixed(0)}`;
  return `${(props.resistance?.HP * ehpFactor).toFixed(0)}+${(
    props.activeBonus * ehpFactor
  ).toFixed(1)}/s`;
}
function getLabel(props) {
  if (!!props.label) return props.label;
  if (props.activeBonus === 0) return `${(props.resistance?.HP).toFixed(0)}`;
  return `${(props.resistance?.HP).toFixed(0)}+${props.activeBonus.toFixed(
    1
  )}/s`;
}
function calculateEhpFactor(damageType, resistance) {
  if (!damageType || !resistance) return 1;

  return (
    (100 * (damageType.EM + damageType.TH + damageType.KI + damageType.EX)) /
    (damageType.EM * (100 - resistance.EM) +
      damageType.TH * (100 - resistance.TH) +
      damageType.KI * (100 - resistance.KI) +
      damageType.EX * (100 - resistance.EX))
  );
}
