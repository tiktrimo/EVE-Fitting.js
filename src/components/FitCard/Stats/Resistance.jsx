import React from "react";
import {
  ArmorIcon,
  ShieldIcon,
  StructureIcon,
} from "../../Icons/defenseIcons.jsx";
import { ResistanceProgressLabel } from "./ResistanceProgressLabel";
import { Grid, useTheme } from "@material-ui/core";

// EM-TH-KI-EX
export default function Resistance(props) {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Grid container>
        <ResistanceProgressLabel
          variant="shield"
          Icon={
            <div style={{ height: 24 }}>
              <ShieldIcon color={theme.palette.text.primary} />
            </div>
          }
          resistance={props.stat.defense.resistance}
          active={props.stat.defense.active}
        />
        <ResistanceProgressLabel
          variant="armor"
          Icon={
            <div style={{ height: 24 }}>
              <ArmorIcon color={theme.palette.text.primary} />
            </div>
          }
          resistance={props.stat.defense.resistance}
          active={props.stat.defense.active}
        />
        <ResistanceProgressLabel
          variant="structure"
          Icon={
            <div style={{ height: 24 }}>
              <StructureIcon color={theme.palette.text.primary} />
            </div>
          }
          resistance={props.stat.defense.resistance}
          active={props.stat.defense.active}
        />
      </Grid>
    </React.Fragment>
  );
}
