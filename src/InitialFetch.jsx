import React from "react";
import cacheService from "./cache/cacheService";
import { useEffect } from "react";
import { storage } from "./index";
import cJSON from "compressed-json";
import InitialCard from "./components/InitialCard";

const ttl = 60 * 60 * 1;
const cache = new cacheService(ttl);

export default function InitialD(props) {
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
    <React.Fragment>
      <InitialCard cache={cache} />
    </React.Fragment>
  );
}
