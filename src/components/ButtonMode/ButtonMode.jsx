import React from "react";
import "./ButtonMode.scss";
import { useColorScheme } from "@mui/material";

const ButtonMode = () => {
  const { mode, setMode } = useColorScheme();
  console.log(mode);

  const handleToggleMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  return (
    <div className="input-search-user-darkmode">
      <i
        className={`fa-solid fa-sun ${mode === "light" ? "active" : ""}`}
        onClick={handleToggleMode}
      ></i>
      <i
        className={`fa-solid fa-moon ${mode === "dark" ? "active" : ""}`}
        onClick={handleToggleMode}
      ></i>
    </div>
  );
};

export default ButtonMode;
