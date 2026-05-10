import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function GroupPage() {
  const router = useRouter();

  const { token, admin } = router.query;

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [title, setTitle] = useState("");

  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (token) {
      loadGroup();
      loadEvents();
    }
  }, [token, admin]);

  async function loadGroup() {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("token", token)
      .single();

    setGroup(data);

    // check admin access
    if (data?.admin_token === admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
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

  // CREATE EVENT
  function handleDateClick(info) {
    setSelectedDate(info.dateStr);
    setTitle("");
    setEditingEvent(null);
    setShowModal(true);
  }

  // EDIT EVENT
  function handleEventClick(info) {
    setEditingEvent(info.event);

    setTitle(info.event.title);

    setSelectedDate(
      info.event.startStr.slice(0, 10)
    );

    setShowModal(true);
  }

  async function saveEvent() {
    if (!title.trim()) return;

    if (editingEvent) {
      await supabase
        .from("events")
        .update({
          title,
          date: selectedDate
        })
        .eq("id", editingEvent.id);
    } else {
      await supabase.from("events").insert([
        {
          group_token: token,
          title,
          date: selectedDate
        }
      ]);
    }

    setShowModal(false);
    setEditingEvent(null);

    loadEvents();
  }

  async function deleteEvent() {
    if (!editingEvent) return;

    await supabase
      .from("events")
      .delete()
      .eq("id", editingEvent.id);

    setShowModal(false);

    setEditingEvent(null);

    loadEvents();
  }

  // ADMIN ONLY
  async function renameGroup() {
    const newName = prompt(
      "New group name:",
      group.name
    );

    if (!newName) return;

    await supabase
      .from("groups")
      .update({ name: newName })
      .eq("token", token);

    loadGroup();
  }

  async function deleteGroup() {
    const ok = confirm(
      "Delete this group and all events?"
    );

    if (!ok) return;

    await supabase
      .from("events")
      .delete()
      .eq("group_token", token);

    await supabase
      .from("groups")
      .delete()
      .eq("token", token);

    router.push("/");
  }

  if (!group) {
    return (
      <div style={styles.loading}>
        Lade Gruppe...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>{group.name}</h1>

        {/* ADMIN CONTROLS */}
        {isAdmin && (
          <div style={styles.adminRow}>
            <button
              style={styles.adminBtn}
              onClick={renameGroup}
            >
              Gruppe umbenennen
            </button>

            <button
              style={styles.deleteBtn}
              onClick={deleteGroup}
            >
              Gruppe löschen
            </button>
          </div>
        )}
      </div>

      {/* CALENDAR */}
      <div style={styles.calendarWrap}>
        <FullCalendar
          plugins={[
            dayGridPlugin,
            interactionPlugin
          ]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          locale="de"
          firstDay={1}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>
              {editingEvent
                ? "Termin bearbeiten"
                : "Neuer Termin"}
            </h2>

            <p>{selectedDate}</p>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Titel"
              style={styles.input}
              autoFocus
            />

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() =>
                  setShowModal(false)
                }
              >
                Abbrechen
              </button>

              {editingEvent && (
                <button
                  style={styles.deleteBtn}
                  onClick={deleteEvent}
                >
                  Löschen
                </button>
              )}

              <button
                style={styles.saveBtn}
                onClick={saveEvent}
              >
                Speichern
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  adminRow: {
    display: "flex",
    gap: 10
  },

  adminBtn: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  deleteBtn: {
    padding: "8px 12px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
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

  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    boxSizing: "border-box"
  },

  modalButtons: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end"
  },

  saveBtn: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  cancelBtn: {
    padding: "8px 12px",
    background: "#ddd",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
