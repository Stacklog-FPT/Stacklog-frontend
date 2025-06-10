import React, { createContext, useMemo, useState } from "react";

export const ColorModeContext = createContext();

const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ColorModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export default ColorModeProvider;
