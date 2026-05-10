import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const { data, error } = await supabase
      .from("groups")
      .select("*");

    if (!error) {
      setGroups(data);
    }
  }

  function generateToken() {
    return Math.random().toString(36).substring(2, 12);
  }

  async function createGroup() {
    if (!groupName) return;

    const token = generateToken();

    const { error } = await supabase
      .from("groups")
      .insert([
        {
          name: groupName,
          token: token
        }
      ]);

    if (!error) {
      setGroupName("");
      loadGroups();
    } else {
      console.log(error);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>OSS Calendar</h1>

      <h2>Create Group</h2>

      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10
        }}
      />

      <button
        onClick={createGroup}
        style={{
          padding: 10,
          cursor: "pointer"
        }}
      >
        Create
      </button>

      <h2 style={{ marginTop: 40 }}>Groups</h2>

      {groups.map((group) => (
        <div
          key={group.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10
          }}
        >
          <strong>{group.name}</strong>

          <p>
            Link:
            <br />
            /group/{group.token}
          </p>
        </div>
      ))}
    </div>
  );
}
