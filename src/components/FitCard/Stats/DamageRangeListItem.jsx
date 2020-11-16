import React from "react";
import { makeStyles, Typography, ListItem, useTheme } from "@material-ui/core";
import { useEffect } from "react";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  rootPostIt: {
    position: "absolute",
    left: 0,
  },
  root: {
    width: "100%",
    padding: 0,
  },
  rootDiv: {
    padding: 0,
    width: "100%",
    height: 52,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: 2,
    left: 6,
    fontSize: 11,
    color: "#ffffff",
    fontWeight: 700,
  },
  optimalRangeLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  rangeFont: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
}));

const PostIt = (props) => {
  const classes = useStyles();
  return (
    <div
      className={classes.rootPostIt}
      style={{
        width: `${props.share || 0}%`,
        height: props.index * 13 + 22,
        borderRight: `solid 1px ${props.color}`,
      }}
    >
      <div style={{ backgroundColor: props.color, height: 20 }} />
      <div style={{ height: props.index * 13 }} />

      {props.children}
    </div>
  );
};

const OptimalRangeBar = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <PostIt
      share={props.share.optimalRangeShare}
      index={0}
      color={theme.palette.property.green}
    >
      <Typography className={classes.rangeFont} align="right">
        {`${(props.share.optimalRange / 1000).toFixed(1)}KM`}
      </Typography>
    </PostIt>
  );
};
const FalloffRangeBar = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    props.share.falloffRange > 0 && (
      <PostIt
        share={props.share.falloffRangeShare}
        index={1}
        color={theme.palette.property.org}
      >
        <Typography className={classes.rangeFont} align="right">
          {
            //prettier-ignore
            `${((props.share.optimalRange + props.share.falloffRange) / 1000).toFixed(1)}KM`
          }
        </Typography>
      </PostIt>
    )
  );
};

export default function DamageRangeListItem(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [shares, setShares] = useState([]);

  useEffect(() => {
    setShares(getShares(props.stat.damage.turretLauncherRange));
  }, [props.stat.damage.turretLauncherRange]);

  return shares.map((share) => {
    return (
      <ListItem
        className={classes.root}
        key={`${share.optimalRangeShare}/${share.falloffRangeShare}`}
      >
        <div className={classes.rootDiv}>
          <PostIt
            share={100}
            index={2}
            color={theme.palette.property.greySecondary}
          />
          <FalloffRangeBar share={share} />
          <OptimalRangeBar share={share} />
          <Typography className={classes.label}>
            {`${share.debug[0].item.typeName} - ${share.debug[0].charge.typeName}`}
          </Typography>
        </div>
      </ListItem>
    );
  });
}
function getShares(turretLauncherRange) {
  const rangeMax = turretLauncherRange.reduce((acc, range) => {
    const rangeSum = range.optimalRange + range.falloffRange;
    if (rangeSum > acc) return rangeSum;
    else return acc;
  }, 0);

  return turretLauncherRange.map((range) => {
    return {
      ...range,
      optimalRangeShare: (range.optimalRange / rangeMax) * 100,
      falloffRangeShare:
        ((range.falloffRange + range.optimalRange) / rangeMax) * 100,
    };
  });
}
