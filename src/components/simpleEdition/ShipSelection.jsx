import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";

import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useEffect } from "react";
import { findAttributesByName } from "../../services/dataManipulation/findAttributes";
import Skeleton from "@material-ui/lab/Skeleton";
import { Chip } from "@material-ui/core";
import ItemSelectionList from "../itemSelection/ItemSelectionList.jsx";

const useStyles = makeStyles({
  root: {
    maxWidth: 250,
    minWidth: 320,
    minHeight: 150,
  },
  cardContent: {
    minHeight: 50,
  },
  backContent: {
    width: "100%",
  },
});

export default React.memo(function ShipSelection(props) {
  const classes = useStyles();
  /* const ship = useSelector((state) => state.shipHostile); */
  const [ship, setShip] = useState({ typeID: false });

  const [open, setOpen] = React.useState(false);

  const [signatureRadius, setSignatureRadius] = React.useState(0);

  useEffect(() => {
    handleClose();
  }, [ship.typeID]);

  useEffect(() => {
    if (!!ship.typeAttributesStats) {
      const _signatureRadius = findAttributesByName(ship, "Signature Radius");
      setSignatureRadius(_signatureRadius);
      props.setSignatureRadius(_signatureRadius);
    }
  }, [ship.typeAttributesStats]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card className={classes.root} elevation={ship.typeID !== false ? 1 : 6}>
      <CardContent className={classes.cardContent}>
        {showShipSkeleton(ship)}
        <Typography gutterBottom variant="h5" component="h2">
          {ship.typeName}
        </Typography>

        {ship.typeAttributesStats && (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Signature Radius: ${signatureRadius}m`}
          />
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          color={ship.typeID !== false ? "primary" : "secondary"}
          onClick={handleClickOpen}
        >
          Select Hostile Ship
        </Button>
      </CardActions>
      <Dialog open={open} onClose={handleClose} scroll="paper">
        <DialogTitle id="select-ship-dialog-title">
          Select Hostile Ship
        </DialogTitle>

        <DialogContent style={{ overflowY: "scroll" }}>
          <ItemSelectionList
            eveListConfig={{
              rootMarketGroupID: 4,
              state: {
                item: ship,
                setItem: setShip,
              },
            }}
            cache={props.cache}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
});
function showShipSkeleton(ship) {
  if (!ship.typeAttributesStats) {
    return [
      <Skeleton key="Sskeleton1" variant="text" />,
      <Skeleton key="Sskeleton2" variant="text" />,
      <Skeleton key="Sskeleton3" variant="text" />,
      <Skeleton key="Sskeleton4" variant="text" />,
    ];
  } else return false;
}
