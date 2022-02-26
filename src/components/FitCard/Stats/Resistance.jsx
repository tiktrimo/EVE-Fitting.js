import React, { useState } from "react";
import {
  ArmorIcon,
  EhpIcon,
  ShieldIcon,
  StructureIcon,
} from "../../Icons/defenseIcons.jsx";
import { ResistanceProgressLabel } from "./ResistanceProgressLabel";
import { Grid, useTheme } from "@material-ui/core";
import DamageTypeProgressLabel from "./DamageTypeProgressLabel.jsx";

// EM-TH-KI-EX
export default function Resistance(props) {
  const theme = useTheme();

  const [damageType, setDamageType] = useState({
    EM: 25,
    TH: 25,
    KI: 25,
    EX: 25,
  });

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
          resistance={props.stat.defense.resistance.shield}
          activeBonus={props.stat.defense.active.shieldBonus}
          damageType={damageType}
        />
        <ResistanceProgressLabel
          variant="armor"
          Icon={
            <div style={{ height: 24 }}>
              <ArmorIcon color={theme.palette.text.primary} />
            </div>
          }
          resistance={props.stat.defense.resistance.armor}
          activeBonus={props.stat.defense.active.armorBonus}
          damageType={damageType}
        />
        <ResistanceProgressLabel
          variant="structure"
          Icon={
            <div style={{ height: 24 }}>
              <StructureIcon color={theme.palette.text.primary} />
            </div>
          }
          resistance={props.stat.defense.resistance.structure}
          activeBonus={props.stat.defense.active.structureBonus}
          damageType={damageType}
        />
        <DamageTypeProgressLabel
          damageType={damageType}
          setDamageType={setDamageType}
        />
      </Grid>
    </React.Fragment>
  );
}
