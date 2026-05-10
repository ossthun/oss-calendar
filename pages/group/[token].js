import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

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
      .eq("group_token", token);

    setEvents(
      (data || []).map((e) => ({
        title: e.title,
        date: e.date
      }))
    );
  }

  async function createEvent() {
    if (!title || !date) return;

    await supabase.from("events").insert([
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
    return <div style={{ padding: 40 }}>Loading group...</div>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>{group.name}</h1>

      <h2>Create Event</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={createEvent} style={{ padding: 8 }}>
        Add
      </button>

      <h2 style={{ marginTop: 40 }}>Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );
}
