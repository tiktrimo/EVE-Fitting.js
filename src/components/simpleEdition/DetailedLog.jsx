import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import React, { useEffect } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useState } from "react";
import { useCallback } from "react";
import MathJax from "react-mathjax";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",

    borderTop: `solid 1px ${theme.palette.divider}`,
    position: "relative",
    transition: theme.transitions.create("height", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  bottomDivContainer: {
    width: "100%",
    height: 25,
    position: "absolute",
    bottom: 0,
    display: "flex",
    justifyContent: "center",
  },
  bottomDiv: {
    width: 25,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `solid 1px ${theme.palette.divider}`,
    borderTopLeftRadius: "50%",
    borderTopRightRadius: "50%",
  },
  expandButton: {
    minWidth: 0,
    width: "100%",
    height: "100%",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
    zIndex: 2,
  },

  jax: {
    fontSize: 20,
  },
}));

const JaxLog = (props) => {
  const classes = useStyles();

  const [formula, setFormula] = useState(false);

  useEffect(() => {
    setFormula(getLatex(props.logs[props.logs.length - 1]));
  }, [props.logs]);

  return (
    <MathJax.Provider>
      <MathJax.Node className={classes.jax} formula={formula.latex} />
    </MathJax.Provider>
  );
};

export default function DetailedLogs(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <div className={classes.root} style={{ height: open ? 200 : 0 }}>
      {open && <JaxLog logs={props.logs} />}

      <div className={classes.bottomDivContainer}>
        <div className={classes.bottomDiv}>
          <Tooltip title="Stats for nerds (Experimental)" placement="top" arrow>
            <IconButton
              className={classes.expandButton}
              style={{ transform: open ? "rotate(180deg)" : "" }}
              onClick={handleClick}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function getLatex(log) {
  if (!log?.debugs?.[0]?.[0]?.type)
    return {
      title: "No Detail",
      reference: "",
      applied: "",
    };

  switch (log.debugs[0][0].type) {
    case "turret_accuracy": {
      const payload = log.debugs[0][0].payload;
      return {
        //prettier-ignore
        latex:`Turret Accuracy\\\\
        
        {\\scriptsize 0.5}^{((\\frac{Angular \\times 40000m}{Tracking \\times Signature})^{2}+
        (\\frac{max(0, Distance - Optimal)}{Falloff})^{2})}\\\\
        
        {\\scriptsize 0.5}^{((\\frac{${payload.angularVelocity.toFixed(5)} \\times 40000m}
        {${payload.tracking.toFixed(2)} \\times ${payload.signatureRadius.toFixed(0)}})^{2}+
        (\\frac{max(0,${payload.distance.toFixed(0)} - ${payload.optimalRange.toFixed(0)})}
        {${payload.falloffRange.toFixed(0)}})^{2})}\\\\
        
        {\\scriptsize ${(log.debugs[0][0].value * 100).toFixed(1)}\\%}`,
      };
    }
    case "launcher_damage_modifier":
      const payload = log.debugs[0][0].payload;
      return {
        //prettier-ignore
        latex:`Missile Damage\\\\
        
        {\\scriptsize D \\times min(1,{\\tiny \\frac{S}{E_r}},
        {\\tiny (\\frac{S \\times E_v}{E_r \\times T_v})}^{drf})}\\\\
          
        {\\scriptsize D \\times min(1,{\\tiny \\frac{${payload.signatureRadius.toFixed(0)}}
        {${payload.explosionRadius.toFixed(0)}}},
        {\\tiny (\\frac{${payload.signatureRadius.toFixed(0)} \\times ${payload.signatureRadius.toFixed(1)}}
        {${payload.explosionRadius.toFixed(0)} \\times ${payload.targetVelocity.toFixed(1)}})}^
        {${payload.damageReductionFactor.toFixed(3)}})}\\\\
        
        {\\scriptsize D \\times${log.debugs[0][0].value.toFixed(3)}}`,
      };
    default:
      return {
        title: "No Detail",
        reference: "",
        applied: "",
      };
  }
}
