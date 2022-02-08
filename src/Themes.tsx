import { createTheme, responsiveFontSizes } from "@mui/material";

export const DEFAULT_THEME = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#64b5f6",
        dark: "#2286c3",
        light: "#9be7ff"
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
        main: "#ffb300",
        dark: "#c68400",
        light: "#ffe54c"
      },
      secondary: {
        main: "rgb(182, 176, 166)",
        dark: "#aeaeae",
        light: "rgb(32, 35, 37)"
      }
    }
  })
);
