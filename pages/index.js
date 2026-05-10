import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

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
        token: generateToken(),
        admin_token: generateToken()
      }
    ]);

    setName("");
    loadGroups();
  }

  async function renameGroup(group) {
    const newName = prompt("New group name:", group.name);
    if (!newName) return;

    await supabase
      .from("groups")
      .update({ name: newName })
      .eq("id", group.id);

    loadGroups();
  }

  async function deleteGroup(group) {
    const ok = confirm("Delete this group and all events?");
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

  function openMember(group) {
    router.push(`/group/${group.token}`);
  }

  function openAdmin(group) {
    router.push(
      `/group/${group.token}?admin=${group.admin_token}`
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Calendar Admin</h1>

      {/* CREATE */}
      <div style={styles.box}>
        <h3>Create group</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          style={styles.input}
        />

        <button onClick={createGroup} style={styles.createBtn}>
          Create
        </button>
      </div>

      {/* GROUPS */}
      <div style={styles.box}>
        <h3>Groups</h3>

        {groups.map((g) => (
          <div key={g.id} style={styles.row}>
            <div>
              <b>{g.name}</b>

              <div style={styles.small}>
                Member:
                <br />
                /group/{g.token}
              </div>

              <div style={styles.small}>
                Admin:
                <br />
                /group/{g.token}?admin={g.admin_token}
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={() => openMember(g)}>
                Open Member
              </button>

              <button onClick={() => openAdmin(g)}>
                Open Admin
              </button>

              <button onClick={() => renameGroup(g)}>
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

const styles = {
  page: {
    padding: 40,
    fontFamily: "Arial",
    background: "#f5f6fa",
    minHeight: "100vh"
  },
  title: {
    marginBottom: 20
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
    marginBottom: 10,
    border: "1px solid #ccc",
    borderRadius: 6,
    boxSizing: "border-box"
  },
  createBtn: {
    padding: 10,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #eee"
  },
  actions: {
    display: "flex",
    gap: 10,
    alignItems: "center"
  },
  small: {
    fontSize: 12,
    color: "#666",
    marginTop: 5
  }
};
