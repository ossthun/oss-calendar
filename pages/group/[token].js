import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function GroupPage() {
  const router = useRouter();
  const { token } = router.query;

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (token) {
      loadGroup();
      loadEvents();
    }
  }, [token]);

  async function loadGroup() {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("token", token)
      .single();

    setGroup(data);
  }

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("group_token", token)
      .order("date", { ascending: true });

    setEvents(data || []);
  }

  async function createEvent() {
    if (!title || !date) return;

    await supabase
      .from("events")
      .insert([
        {
          group_token: token,
          title,
          date
        }
      ]);

    setTitle("");
    setDate("");

    loadEvents();
  }

  if (!group) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Loading group...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>{group.name}</h1>

      <h2>Create Event</h2>

      <input
        type="text"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10
        }}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10
        }}
      />

      <button
        onClick={createEvent}
        style={{
          padding: 10,
          cursor: "pointer"
        }}
      >
        Add Event
      </button>

      <h2 style={{ marginTop: 40 }}>Events</h2>

      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              {event.date} — {event.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
