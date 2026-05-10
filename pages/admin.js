import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .order("id", { ascending: false });

    setGroups(data || []);
  }

  function generateToken() {
    return Math.random().toString(36).substring(2, 10);
  }

  async function createGroup() {
    if (!name.trim()) return;

    await supabase.from("groups").insert([
      {
        name,
        token: generateToken()
      }
    ]);

    setName("");
    loadGroups();
  }

  async function renameGroup(id, newName) {
    await supabase
      .from("groups")
      .update({ name: newName })
      .eq("id", id);

    loadGroups();
  }

  async function deleteGroup(group) {
    const ok = confirm(
      "Delete group and all its events?"
    );
    if (!ok) return;

    await supabase
      .from("events")
      .delete()
      .eq("group_token", group.token);

    await supabase
      .from("groups")
      .delete()
      .eq("id", group.id);

    loadGroups();
  }

  return (
    <div style={styles.page}>
      <h1>Admin Panel</h1>

      {/* CREATE GROUP */}
      <div style={styles.box}>
        <h3>Create new group</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          style={styles.input}
        />

        <button onClick={createGroup} style={styles.button}>
          Create group
        </button>
      </div>

      {/* GROUP LIST */}
      <div style={styles.box}>
        <h3>Existing groups</h3>

        {groups.map((g) => (
          <div key={g.id} style={styles.groupRow}>
            <div>
              <b>{g.name}</b>
              <div style={{ fontSize: 12, color: "#666" }}>
                /group/{g.token}
              </div>
            </div>

            <div style={styles.actions}>
              <button
                onClick={() => {
                  const newName = prompt(
                    "New name:",
                    g.name
                  );
                  if (newName) renameGroup(g.id, newName);
                }}
              >
                Rename
              </button>

              <button
                onClick={() => deleteGroup(g)}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* styles */
const styles = {
  page: {
    padding: 40,
    fontFamily: "Arial",
    background: "#f5f6fa",
    minHeight: "100vh"
  },
  box: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    marginBottom: 10
  },
  button: {
    padding: 10,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  groupRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #eee"
  },
  actions: {
    display: "flex",
    gap: 10
  }
};
