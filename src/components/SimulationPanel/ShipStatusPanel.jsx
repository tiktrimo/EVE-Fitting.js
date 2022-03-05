import {
  Avatar,
  Divider,
  Grid,
  ListItem,
  TextField,
  Typography,
  useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import LinearProgressLabel from "../FitCard/Stats/LinearProgressLabel.jsx";
import {
  ArmorIcon,
  ShieldIcon,
  StructureIcon,
} from "../Icons/defenseIcons.jsx";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles((theme) => ({
  boldTypography: {
    fontSize: 14,
    fontWeight: 700,
    color: "white",
  },
  headerRoot: {
    height: 60,
  },
  headerAvatar: {
    padding: 5,
    width: 40,
    height: 40,
    position: "relative",
  },
  deadIndicator: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "red",
    color: "white",
    fontSize: 50,
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const GridBoldTypography = (props) => {
  const classes = useStyles();

  return (
    <Grid style={{ flexBasis: 120, maxWidth: 120 }}>
      <TextField
        label={
          <Typography className={classes.boldTypography} noWrap>
            {props.children}
          </Typography>
        }
        value={props.value || 0}
        InputProps={{
          readOnly: true,
          disableUnderline: true,
        }}
        inputProps={{
          style: {
            padding: "2px 0px 2px 0px",
            fontSize: 14,
            fontWeight: 700,
            color: "white",
          },
        }}
      />
    </Grid>
  );
};

const Header = React.memo((props) => {
  const classes = useStyles();
  return (
    <Grid
      className={classes.headerRoot}
      style={{ backgroundColor: props.color }}
      container
      alignContent="center"
    >
      <Grid container item xs={2} justifyContent="center" alignContent="center">
        <Avatar className={classes.headerAvatar}>
          {feedSource(props.summary)}
          <div
            className={classes.deadIndicator}
            style={{ opacity: props.isDead ? 0.5 : 0 }}
          >
            <ClearIcon fontSize="inherit" color="inherit" />
          </div>
        </Avatar>
      </Grid>
      <Grid
        container
        item
        xs={10}
        justifyContent="center"
        alignContent="center"
      >
        <GridBoldTypography
          value={props.maximumVelocity.toFixed(1)}
        >{`Max Velocity (m/sec)`}</GridBoldTypography>
        <GridBoldTypography
          value={props.signatureRadius.toFixed(1)}
        >{`Signature Radius (m)`}</GridBoldTypography>
      </Grid>
    </Grid>
  );
});

const HPprogress = React.memo(
  (props) => {
    const theme = useTheme();
    return (
      <LinearProgressLabel
        showDivider
        value={(props.load / props.capacity) * 100}
        label={`${props.load.toFixed(1)}`}
        description={`/ ${props.capacity.toFixed(1)}`}
        typographyProps={{
          style: {
            color: props.color,
            fontWeight: 600,
            fontSize: 14,
          },
        }}
        /*   backgroundColor={theme.palette.property.blueSecondary}
    color={theme.palette.property.blue} */
        backgroundColor={theme.palette.action.opaqueHoverSecondary}
        color={theme.palette.background.paper}
        Icon={
          <div style={{ height: 24 }}>
            {React.cloneElement(props.Icon, { color: props.color })}
          </div>
        }
      />
    );
  },
  (prev, curr) => {
    return (
      prev.load.toFixed(1) === curr.load.toFixed(1) &&
      prev.capacity === curr.capacity &&
      prev.color === curr.color
    );
  }
);

const CapacitorArc = React.memo((props) => {
  return (
    <path
      fill="none"
      stroke={props.stroke}
      strokeWidth="3"
      d={describeArc(30, 30, props.radius, props.angle - 9, props.angle + 9)}
    />
  );
});

const CapacitorArcLayer = (props) => {
  const theme = useTheme();

  const [angles, setAngles] = useState([]);
  const [anglesGap, setAnglesGap] = useState(360);

  useEffect(() => {
    setAngles(
      new Array(Math.floor(props.numOfColumn))
        .fill(false)
        .map((_, index, array) => {
          return ((index + 1) * 360) / array.length;
        })
    );
    setAnglesGap(360 / props.numOfColumn);
  }, [props.numOfColumn]);

  return (
    <div style={{ position: "relative" }}>
      <svg style={{ position: "absolute" }}>
        {angles.map((angle) => {
          return (
            <CapacitorArc
              key={`layer${props.layerCount}angle${angle}`}
              stroke={getStroke(props, angle, anglesGap, theme)}
              radius={props.layerCount * 5}
              angle={angle}
            />
          );
        })}
      </svg>
    </div>
  );
};

const EveCapacitorProgress = (props) => {
  const [layerCounts, setLayerCounts] = useState(
    [...Array(4).keys()].map((e) => e + 2)
  );

  return (
    <div style={{ width: 60, height: 60 }}>
      {layerCounts.map((layerCount) => {
        return (
          <CapacitorArcLayer
            numOfColumn={props.numOfColumn}
            key={`layer${layerCount}`}
            layerCount={layerCount}
            value={props.value}
          />
        );
      })}
    </div>
  );
};

export default function ShipStatusPanel(props) {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <React.Fragment>
      {!!props.summaries && (
        <Grid container>
          <Header
            color={props.color}
            summary={props.summaries.summary}
            maximumVelocity={
              props.summaries.summary?.capacity.propulsion.maximumVelocity
            }
            signatureRadius={
              props.summaries.summary?.capacity.misc.signatureRadius
            }
            isDead={props.summaries.summary?.load.structure.HP === 0}
          />
          {/*  <Grid
            style={{
              width: 80,
            }}
            item
            container
            justifyContent="center"
            alignContent="center"
          >
            <EveCapacitorProgress
              value={
                (props.summaries.summary?.load.capacitor.HP /
                  props.summaries.summary?.capacity.capacitor.HP) *
                100
              }
              numOfColumn={Math.min(
                props.summaries.summary?.capacity.capacitor.HP / 50,
                18
              )}
            />
          </Grid> */}
          <Grid
            style={{
              flex: 1,
              position: "relative",
            }}
          >
            <HPprogress
              load={props.summaries.summary?.load.shield.HP}
              capacity={props.summaries.summary?.capacity.shield.HP}
              Icon={<ShieldIcon />}
              color={theme.palette.text.primary}
            />
            <HPprogress
              load={props.summaries.summary?.load.armor.HP}
              capacity={props.summaries.summary?.capacity.armor.HP}
              Icon={<ArmorIcon />}
              color={theme.palette.text.primary}
            />
            <HPprogress
              load={props.summaries.summary?.load.structure.HP}
              capacity={props.summaries.summary?.capacity.structure.HP}
              Icon={<StructureIcon />}
              color={theme.palette.text.primary}
            />
            <LinearProgressLabel
              value={
                (props.summaries.summary?.load.capacitor.HP /
                  props.summaries.summary?.capacity.capacitor.HP) *
                100
              }
              label={`${props.summaries.summary?.load.capacitor.HP.toFixed(
                1
              )} / ${props.summaries.summary?.capacity.capacitor.HP.toFixed(
                1
              )} GJ`}
              backgroundColor={theme.palette.property.orgSecondary}
              color={theme.palette.property.org}
            />
            {/* <div
              style={{
                top: 0,
                width: 1,
                height: "100%",
                position: "absolute",
                backgroundColor: theme.palette.background.paper,
              }}
            /> */}
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
}

function feedSource(summary) {
  const itemID = summary.itemID;

  return (
    <img
      draggable="false"
      style={{ width: 50, height: 50 }}
      src={`https://images.evetech.net/types/${itemID}/icon?size=128`}
    />
  );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  // X axis is reversed. intended
  return {
    x: centerX - radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  var d = [
    "M",
    end.x,
    end.y,
    "A",
    radius,
    radius,
    0,
    0,
    0,
    start.x,
    start.y,
  ].join(" ");

  return d;
}

function getStroke(props, angle, angleGap, theme) {
  //angle 0~360, value 0~100, layerCount 2~5
  //multiplier 3.601 : 0.001 is added to round up value 99.999 -> over 100

  //console.log(angleGap, angle - (5 - props.layerCount) * (angleGap / 4));

  return props.value * 3.601 > angle - (5 - props.layerCount) * (angleGap / 4)
    ? theme.palette.property.org
    : theme.palette.action.opaqueHover;
}
