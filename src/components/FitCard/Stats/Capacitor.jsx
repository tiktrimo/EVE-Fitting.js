import React from "react";
import LinearProgressLabel from "./LinearProgressLabel";
import { CapacitorChargeIcon } from "../../Icons/capacitorIcons";
import { Tooltip, makeStyles, useTheme } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  tooltip: {
    maxWidth: 80,
  },
}));

export default function Capacitor(props) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <React.Fragment>
      <LinearProgressLabel
        value={0}
        label={`${(
          props.stat.capacitor.ambientChargeRate +
          props.stat.capacitor.boosterChargeRate -
          props.stat.capacitor.activationUseRate
        ).toFixed(2)}GJ/s`}
        backgroundColor={theme.palette.background.paper}
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
            <div style={{ height: 24 }}>
              <CapacitorChargeIcon
                color={theme.palette.text.primary}
                backgroundColor={theme.palette.background.paper}
              />
            </div>
          </Tooltip>
        }
        typographyProps={{
          style: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.text.primary,
          },
        }}
      />
      <LinearProgressLabel
        value={props.stat.capacitor.stableLevel}
        label={`${props.stat.capacitor.stableLevel}%`}
        backgroundColor={theme.palette.property.orgSecondary}
        color={theme.palette.property.org}
      />
    </React.Fragment>
  );
}
