import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import AuthGate from "./AuthGate";

ReactDOM.render(
  <AuthGate>
    <App />
  </AuthGate>,
  document.getElementById("root")
);