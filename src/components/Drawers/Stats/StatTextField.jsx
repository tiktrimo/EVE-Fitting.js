import React from "react";
import { TextField, Typography } from "@material-ui/core";

export default function StatTextField(props) {
  return (
    <div
      style={{
        marginTop: 4,
        width: "70%",
      }}
    >
      <TextField
        style={{ width: "100%" }}
        label={
          <Typography noWrap style={{ width: "100%" }}>
            {!!switchUnit(props.attr.unitID)
              ? `${props.attr.attributeName} (${switchUnit(props.attr.unitID)})`
              : props.attr.attributeName}
          </Typography>
        }
        defaultValue={props.attr.value}
        InputProps={{
          readOnly: true,
          disableUnderline: true,
        }}
      />
    </div>
  );
}
function switchUnit(unitID) {
  if (!unitID) return false;

  const unit = eveUnit.find((unit) => unit.unitID === unitID);
  if (unit === undefined)
    console.log(
      "ERROR",
      `unitID:${unitID} not found. dear developer please update database!`
    );
  return unit?.displayName;
}
const eveUnit = [
  { unitID: 1, displayName: "m" },
  { unitID: 2, displayName: "kg" },
  { unitID: 3, displayName: "sec" },
  { unitID: 4, displayName: "A" },
  { unitID: 5, displayName: "K" },
  { unitID: 6, displayName: "mol" },
  { unitID: 7, displayName: "cd" },
  { unitID: 8, displayName: "m2" },
  { unitID: 9, displayName: "m3" },
  { unitID: 10, displayName: "m/sec" },
  { unitID: 11, displayName: "m/sec" },
  { unitID: 12, displayName: "m-1" },
  { unitID: 13, displayName: "kg/m3" },
  { unitID: 14, displayName: "m3/kg" },
  { unitID: 15, displayName: "A/m2" },
  { unitID: 16, displayName: "A/m" },
  { unitID: 17, displayName: "mol/m3" },
  { unitID: 18, displayName: "cd/m2" },
  { unitID: 19, displayName: "kg/kg = 1" },
  { unitID: 101, displayName: "s" },
  { unitID: 102, displayName: "mm" },
  { unitID: 103, displayName: "MegaPascals" },
  { unitID: 104, displayName: "x" },
  { unitID: 105, displayName: "%" },
  { unitID: 106, displayName: "tf" },
  { unitID: 107, displayName: "MW" },
  { unitID: 108, displayName: "%" },
  { unitID: 109, displayName: "%" },
  { unitID: 111, displayName: "%" },
  { unitID: 112, displayName: "rad/sec" },
  { unitID: 113, displayName: "HP" },
  { unitID: 114, displayName: "GJ" },
  { unitID: 115, displayName: "groupID" },
  { unitID: 116, displayName: "typeID" },
  { unitID: 117, displayName: "Sizeclass" },
  { unitID: 118, displayName: "Ore units" },
  { unitID: 119, displayName: "attributeID" },
  { unitID: 120, displayName: "points" },
  { unitID: 121, displayName: "%" },
  { unitID: 122, displayName: "Fitting slots" },
  { unitID: 123, displayName: "sec" },
  { unitID: 124, displayName: "%" },
  { unitID: 125, displayName: "N" },
  { unitID: 126, displayName: "ly" },
  { unitID: 127, displayName: "%" },
  { unitID: 128, displayName: "Mbit/sec" },
  { unitID: 129, displayName: "Hours" },
  { unitID: 133, displayName: "ISK" },
  { unitID: 134, displayName: "m3/hour" },
  { unitID: 135, displayName: "AU" },
  { unitID: 136, displayName: "Slot" },
  { unitID: 137, displayName: "Boolean" },
  { unitID: 138, displayName: "units" },
  { unitID: 139, displayName: "+" },
  { unitID: 140, displayName: "Level" },
  { unitID: 141, displayName: "hardpoints" },
  { unitID: 142, displayName: "1=Male 2=Unisex 3=Female" },
  { unitID: 143, displayName: "Datetime" },
];
