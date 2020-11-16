import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import firebaseAPI from "./key/ignore/firebaseAPI";
import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/database";
import "firebase/storage";
import Initialtheming from "./Initialtheming";

firebase.initializeApp(firebaseAPI);
export const database = firebase.database();
export const analytics = firebase.analytics();
export const storage = firebase.storage();

analytics.logEvent("pageLoad", { type: "log" });

ReactDOM.render(<Initialtheming />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
