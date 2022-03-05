import React, { useState } from "react";
import {
  ArmorIcon,
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
          tooltip={getTooltip(props.stat.defense, damageType)}
          resistance={props.stat.defense.resistance.shield}
          passiveBonus={props.stat.defense.passive.shieldBonus}
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

function getTooltip(defense, damageType) {
  const ehpFactor = calculateEhpFactor(damageType, defense.resistance.shield);
  if (!ehpFactor) return "";

  //prettier-ignore
  return (<span style={{ whiteSpace: 'pre-line' }}>
  {`Passive +${defense.passive.shieldBonus.toFixed(1)} HP/s 
  Active +${defense.active.shieldBonus.toFixed(1)} HP/s
  Passive +${(defense.passive.shieldBonus * ehpFactor).toFixed(1)} EHP/s 
  Active +${(defense.active.shieldBonus * ehpFactor).toFixed(1)} EHP/s`}
  </span>);
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
