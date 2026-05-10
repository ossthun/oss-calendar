import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function GroupPage() {
  const router = useRouter();
  const { token } = router.query;

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);

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
        id: e.id,
        title: e.title,
        date: e.date
      }))
    );
  }

  async function handleDateClick(info) {
    const title = prompt("Event title?");
    if (!title) return;

    await supabase.from("events").insert([
      {
        group_token: token,
        title,
        date: info.dateStr
      }
    ]);

    loadEvents();
  }

  if (!group) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        Loading group...
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>{group.name}</h1>

      <p style={{ color: "gray" }}>
        Group token: <code>{group.token}</code>
      </p>

      <div style={{ marginTop: 30 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dateClick={handleDateClick}
        />
      </div>
    </div>
  );
}
