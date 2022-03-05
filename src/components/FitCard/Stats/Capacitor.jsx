import React, { useState } from "react";
import LinearProgressLabel from "./LinearProgressLabel";
import { CapacitorChargeIcon } from "../../Icons/capacitorIcons";
import { Tooltip, makeStyles, useTheme, Grid } from "@material-ui/core";

export default function Capacitor(props) {
  const theme = useTheme();

  const [isHover, setIsHover] = useState(false);

  return (
    <Grid
      container
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
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
            open={isHover}
            //prettier-ignore
            title={<span style={{ whiteSpace: 'pre-line' }}>
            {`Passive +${props.stat.capacitor.ambientChargeRate.toFixed(1)} GJ/s
            Active +${props.stat.capacitor.boosterChargeRate.toFixed(1)} GJ/s
            Active -${props.stat.capacitor.activationUseRate.toFixed(1)} GJ/s`}</span>}
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
    </Grid>
  );
}
