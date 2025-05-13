import React, { useContext, useEffect } from "react";
import "./ButtonMode.scss";
import { ColorModeContext } from "../../context/ColorModeContext";

const ButtonMode = () => {
  const { mode, toggleMode } = useContext(ColorModeContext);

  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    if (savedMode && savedMode !== mode) {
      toggleMode(savedMode);
    }
  }, [mode, toggleMode]);

  const handleToggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    toggleMode(newMode);
    localStorage.setItem("theme", newMode);
    console.log("Toggled to:", newMode);
  };

  if (!mode) return null;

  return (
    <div
      className={`input-search-user-darkmode  ${
        mode === "light" ? "light" : "dark"
      }`}
    >
      <i
        className={`fa-solid fa-sun ${mode === "light" ? "active" : ""}`}
        onClick={handleToggleMode}
        role="button"
        aria-label="Switch to dark mode"
      />
      <i
        className={`fa-solid fa-moon ${mode === "dark" ? "active" : ""}`}
        onClick={handleToggleMode}
        role="button"
        aria-label="Switch to light mode"
      />
    </div>
  );
};

export default ButtonMode;
