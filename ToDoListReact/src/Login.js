
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
    <div className="page">
    <div className="card narrow">
      <h1 className="title">התחברות</h1>
      <p className="subtitle">שמחים לראות אותך שוב</p>

      <form className="form" onSubmit={handleSubmit}>
        <input
          className="field"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="field"
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary">התחברות</button>
      </form>

      {error && <p className="error">{error}</p>}

      <p className="switch-link">
        אין לך חשבון? <a href="/register">להרשמה</a>
      </p>
    </div>
    </div>
  );
}
