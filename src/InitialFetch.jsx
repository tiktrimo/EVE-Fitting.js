import React from "react";
import cacheService from "./cache/cacheService";
import { useEffect } from "react";
import { storage } from "./index";
import cJSON from "compressed-json";
import InitialCard from "./components/InitialCard";
import { makeStyles, Paper } from "@material-ui/core";

const ttl = 60 * 60 * 1;
const cache = new cacheService(ttl);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    borderRadius: 0,
    overflow: "auto",
  },
}));

export default function InitialD(props) {
  const classes = useStyles();

  useEffect(() => {
    cache.get("/marketCategories", () => {
      return storage
        .ref("/marketCategories.json")
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
        });
    });
  }, []);

  useEffect(() => {
    cache.get("/typeIDsTable", () => {
      return storage
        .ref("/listInvTypesTable.json")
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
        });
    });
  }, []);

  useEffect(() => {
    cache.get("/skillsStaticBoard", () => {
      return storage
        .ref("/skillsStaticBoard.json")
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
        });
    });
  }, []);

  useEffect(() => {
    cache.get("/attributesCategories", () => {
      return storage
        .ref("/attributesCategories.json")
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
        });
    });
  }, []);

  return (
    <Paper className={classes.root} elevation={0}>
      <InitialCard
        isDark={props.isDark}
        setIsDark={props.setIsDark}
        cache={cache}
      />
    </Paper>
  );
}
