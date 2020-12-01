import InitialFetch from "./InitialFetch";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { red, orange, blue, blueGrey, green } from "@material-ui/core/colors";
import React, { useState } from "react";

const lightTheme = createMuiTheme({
  palette: {
    primary: {
      light: "#6d6d6d",
      main: "#424242",
      dark: "#1b1b1b",
    },
    action: {
      opaqueHover: "#F5F5F5",
    },
    button: {
      color: "#ffffff",
    },
    property: {
      blue: blue[500],
      blueSecondary: blue[200],
      red: red[500],
      redSecondary: red[200],
      grey: blueGrey[500],
      greySecondary: blueGrey[200],
      org: orange[500], // For some f'ed reson using "orange"name make problem.
      orgSecondary: orange[200], // So instead of looking for some problem jusy used or(an)g(e)
      green: green[500],
    },
  },
});

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      light: "#ffffff",
      main: "#ffffff",
      dark: "#f5f5f5",
    },
    action: {
      opaqueHover: "#515151",
    },
    button: {
      color: "#ffffff",
    },
    property: {
      blue: "#66b3e8",
      blueSecondary: "#b1cce2",
      red: "#f54256",
      redSecondary: "#e8a5a5",
      grey: blueGrey[400],
      greySecondary: blueGrey[200],
      org: "#ff994d", // For some f'ed reson using "orange"name make problem.
      orgSecondary: "#f3cb90", // So instead of looking for problem just used or(an)g(e)
      green: green[500],
    },
  },
  overrides: {
    MuiPaper: {
      elevation3: {
        boxShadow: "",
        border: "solid 0.1px #595959",
      },
    },
  },
});

export default function Initialtheming(props) {
  const [isDark, setIsDark] = useState(false);

  return (
    <MuiThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <InitialFetch isDark={isDark} setIsDark={setIsDark} />
    </MuiThemeProvider>
  );
}
