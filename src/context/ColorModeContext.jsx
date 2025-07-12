import React, { createContext, useEffect, useState } from "react";

export const ColorModeContext = createContext();

const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) setMode(setMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", mode === "dark");
  }, [mode]);
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
