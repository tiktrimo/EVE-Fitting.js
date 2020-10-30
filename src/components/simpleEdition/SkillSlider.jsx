import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";

const useStyles = makeStyles({
  root: {
    width: 250,
  },
});

const marks = [
  {
    value: 1,
    label: "I",
  },
  {
    value: 2,
    label: "II",
  },
  {
    value: 3,
    label: "III",
  },
  {
    value: 4,
    label: "IV",
  },
  {
    value: 5,
    label: "V",
  },
];

function valuetext(value) {
  return `${value}`;
}

function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === value) + 1;
}

export default React.memo(function DiscreteSlider(props) {
  const classes = useStyles();
  const [skills] = React.useState([5, 5, 5]);
  const parentSetSkills = props.setSkills;
  return (
    <div className={classes.root}>
      <Typography id="discrete-slider-restrict" gutterBottom>
        Motion Prediction
      </Typography>
      <Slider
        defaultValue={5}
        valueLabelFormat={valueLabelFormat}
        getAriaValueText={valuetext}
        max={5}
        onChange={(e, value) => {
          skills[0] = value;
          parentSetSkills([...skills]);
        }}
        step={null}
        valueLabelDisplay="auto"
        marks={marks}
      />
      <Typography id="discrete-slider-restrict" gutterBottom>
        Trajectory Anlysis
      </Typography>
      <Slider
        defaultValue={5}
        valueLabelFormat={valueLabelFormat}
        getAriaValueText={valuetext}
        max={5}
        onChange={(e, value) => {
          skills[1] = value;
          parentSetSkills([...skills]);
        }}
        step={null}
        valueLabelDisplay="auto"
        marks={marks}
      />
      <Typography id="discrete-slider-restrict" gutterBottom>
        Sharp Shooter
      </Typography>
      <Slider
        defaultValue={5}
        valueLabelFormat={valueLabelFormat}
        getAriaValueText={valuetext}
        max={5}
        onChange={(e, value) => {
          skills[2] = value;
          parentSetSkills([...skills]);
        }}
        step={null}
        valueLabelDisplay="auto"
        marks={marks}
      />
    </div>
  );
});
