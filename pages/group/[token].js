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

  const [editName, setEditName] = useState("");

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
    setEditName(data?.name || "");
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

  // 🔧 UPDATE GROUP NAME
  async function renameGroup() {
    await supabase
      .from("groups")
      .update({ name: editName })
      .eq("token", token);

    loadGroup();
  }

  // 🗑 DELETE GROUP
  async function deleteGroup() {
    const confirmDelete = confirm(
      "Delete this group? This will remove ALL events."
    );

    if (!confirmDelete) return;

    await supabase.from("events").delete().eq("group_token", token);

    await supabase.from("groups").delete().eq("token", token);

    router.push("/");
  }

  if (!group) {
    return <div style={styles.loading}>Loading group...</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <h1 style={styles.title}>{group.name}</h1>

      {/* ADMIN PANEL */}
      <div style={styles.adminBox}>
        <h3>Admin controls</h3>

        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          style={styles.input}
        />

        <div style={styles.row}>
          <button style={styles.save} onClick={renameGroup}>
            Rename group
          </button>

          <button style={styles.delete} onClick={deleteGroup}>
            Delete group
          </button>
        </div>
      </div>

      {/* CALENDAR */}
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
            <h2>New Event</h2>

            <p>{selectedDate}</p>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              style={styles.input}
            />

            <div style={styles.row}>
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button onClick={createEvent} style={styles.save}>
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
    marginBottom: 10
  },

  adminBox: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  calendarWrap: {
    background: "white",
    padding: 20,
    borderRadius: 12
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

  row: {
    display: "flex",
    gap: 10
  },

  save: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  delete: {
    padding: "8px 12px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  overlay: {
    position: "fixed",
    inset: 0,
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
    width: 320
  },

  loading: {
    padding: 40
  }
};
