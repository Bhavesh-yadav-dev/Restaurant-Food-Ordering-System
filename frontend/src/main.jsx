// src/main.jsx
// Application entry point.
// Mounts the React app into the #root div in index.html.
// BrowserRouter is placed here so the entire app has access to routing.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
