import React from "react";
import { SvgIcon } from "@material-ui/core";

export const CapacitorChargeIcon = (props) => (
  <SvgIcon>
    <path
      d=" M 9.518 3.357 L 4.172 12.911 Q 5.394 15.954 9.319 16.238 L 15.148 6.712 Q 12.987 3.527 9.518 3.357 Z "
      fill={props.color || "#000000"}
    />
    <path
      d=" M 19.828 6.712 L 12.42 6.712 L 8.991 14.346 L 12.159 14.346 L 5.096 26.546 L 19.375 11.663 L 15.058 11.663 L 19.828 6.712 Z "
      fill={props.color || "#000000"}
      strokeWidth="1.5"
      stroke={props.backgroundColor || "#ffffff"}
    />
  </SvgIcon>
);
