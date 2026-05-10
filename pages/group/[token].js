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

  // modal state
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
    setShowModal(true);
  }

  async function createEvent() {
    if (!title) return;

    await supabase.from("events").insert([
      {
        group_token: token,
        title,
        date: selectedDate
      }
    ]);

    setTitle("");
    setShowModal(false);
    loadEvents();
  }

  if (!group) {
    return (
      <div style={styles.loading}>
        Loading group...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{group.name}</h1>
        <div style={styles.subtitle}>
          Group link: <code>{group.token}</code>
        </div>
      </div>

      {/* Calendar */}
      <div style={styles.calendarWrap}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dateClick={handleDateClick}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 10 }}>New Event</h2>

            <p style={{ color: "#666" }}>
              Date: {selectedDate}
            </p>

            <input
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button onClick={createEvent} style={styles.saveBtn}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Styles */
const styles = {
  page: {
    padding: 40,
    fontFamily: "Arial",
    background: "#f6f7fb",
    minHeight: "100vh"
  },
  header: {
    marginBottom: 20
  },
  title: {
    margin: 0,
    fontSize: 28
  },
  subtitle: {
    color: "#666",
    marginTop: 5
  },
  calendarWrap: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  loading: {
    padding: 40,
    fontFamily: "Arial"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    width: 300
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
  },
  cancelBtn: {
    padding: "8px 12px",
    background: "#eee",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  saveBtn: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
