import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import firebaseAPI from "./key/ignore/firebaseAPI";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/database";
import "firebase/storage";
import InitialFetch from "./InitialFetch";

firebase.initializeApp(firebaseAPI);
export const database = firebase.database();
export const analytics = firebase.analytics();
export const storage = firebase.storage();

analytics.logEvent("pageLoad", { type: "log" });

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#6d6d6d",
      main: "#424242",
      dark: "#1b1b1b",
    },
  },
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <InitialFetch />
  </MuiThemeProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
