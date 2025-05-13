import React, { createContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const ColorModeContext = createContext();

const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode colors
                primary: { main: "#045745" },
                secondary: { main: "#0288d1" },
                background: { default: "#f9f9f9", paper: "#ffffff" },
                text: { primary: "#333", secondary: "#555" },
              }
            : {
                // Dark mode colors
                primary: { main: "#045745" },
                secondary: { main: "#4fc3f7" },
                background: { default: "#1a1a1a", paper: "#2a2a2a" },
                text: { primary: "#e0e0e0", secondary: "#b0b0b0" },
              }),
        },
        typography: {
          fontFamily: '"Roboto", Arial, sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeProvider;
