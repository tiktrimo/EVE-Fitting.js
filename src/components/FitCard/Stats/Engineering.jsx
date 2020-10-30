import React from "react";
import { Grid } from "@material-ui/core";
import LinearProgressLabel from "./LinearProgressLabel";
import { red, blue } from "@material-ui/core/colors";
import FlagIcon from "@material-ui/icons/Flag";

const CPU_COLOR = blue[500];
const CPU_BACK_COLOR = blue[200];
const PG_COLOR = red[500];
const PG_BACK_COLOR = red[200];

const Cpu = (props) => {
  return (
    <LinearProgressLabel
      value={getPercent(props.load, props.output)}
      label={`${getNum(props.load)}/${getNum(props.output)}tf`}
      backgroundColor={CPU_BACK_COLOR}
      color={CPU_COLOR}
      Icon={
        getPercent(props.load, props.output) >= 100 && (
          <FlagIcon style={{ color: "#ffffff" }} fontSize="small" />
        )
      }
    />
  );
};
const Powergrid = (props) => {
  return (
    <LinearProgressLabel
      value={getPercent(props.load, props.output)}
      label={`${getNum(props.load)}/${getNum(props.output)}MW`}
      backgroundColor={PG_BACK_COLOR}
      color={PG_COLOR}
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
