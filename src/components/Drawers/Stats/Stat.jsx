import React from "react";
import { Typography, TextField, InputAdornment } from "@material-ui/core";
import { useState } from "react";
import { useEffect } from "react";
import StatTextField from "./StatTextField";

export default function Stat(props) {
  const [type, setType] = useState(false);
  const [attributesCategories, setAttributesCategories] = useState(false);

  const [typeName, setTypeName] = useState(false);
  const [builtList, setList] = useState(false);

  useEffect(() => {
    props.cache.wait("/attributesCategories").then((data) => {
      setAttributesCategories(data);
    });
  }, []);

  useEffect(() => {
    setType(props.type);
  }, [props.type]);

  useEffect(() => {
    if (!!type && !!attributesCategories) {
      setTypeName(type.typeName);
      setList(createStatList(type, attributesCategories));
    }
  }, [attributesCategories, type]);
  return (
    <React.Fragment>
      <Typography
        style={{
          fontSize: 26,
          fontWeight: 1000,
          letterSpacing: -1.5,
          lineHeight: 1,
          marginRight: 20,
          textDecoration: "underline",
        }}
        variant="h4"
        align="right"
      >
        {typeName}
      </Typography>
      <div style={{ marginTop: 20 }}>{builtList}</div>
    </React.Fragment>
  );
}
function createStatList(item, attributesCategories) {
  const etc = ["Miscellaneous", "Required Skills", "Graphics", "NULL"];
  const dividedAttributes = filterAttributes(item, attributesCategories).reduce(
    (acc, filtered) => {
      if (etc.includes(filtered.name))
        acc.etc[etc.indexOf(filtered.name)] = filtered;
      else acc.main.push(filtered);
      return acc;
    },
    { main: [], etc: new Array(etc.length).fill(undefined) }
  );

  return [...dividedAttributes.main, ...dividedAttributes.etc].map(
    (filtered) => {
      if (!filtered || !filtered.name || filtered.attributes.length === 0)
        return undefined;

      const attrs = filtered.attributes;
      const name = filtered.name;
      const nameSpace = [];

      return (
        <React.Fragment key={name}>
          <Typography
            style={{
              fontSize: 20,
              fontWeight: 1000,
              letterSpacing: -1.5,
              lineHeight: 1,
              marginRight: 20,
              marginTop: 20,
            }}
            variant="h4"
            align="right"
          >
            {name}
          </Typography>
          {attrs.map((attr) => {
            const key = `${attr.attributeName}:${attr.value}`;
            if (!nameSpace.includes(key)) {
              nameSpace.push(key);
              return <StatTextField key={key} attr={attr} />;
            }
          })}
        </React.Fragment>
      );
    }
  );
}
function filterAttributes(type, attributesCategories) {
  if (!type || !type.typeAttributesStats) return undefined;
  const typeAttributesStats = type.typeAttributesStats;
  const categoryIDmax =
    typeAttributesStats.reduce((acc, attr) => {
      if (attr.attributeCategoryID > acc) return attr.attributeCategoryID;
      return acc;
    }, 1) + 1;
  const filteredAttributes = new Array(categoryIDmax)
    .fill(undefined)
    .map((attr, index) => ({
      name: attributesCategories[index]?.name,
      attributes: [],
    }));

  typeAttributesStats.forEach((attr) => {
    if (!attr.attributeCategoryID) filteredAttributes[0].attributes.push(attr);
    else filteredAttributes[attr.attributeCategoryID].attributes.push(attr);
  });

  return filteredAttributes;
}
