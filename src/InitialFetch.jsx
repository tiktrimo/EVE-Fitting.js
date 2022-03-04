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
      const saved = localStorage.getItem("/marketCategories");
      if (saved !== null) return Promise.resolve(JSON.parse(saved));

      return storage
        .ref("/marketCategories.json")
        .getDownloadURL()
        .then(async (url) => {
          const result = await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
          localStorage.setItem("/marketCategories", JSON.stringify(result));
          return result;
        });
    });
  }, []);

  useEffect(() => {
    cache.get("/typeIDsTable", () => {
      const saved = localStorage.getItem("/typeIDsTable");
      if (saved !== null) return Promise.resolve(JSON.parse(saved));

      return storage
        .ref("/listInvTypesTable.json")
        .getDownloadURL()
        .then(async (url) => {
          const result = await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
          localStorage.setItem("/typeIDsTable", JSON.stringify(result));
          return result;
        });
    });
  }, []);

  useEffect(() => {
    cache.get("/skillsStaticBoard", () => {
      const saved = localStorage.getItem("/skillsStaticBoard");
      if (saved !== null) return Promise.resolve(JSON.parse(saved));

      return storage
        .ref("/skillsStaticBoard.json")
        .getDownloadURL()
        .then(async (url) => {
          const result = await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
          localStorage.setItem("/skillsStaticBoard", JSON.stringify(result));
          return result;
        });
    });
  }, []);

  useEffect(() => {
    cache.get("/attributesCategories", () => {
      const saved = localStorage.getItem("/attributesCategories");
      if (saved !== null) return Promise.resolve(JSON.parse(saved));

      return storage
        .ref("/attributesCategories.json")
        .getDownloadURL()
        .then(async (url) => {
          const result = await fetch(url)
            .then((data) => data.json())
            .then((data) => cJSON.decompress(data));
          localStorage.setItem("/attributesCategories", JSON.stringify(result));
          return result;
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
