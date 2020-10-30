import React from "react";
import { SvgIcon } from "@material-ui/core";

export const turretSVG = (
  <SvgIcon>
    <line
      x1="5.284"
      y1="12.303"
      x2="15.248"
      y2="7.431"
      strokeWidth="2"
      stroke="rgb(0,0,0)"
      strokeLinecap="round"
    />
    <path
      d=" M 7.734 10.073 L 7.761 9.55 L 9.413 8.725 L 9.688 8.092 L 14.835 6 Q 15.523 5.697 16.294 6 Q 17.064 6.303 18.33 8.092 L 16.459 10.514 L 17.174 10.817 L 17.174 11.642 L 16.459 12.303 L 15.908 12.303 L 15.771 12.716 L 14.835 13.404 L 14.835 14.725 L 15.55 15.055 L 15.55 15.633 L 16.459 16.018 L 16.459 16.514 L 11.615 18.798 L 10.486 18.55 L 9.413 18.55 L 8.284 17.807 L 8.284 17.257 L 7.761 16.844 L 9.11 15.633 L 9.688 15.248 L 10.651 14.725 L 10.651 12.716 L 11.45 12.303 L 11.45 11.862 L 10.486 12.303 L 10.651 11.642 L 9.688 12.138 L 8.477 11.862 L 7.734 10.073 Z "
      fill="rgb(0,0,0)"
    />
  </SvgIcon>
);
export const launcherSVG = (
  <SvgIcon>
    <path
      d=" M 9.589 13.688 L 9.364 14.101 L 10.819 14.79 L 10.819 15.552 L 8.081 15.552 L 7.343 16.019 L 7.343 17.59 L 16.708 17.59 L 18.766 16.019 L 18.766 15.257 L 17.95 14.79 L 18.553 13.363 L 18.979 12.316 L 7.542 6.41 L 5.021 11.36 L 9.589 13.688 Z "
      fill="rgb(0,0,0)"
    />
  </SvgIcon>
);
export const calibrationSVG = (
  <SvgIcon>
    <path
      d=" M 6.635 7.496 C 7.188 5.819 8.854 4.859 10.353 5.353 C 11.853 5.847 12.621 7.61 12.068 9.288 C 11.515 10.965 9.849 11.925 8.349 11.431 C 6.85 10.937 6.082 9.174 6.635 7.496 Z "
      fill="none"
      strokeWidth="2"
      stroke="rgb(0,0,0)"
    />
    <path
      d=" M 19.368 9.482 Q 19.128 8.823 18.536 8.151 L 12.74 7.818 L 11.895 7.426 L 11.532 9.871 L 9.57 11.411 L 7.125 10.596 L 6.129 11.139 L 3.955 10.384 Q 2.899 10.958 2.929 12.679 L 16.634 18.777 L 17.359 17.901 L 18.536 18.264 Q 19.351 17.751 18.989 16.392 L 17.812 16.09 L 17.812 15.426 L 9.027 12.135 L 9.027 11.984 L 10.838 11.984 L 11.895 11.743 L 18.536 12.528 Q 19.294 11.724 19.476 10.898 L 20.8 10.898 Q 21.344 10.203 20.8 9.539 L 19.368 9.482 Z "
      fill="rgb(0,0,0)"
    />
  </SvgIcon>
);
export const DroneBayIcon = (props) => {
  return (
    <SvgIcon>
      <path
        d=" M 5.97 12 C 5.97 8.72 8.672 6.057 12 6.057 C 15.328 6.057 18.03 8.72 18.03 12 C 18.03 15.28 15.328 17.943 12 17.943 C 8.672 17.943 5.97 15.28 5.97 12 Z "
        fill="none"
        strokeWidth="1"
        strokeLinecap="square"
        stroke={props.color || "#000000"}
      />
      <line
        x1="7.281"
        y1="6.953"
        x2="9.328"
        y2="9.164"
        strokeWidth="2"
        strokeLinecap="square"
        stroke={props.color || "#000000"}
      />
      <line
        x1="16.719"
        y1="6.953"
        x2="14.602"
        y2="9.164"
        strokeWidth="2"
        strokeLinecap="square"
        stroke={props.color || "#000000"}
      />
      <line
        x1="9.328"
        y1="14.789"
        x2="7.281"
        y2="17.047"
        strokeLinecap="square"
        strokeWidth="2"
        stroke={props.color || "#000000"}
      />
      <line
        x1="14.602"
        y1="14.789"
        x2="16.719"
        y2="17.047"
        strokeWidth="2"
        strokeLinecap="square"
        stroke={props.color || "#000000"}
      />
    </SvgIcon>
  );
};
export const DroneBandwidthIcon = (props) => {
  return (
    <SvgIcon>
      <path
        d=" M 14.484 4.922 L 11.76 11.074 L 15.012 11.074 L 10.441 19.002 L 19.195 9.879 L 14.906 9.879 L 19.635 4.922 L 14.484 4.922 Z "
        fill={props.color || "#000000"}
      />
      <line
        x1="7.041"
        y1="6.915"
        x2="9.635"
        y2="9.728"
        strokeWidth="2"
        stroke={props.color || "#000000"}
      />
      <line
        x1="9.635"
        y1="14.118"
        x2="7.041"
        y2="17.009"
        strokeWidth="2"
        stroke={props.color || "#000000"}
      />
      <line
        x1="15.844"
        y1="16.281"
        x2="16.479"
        y2="17.009"
        strokeWidth="2"
        stroke={props.color || "#000000"}
      />
    </SvgIcon>
  );
};
