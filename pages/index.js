import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function loadGroups() {
      const { data, error } = await supabase
        .from("groups")
        .select("*");

      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Groups:", data);
        setGroups(data);
      }
    }

    loadGroups();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>OSS Calendar</h1>

      <p>Supabase connection test</p>

      <h2>Groups</h2>

      {groups.length === 0 ? (
        <p>No groups yet.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              {group.name} ({group.token})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
