import { useEffect, useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const res = await fetch("/api/admin-groups");

    if (!res.ok) {
      setLoggedIn(false);
      return;
    }

    const data = await res.json();

    setGroups(data.groups || []);
    setLoggedIn(true);
  }

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

    setPassword("");

    await loadGroups();
  }

  async function logout() {
    await fetch("/api/logout");

    setLoggedIn(false);
    setGroups([]);
    setPassword("");
  }

  function openAdmin(groupToken) {
    const adminToken = prompt("Admin-Token eingeben");

    if (!adminToken) return;

    window.open(
      `/group/${groupToken}?admin=${encodeURIComponent(adminToken)}`,
      "_blank"
    );
  }

  if (!loggedIn) {
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

  return (
    <div style={styles.page}>
      <div style={styles.dashboard}>
        <div style={styles.header}>
          <div>
            <h1>Admin Dashboard</h1>

            <p style={styles.note}>Kalendergruppen verwalten</p>
          </div>

          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {groups.length === 0 ? (
          <p>Keine Gruppen gefunden.</p>
        ) : (
          <div style={styles.list}>
            {groups.map((group) => (
              <div key={group.id} style={styles.groupCard}>
                <h2>{group.name}</h2>

                <p>
                  <strong>Token:</strong> {group.token}
                </p>

                <div style={styles.buttonRow}>
                  <button
                    style={styles.openButton}
                    onClick={() =>
                      window.open(`/group/${group.token}`, "_blank")
                    }
                  >
                    Kalender öffnen
                  </button>

                  <button
                    style={styles.adminButton}
                    onClick={() => openAdmin(group.token)}
                  >
                    Admin
                  </button>
                </div>

                <p style={styles.small}>
                  Der Admin-Button fragt nach dem Admin-Token und öffnet dann
                  die Bearbeitungsansicht.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6fa",
    fontFamily: "Arial",
    padding: 30,
    boxSizing: "border-box",
  },

  card: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    width: "90%",
    maxWidth: 360,
    margin: "12vh auto 0",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  dashboard: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    maxWidth: 900,
    margin: "0 auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
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

  logoutButton: {
    padding: "10px 14px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    marginTop: 0,
  },

  note: {
    color: "#555",
    marginTop: 0,
  },

  list: {
    display: "grid",
    gap: 16,
    marginTop: 20,
  },

  groupCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 18,
    background: "#fafafa",
  },

  buttonRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },

  openButton: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: "bold",
  },

  adminButton: {
    padding: "10px 16px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: "bold",
  },

  small: {
    fontSize: 13,
    color: "#666",
    marginTop: 12,
  },
};
