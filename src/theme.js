import { experimental_extendTheme as extendTheme } from "@mui/material/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#FFFFFF", 
        },
        background: {
          default: "#edf2f2", 
          active: "#b3cec9", 
        },
        text: {
          primary: "#333", 
          active: "#fff", 
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#000000", 
        },
        background: {
          default: "#333", 
          active: "#b3cec9", 
        },
        text: {
          primary: "#ccc", 
          active: "#fff", 
        },
      },
    },
  },
});

export default theme;
