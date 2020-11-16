import React from "react";
import { SvgIcon } from "@material-ui/core";

export const OverloadIcon = (props) => (
  <SvgIcon>
    <path
      d=" M 7.449 2.745 Q 7.108 5.589 9.411 8.575 C 11.991 11.918 6.369 12.954 8.473 15.342 C 10.577 17.731 9.657 19.095 9.212 19.437 C 8.843 19.722 7.165 19.693 6.084 17.731 C 5.004 15.769 4.918 13.466 7.449 11.134 Q 9.98 8.802 6.795 7.523 L 7.449 2.745 Z "
      fill={props.color || "#ffffff"}
    />
    <path
      d=" M 11.761 2.745 Q 11.42 5.589 13.723 8.575 C 16.303 11.918 10.681 12.954 12.785 15.342 C 14.889 17.731 13.969 19.095 13.524 19.437 C 13.155 19.722 11.477 19.693 10.396 17.731 C 9.316 15.769 9.231 13.466 11.761 11.134 Q 14.292 8.802 11.107 7.523 L 11.761 2.745 Z "
      fill={props.color || "#ffffff"}
    />
    <path
      d=" M 15.978 2.745 Q 15.636 5.589 17.94 8.575 C 20.519 11.918 14.897 12.954 17.001 15.342 C 19.106 17.731 18.185 19.095 17.741 19.437 C 17.371 19.722 15.693 19.693 14.613 17.731 C 13.532 15.769 13.447 13.466 15.978 11.134 Q 18.508 8.802 15.324 7.523 L 15.978 2.745 Z "
      fill={props.color || "#ffffff"}
    />
  </SvgIcon>
);
export const ActivationIcon = (props) => (
  <SvgIcon>
    <path
      d=" M 16.746 12 L 12 14.74 L 7.254 17.48 L 7.254 12 L 7.254 6.52 L 12 9.26 L 16.746 12 Z "
      fill={props.color || "#ffffff"}
    />
  </SvgIcon>
);

export const OfflineIcon = (props) => (
  <SvgIcon>
    <line
      x1="14.742"
      y1="6.625"
      x2="14.742"
      y2="17.375"
      strokeWidth="2"
      stroke={props.color || "#ffffff"}
    />
    <line
      x1="9.258"
      y1="6.625"
      x2="9.258"
      y2="17.375"
      strokeWidth="2"
      stroke={props.color || "#ffffff"}
    />
  </SvgIcon>
);
export const PassiveIcon = (props) => (
  <SvgIcon>
    <path
      d=" M 7.073 12 C 7.073 9.281 9.281 7.073 12 7.073 C 14.719 7.073 16.927 9.281 16.927 12 C 16.927 14.719 14.719 16.927 12 16.927 C 9.281 16.927 7.073 14.719 7.073 12 Z "
      fill="none"
      strokeWidth="2"
      stroke={props.color || "#ffffff"}
    />
  </SvgIcon>
);
