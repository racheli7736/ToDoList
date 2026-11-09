
import React, { useState } from "react";
import service from "./service";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await service.login(username, password);
      window.location.replace("/");
    } catch {
      setError("שם המשתמש או הסיסמה שגויים");
    }
  }

  return (
    <div dir="rtl" style={{ maxWidth: 350, margin: "80px auto" }}>
      <h2>התחברות</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">התחברות</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        אין לך חשבון? <a href="/register">להרשמה</a>
      </p>
    </div>
  );
}
