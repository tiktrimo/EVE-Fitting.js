import React from "react";
import {
  armorSVG,
  shieldSVG,
  structureSVG,
} from "../../Icons/defenseIcons.jsx";
import { ResistanceProgressLabel } from "./ResistanceProgressLabel";
import { Grid } from "@material-ui/core";

// EM-TH-KI-EX
export default function Resistance(props) {
  return (
    <React.Fragment>
      <Grid container>
        <ResistanceProgressLabel
          variant="shield"
          Icon={shieldSVG}
          resistance={props.stat.defense.resistance}
          active={props.stat.defense.active}
        />
        <ResistanceProgressLabel
          variant="armor"
          Icon={armorSVG}
          resistance={props.stat.defense.resistance}
          active={props.stat.defense.active}
        />
        <ResistanceProgressLabel
          variant="structure"
          Icon={structureSVG}
          resistance={props.stat.defense.resistance}
          active={props.stat.defense.active}
        />
      </Grid>
    </React.Fragment>
  );
}
