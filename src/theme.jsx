import { extendTheme } from "@mui/material/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#045745" },
        secondary: { main: "#0288d1" },
        background: { default: "#f9f9f9", paper: "#ffffff" },
        text: { primary: "#333", secondary: "#555" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#045745" },
        secondary: { main: "#4fc3f7" },
        background: { default: "#000000", paper: "#2a2a2a" }, // Nền đen
        text: { primary: "#ffffff", secondary: "#b0b0b0" },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", Arial, sans-serif',
    h1: { fontWeight: 600, color: "inherit" },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          padding: "0.5em 1em",
          textTransform: "none",
          "&:hover": { backgroundColor: "#ddd" },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          lineHeight: 1.6,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          backgroundColor: "#000000",
          color: "#ffffff",
        },
      },
    },
  },
  defaultMode: "light",
  colorSchemeSelector: "data-mui-color-scheme",
});

export default theme;
