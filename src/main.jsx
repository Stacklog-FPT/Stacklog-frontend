import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.scss";
import App from "./App.jsx";
import Provides from "./context/index.jsx";
createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <Provides>
      <App />
    </Provides>
  // </StrictMode>
);
