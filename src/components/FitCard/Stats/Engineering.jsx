import React from "react";
import { Grid, useTheme } from "@material-ui/core";
import LinearProgressLabel from "./LinearProgressLabel";
import FlagIcon from "@material-ui/icons/Flag";

const Cpu = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={getPercent(props.load, props.output)}
      label={`${getNum(props.load)}/${getNum(props.output)}tf`}
      backgroundColor={theme.palette.property.blueSecondary}
      color={theme.palette.property.blue}
      Icon={
        getPercent(props.load, props.output) >= 100 && (
          <FlagIcon style={{ color: "#ffffff" }} fontSize="small" />
        )
      }
    />
  );
};
const Powergrid = (props) => {
  const theme = useTheme();

  return (
    <LinearProgressLabel
      value={getPercent(props.load, props.output)}
      label={`${getNum(props.load)}/${getNum(props.output)}MW`}
      backgroundColor={theme.palette.property.redSecondary}
      color={theme.palette.property.red}
      Icon={
        getPercent(props.load, props.output) >= 100 && (
          <FlagIcon style={{ color: "#ffffff" }} fontSize="small" />
        )
      }
    />
  );
};

export default function Engineering(props) {
  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Cpu
            load={props.stat.engineering.cpu.load}
            output={props.stat.engineering.cpu.output}
          />
          <Powergrid
            load={props.stat.engineering.pg.load}
            output={props.stat.engineering.pg.output}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function getPercent(load, output) {
  if (!load || !output) return 0;
  if (load.constructor !== Number || output.constructor !== Number) return 0;

  const percent = Number((load / output) * 100);
  if (percent >= 100) return 100;
  else return percent;
}
function getNum(data) {
  if (!data || data.constructor !== Number) return 0;
  else return data;
}
