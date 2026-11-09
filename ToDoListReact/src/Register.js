
import React, { useState } from "react";
import service from "./service";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await service.register(username, password);
      window.location.replace("/login");
    } catch (err) {
      setError(
        err.response?.status === 409
          ? "שם המשתמש כבר קיים"
          : "ההרשמה נכשלה"
      );
    }
  }

  return (
    <div dir="rtl" style={{ maxWidth: 350, margin: "80px auto" }}>
      <h2>הרשמה</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="סיסמה - לפחות 8 תווים"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit">הרשמה</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        כבר רשומה? <a href="/login">להתחברות</a>
      </p>
    </div>
  );
}
