import React from "react";
import { Typography, LinearProgress, Grid } from "@material-ui/core";
import LinearProgressLabel from "./LinearProgressLabel";
import { blue, red, blueGrey, orange } from "@material-ui/core/colors";

const EM_COLOR = blue[500];
const EM_BACK_COLOR = blue[200];
const TH_COLOR = red[500];
const TH_BACK_COLOR = red[200];
const KI_COLOR = blueGrey[500];
const KI_BACK_COLOR = blueGrey[200];
const EX_COLOR = orange[500];
const EX_BACK_COLOR = orange[200];

export function ResistanceProgressLabel(props) {
  return (
    <Grid container>
      <Grid item xs={12}>
        <LinearProgressLabel
          value={0}
          label={getLabel(props.resistance, props.active, props.variant)}
          backgroundColor={"#ffffff"}
          Icon={props.Icon}
          typographyProps={{
            style: { fontSize: 14, fontWeight: 700, color: "#000000" },
          }}
        />
      </Grid>

      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.EM}
          label={`${props.resistance?.[props.variant]?.EM.toFixed(1)}%`}
          backgroundColor={EM_BACK_COLOR}
          color={EM_COLOR}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.TH}
          label={`${props.resistance?.[props.variant]?.TH.toFixed(1)}%`}
          backgroundColor={TH_BACK_COLOR}
          color={TH_COLOR}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.KI}
          label={`${props.resistance?.[props.variant]?.KI.toFixed(1)}%`}
          backgroundColor={KI_BACK_COLOR}
          color={KI_COLOR}
        />
      </Grid>
      <Grid item xs={3}>
        <LinearProgressLabel
          value={props.resistance?.[props.variant]?.EX}
          label={`${props.resistance?.[props.variant]?.EX.toFixed(1)}%`}
          backgroundColor={EX_BACK_COLOR}
          color={EX_COLOR}
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
