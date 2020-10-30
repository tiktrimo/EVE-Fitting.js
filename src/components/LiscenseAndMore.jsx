import React from "react";
import {
  Grid,
  List,
  Card,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Typography,
  Avatar,
} from "@material-ui/core";
import { useState } from "react";

export default React.memo(function LiscenseAndMore(props) {
  const [openLicense, setOpenLicense] = useState(false);
  return (
    <React.Fragment>
      <Grid container item xs={12} justify="center">
        <Chip
          color="primary"
          variant="default"
          label="License and More"
          onClick={() => {
            setOpenLicense(!openLicense);
          }}
          clickable
        />
      </Grid>

      <Grid style={{ height: 50 }} container item xs={12} justify="center">
        {openLicense && (
          <div>
            <Card
              style={{ width: "100%", padding: 10, margin: 10 }}
              elevation={2}
            >
              <Typography variant="h5" color="textPrimary">
                Patch History:
              </Typography>

              <Typography variant="body2" color="textSecondary">
                2020/05/17: Added mobile friendly feature(magnify button,
                pantool button)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/05/16: Network latency optimized
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/05/13: Performance optimized
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/05/12: Ship fitting service introduced
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2020/04/17: Website posted
              </Typography>
            </Card>
            <Card
              style={{ width: "100%", padding: 10, margin: 10 }}
              elevation={2}
            >
              <Typography variant="h5" color="textPrimary">
                <br />
                Used Frameworks & Libraries:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Material UI - MIT
                <br />
                Konva - MIT
                <br />
                Node-cache - MIT
                <br />
                Node-fetch - MIT
                <br />
                React - MIT
                <br />
                React-Konva - MIT
                <br />
                React-script - MIT
                <br />
                Styled-components - MIT
                <br />
              </Typography>
            </Card>
            <Card style={{ height: 100, width: "100%" }} elevation={0}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar
                      alt="T"
                      src="https://images.evetech.net/characters/95966660/portrait?size=128"
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary="Tiktrimo"
                    secondary="ISK is always appreciated!!"
                  />
                </ListItem>
              </List>
            </Card>
          </div>
        )}
      </Grid>
    </React.Fragment>
  );
});
