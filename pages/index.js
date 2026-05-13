import { useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setMessage("Prüfe Passwort...");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setMessage("Falsches Passwort oder Login-Fehler.");
      return;
    }

    setMessage("Login erfolgreich. Cookie wurde gesetzt.");
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Admin Login Test</h1>

      <form onSubmit={handleLogin}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          style={{
            padding: 12,
            fontSize: 16,
            marginRight: 10,
          }}
        />

        <button
          type="submit"
          style={{
            padding: 12,
            fontSize: 16,
          }}
        >
          Einloggen
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}
