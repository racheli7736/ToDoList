import React from "react";
import Login from "./Login";
import Register from "./Register";

export default function AuthGate({ children }) {
  const path = window.location.pathname;

  if (path === "/login") return <Login />;
  if (path === "/register") return <Register />;

  if (!sessionStorage.getItem("token")) {
    window.location.replace("/login");
    return null;
  }

  return children;
}