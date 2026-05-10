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

  // Load group + events when token is ready
  useEffect(() => {
    if (token) {
      loadGroup();
      loadEvents();
    }
  }, [token]);

  // Fetch group info
  async function loadGroup() {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("token", token)
      .single();

    if (!error) {
      setGroup(data);
    } else {
      console.log("Group error:", error);
    }
  }

  // Fetch events for this group
  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("group_token", token);

    if (!error) {
      setEvents(
        (data || []).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date
        }))
      );
    } else {
      console.log("Events error:", error);
    }
  }

  // Create event when clicking a day
  async function handleDateClick(info) {
    const title = prompt("Event title?");
    if (!title) return;

    const { error } = await supabase.from("events").insert([
      {
        group_token: token,
        title,
        date: info.dateStr
      }
    ]);

    if (!error) {
      loadEvents(); // refresh calendar
    } else {
      console.log("Insert error:", error);
    }
  }

  // Loading state
  if (!group) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        Loading group...
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      {/* Header */}
      <h1 style={{ marginBottom: 5 }}>{group.name}</h1>
      <p style={{ color: "gray" }}>
        Group token: <code>{group.token}</code>
      </p>

      {/* Calendar */}
      <div style={{ marginTop: 30 }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dateClick={handleDateClick}
        />
      </div>
    </div>
  );
}
