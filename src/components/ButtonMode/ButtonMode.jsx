import React, { useEffect } from "react";
import "./ButtonMode.scss";
import { useColorScheme } from "@mui/material/styles";

const ButtonMode = () => {
  const { mode, setMode } = useColorScheme();

  console.log("Current mode:", mode);

  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    if (savedMode && savedMode !== mode) {
      setMode(savedMode);
    }
  }, [setMode, mode]);

  const handleToggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
    console.log("Toggled to:", newMode);
  };

  if (!mode) return null;

  return (
    <div className="input-search-user-darkmode">
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
