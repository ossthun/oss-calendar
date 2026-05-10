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

  const [editingEvent, setEditingEvent] = useState(null);

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
    setSelectedDate(info.event.startStr.slice(0, 10));
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

  if (!group) {
    return <div style={styles.loading}>Lade Gruppe...</div>;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{group.name}</h1>

      {/* CALENDAR */}
      <div style={styles.calendarWrap}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dateClick={handleDateClick}
          eventClick={handleEventClick}

          // 🇩🇪 GERMAN LOCALE
          locale="de"
          firstDay={1}
          buttonText={{
            today: "Heute",
            month: "Monat",
            week: "Woche",
            day: "Tag"
          }}
          weekText="Woche"
          weekTextLong="Woche"
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>
              {editingEvent ? "Termin bearbeiten" : "Neuer Termin"}
            </h2>

            <p style={styles.dateText}>{selectedDate}</p>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel"
              style={styles.input}
              autoFocus
            />

            <div style={styles.row}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancel}
              >
                Abbrechen
              </button>

              {editingEvent && (
                <button
                  onClick={deleteEvent}
                  style={styles.delete}
                >
                  Löschen
                </button>
              )}

              <button onClick={saveEvent} style={styles.save}>
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
  row: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end"
  },
  save: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  cancel: {
    padding: "8px 12px",
    background: "#ddd",
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
  dateText: {
    color: "#666"
  }
};
