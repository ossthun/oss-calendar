import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Falsches Passwort.");
      return;
    }

    router.reload();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Admin Login</h1>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Einloggen
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial",
  },

  card: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    width: "90%",
    maxWidth: 360,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  input: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 12,
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    marginTop: 0,
  },
};
