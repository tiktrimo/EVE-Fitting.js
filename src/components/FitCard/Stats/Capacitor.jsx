import React from "react";

import LinearProgressLabel from "./LinearProgressLabel";
import { capacitorChargeSVG } from "../../Icons/capacitorIcons";
import { Tooltip, makeStyles } from "@material-ui/core";
import { orange } from "@material-ui/core/colors";
const EX_COLOR = orange[500];
const EX_BACK_COLOR = orange[200];
const useStyles = makeStyles((theme) => ({
  tooltip: {
    maxWidth: 80,
  },
}));

export default function Capacitor(props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <LinearProgressLabel
        value={0}
        label={`${(
          props.stat.capacitor.ambientChargeRate +
          props.stat.capacitor.boosterChargeRate -
          props.stat.capacitor.activationUseRate
        ).toFixed(2)}GJ/s`}
        backgroundColor={"#ffffff"}
        Icon={
          <Tooltip
            classes={{ tooltip: classes.tooltip }}
            //prettier-ignore
            title={`Passive +${props.stat.capacitor.ambientChargeRate.toFixed(2)} 
            Active +${props.stat.capacitor.boosterChargeRate.toFixed(2)} 
            Active -${props.stat.capacitor.activationUseRate.toFixed(2)}`}
            placement="left"
            arrow
          >
            {capacitorChargeSVG}
          </Tooltip>
        }
        typographyProps={{
          style: { fontSize: 14, fontWeight: 700, color: "#000000" },
        }}
      />
      <LinearProgressLabel
        value={props.stat.capacitor.stableLevel}
        label={`${props.stat.capacitor.stableLevel}%`}
        backgroundColor={EX_BACK_COLOR}
        color={EX_COLOR}
      />
    </React.Fragment>
  );
}
