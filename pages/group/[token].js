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

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [title, setTitle] = useState("");

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

  function handleDateClick(info) {
    setSelectedDate(info.dateStr);
    setTitle("");
    setShowModal(true);
  }

  async function createEvent() {
    if (!title.trim()) return;

    await supabase.from("events").insert([
      {
        group_token: token,
        title,
        date: selectedDate
      }
    ]);

    setShowModal(false);
    loadEvents();
  }

  if (!group) {
    return <div style={styles.loading}>Loading group...</div>;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{group.name}</h1>

      <div style={styles.calendarWrap}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dateClick={handleDateClick}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.heading}>New Event</h2>

            <p style={styles.dateText}>
              {selectedDate}
            </p>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              style={styles.input}
              autoFocus
            />

            <div style={styles.buttons}>
              <button
                style={styles.cancel}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button style={styles.save} onClick={createEvent}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* STYLES */
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

  calendarWrap: {
    background: "white",
    padding: 20,
    borderRadius: 12
  },

  loading: {
    padding: 40
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modal: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    width: 320,
    boxSizing: "border-box"
  },

  heading: {
    marginBottom: 10
  },

  dateText: {
    color: "#666",
    marginBottom: 10
  },

  input: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    border: "1px solid #ccc",
    borderRadius: 6,
    boxSizing: "border-box"
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
  },

  cancel: {
    padding: "8px 12px",
    background: "#ddd",
    border: "none",
    cursor: "pointer",
    borderRadius: 6
  },

  save: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: 6
  }
};
