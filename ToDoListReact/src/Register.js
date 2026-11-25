
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
    <div className="page">
    <div className="card narrow">
      <h1 className="title">הרשמה</h1>
      <p className="subtitle">יצירת חשבון חדש</p>

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
          placeholder="סיסמה - לפחות 8 תווים"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" className="btn btn-primary">הרשמה</button>
      </form>

      {error && <p className="error">{error}</p>}

      <p className="switch-link">
        כבר יש לך חשבון? <a href="/login">להתחברות</a>
      </p>
    </div>
    </div>
  );
}
