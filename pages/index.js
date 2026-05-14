import { useEffect, useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  const [newGroupName, setNewGroupName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createdGroup, setCreatedGroup] = useState(null);

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
    setCreatedGroup(null);
  }

  function openAdmin(groupToken) {
    const adminToken = prompt("Admin-Token eingeben");

    if (!adminToken) return;

    window.open(
      `/group/${groupToken}?admin=${encodeURIComponent(adminToken)}`,
      "_blank"
    );
  }

  async function createGroup(e) {
    e.preventDefault();

    setCreateError("");
    setCreatedGroup(null);

    const res = await fetch("/api/create-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newGroupName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setCreateError(data.error || "Gruppe konnte nicht erstellt werden.");
      return;
    }

    setNewGroupName("");
    setCreatedGroup(data);

    await loadGroups();
  }

  async function renameGroup(group) {
    const newName = prompt(
      "Neuer Gruppenname:",
      group.name
    );

    if (!newName) return;

    const res = await fetch("/api/update-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: group.id,
        name: newName,
      }),
    });

    if (!res.ok) {
      alert("Umbenennen fehlgeschlagen.");
      return;
    }

    await loadGroups();
  }

  async function deleteGroup(group) {
    const confirmed = confirm(
      `Gruppe "${group.name}" wirklich löschen?\n\nAlle Termine werden ebenfalls gelöscht.`
    );

    if (!confirmed) return;

    const res = await fetch("/api/delete-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: group.id,
        token: group.token,
      }),
    });

    if (!res.ok) {
      alert("Löschen fehlgeschlagen.");
      return;
    }

    await loadGroups();
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
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Passwort"
              style={styles.input}
            />

            {error && (
              <p style={styles.error}>
                {error}
              </p>
            )}

            <button
              type="submit"
              style={styles.button}
            >
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

            <p style={styles.note}>
              Kalendergruppen verwalten
            </p>
          </div>

          <button
            onClick={logout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>

        <div style={styles.createBox}>
          <h2>Neue Gruppe erstellen</h2>

          <form
            onSubmit={createGroup}
            style={styles.createForm}
          >
            <input
              value={newGroupName}
              onChange={(e) =>
                setNewGroupName(
                  e.target.value
                )
              }
              placeholder="Gruppenname"
              style={styles.input}
            />

            <button
              type="submit"
              style={styles.createButton}
            >
              Gruppe erstellen
            </button>
          </form>

          {createError && (
            <p style={styles.error}>
              {createError}
            </p>
          )}

          {createdGroup && (
            <div style={styles.successBox}>
              <h3>Gruppe erstellt</h3>

              <p>
                <strong>Name:</strong>{" "}
                {createdGroup.group.name}
              </p>

              <p>
                <strong>Öffentlicher Link:</strong>
                <br />
                <code>
                  {
                    createdGroup.adminLink.split(
                      "?admin="
                    )[0]
                  }
                </code>
              </p>

              <p>
                <strong>Admin-Link:</strong>
                <br />
                <code>
                  {createdGroup.adminLink}
                </code>
              </p>

              <p>
                <strong>Admin-Token:</strong>
                <br />
                <code>
                  {createdGroup.adminToken}
                </code>
              </p>

              <p style={styles.warning}>
                Wichtig: Speichere den
                Admin-Link jetzt.
              </p>
            </div>
          )}
        </div>

        <div style={styles.list}>
          {groups.map((group) => (
            <div
              key={group.id}
              style={styles.groupCard}
            >
              <h2>{group.name}</h2>

              <p>
                <strong>Token:</strong>{" "}
                {group.token}
              </p>

              <div style={styles.buttonRow}>
                <button
                  style={styles.openButton}
                  onClick={() =>
                    window.open(
                      `/group/${group.token}`,
                      "_blank"
                    )
                  }
                >
                  Kalender öffnen
                </button>

                <button
                  style={styles.adminButton}
                  onClick={() =>
                    openAdmin(group.token)
                  }
                >
                  Admin
                </button>

                <button
                  style={styles.renameButton}
                  onClick={() =>
                    renameGroup(group)
                  }
                >
                  Umbenennen
                </button>

                <button
                  style={styles.deleteButton}
                  onClick={() =>
                    deleteGroup(group)
                  }
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
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
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
  },

  dashboard: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    maxWidth: 1000,
    margin: "0 auto",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
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

  createBox: {
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },

  createForm: {
    display: "grid",
    gap: 8,
  },

  createButton: {
    padding: 12,
    fontSize: 16,
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },

  successBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    background: "#ecfdf5",
    border: "1px solid #86efac",
  },

  warning: {
    color: "#92400e",
    fontWeight: "bold",
  },

  error: {
    color: "#dc2626",
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

  renameButton: {
    padding: "10px 16px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: "bold",
  },

  deleteButton: {
    padding: "10px 16px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: "bold",
  },
};
