import { createTheme, responsiveFontSizes } from "@mui/material";

export const DEFAULT_THEME = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#ff7f34",
        dark: "#c65000",
        light: "#ffb063"
      },
      secondary: {
        main: "#b0b0b0",
        dark: "#aeaeae",
        light: "#f0f0f0"
      }
    }
  })
);

export const DARK_THEME = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#ff7f34",
        dark: "#c65000",
        light: "#ffb063"
      },
      secondary: {
        main: "rgb(182, 176, 166)",
        dark: "#aeaeae",
        light: "rgb(32, 35, 37)"
      }
    }
  })
);
