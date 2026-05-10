import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

/* =========================
   SWISS HOLIDAY GENERATOR
   ========================= */

function easterSunday(year) {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H =
    (C -
      f(C / 4) -
      f((8 * C + 13) / 25) +
      19 * G +
      15) %
    30;

  const I =
    H -
    f(H / 28) *
      (1 -
        f(29 / (H + 1)) * f((21 - G) / 11));

  const J =
    (year +
      f(year / 4) +
      I +
      2 -
      C +
      f(C / 4)) %
    7;

  const L = I - J;

  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function easterMonday(year) {
  const d = new Date(easterSunday(year));
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function easterFriday(year) {
  const d = new Date(easterSunday(year));
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

function ascensionDay(year) {
  const d = new Date(easterSunday(year));
  d.setDate(d.getDate() + 39);
  return d.toISOString().slice(0, 10);
}

function pentecostMonday(year) {
  const d = new Date(easterSunday(year));
  d.setDate(d.getDate() + 50);
  return d.toISOString().slice(0, 10);
}

function getSwissHolidays(year, token) {
  return [
    {
      title: "Neujahr",
      date: `${year}-01-01`
    },
    {
      title: "Karfreitag",
      date: easterFriday(year)
    },
    {
      title: "Ostermontag",
      date: easterMonday(year)
    },
    {
      title: "Auffahrt",
      date: ascensionDay(year)
    },
    {
      title: "Pfingstmontag",
      date: pentecostMonday(year)
    },
    {
      title: "Bundesfeier",
      date: `${year}-08-01`
    },
    {
      title: "Weihnachten",
      date: `${year}-12-25`
    },
    {
      title: "Stephanstag",
      date: `${year}-12-26`
    }
  ].map((h, i) => ({
    id: `h-${i}`,
    group_token: token,
    title: h.title,
    date: h.date,
    is_holiday: true
  }));
}

/* =========================
   MAIN COMPONENT
   ========================= */

export default function GroupPage() {
  const router = useRouter();

  const { token, admin } = router.query;

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showModal, setShowModal] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [title, setTitle] = useState("");

  const [editingEvent, setEditingEvent] =
    useState(null);

  const [editingHoliday, setEditingHoliday] =
    useState(false);

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

    if (data?.admin_token === admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setIsAdmin(data?.admin_token === admin);
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
        date: e.date,

        extendedProps: {
          is_holiday: e.is_holiday
        },

        backgroundColor: e.is_holiday
          ? "#dc2626"
          : "#2563eb",

        borderColor: e.is_holiday
          ? "#dc2626"
          : "#2563eb"
      }))
    const year = new Date().getFullYear();
    const holidays = getSwissHolidays(
      year,
      token
    );

    const dbEvents = (data || []).map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      extendedProps: {
        is_holiday: e.is_holiday
      },
      backgroundColor: e.is_holiday
        ? "#dc2626"
        : "#2563eb",
      borderColor: e.is_holiday
        ? "#dc2626"
        : "#2563eb"
    }));

    const holidayEvents = holidays.map((h) => ({
      ...h,
      backgroundColor: "#dc2626",
      borderColor: "#dc2626",
      extendedProps: {
        is_holiday: true
      }
    }));

    setEvents([...dbEvents, ...holidayEvents]);
  }

  // CREATE EVENT
  function handleDateClick(info) {
    setSelectedDate(info.dateStr);

    setTitle("");

    setEditingEvent(null);

    setEditingHoliday(false);

    setShowModal(true);
  }

  // EDIT EVENT
  function handleEventClick(info) {
    const isHoliday =
      info.event.extendedProps.is_holiday;

    // MEMBERS CANNOT EDIT HOLIDAYS
    if (isHoliday && !isAdmin) {
    if (
      info.event.extendedProps.is_holiday &&
      !isAdmin
    ) {
      alert(
        "Nur Admins können Feiertage bearbeiten."
      );
      return;
    }

    setEditingHoliday(isHoliday);

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
          date: selectedDate,
          is_holiday: false
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
    return (
      <div style={styles.loading}>
        Lade Gruppe...
      </div>
    );
    return <div style={{ padding: 40 }}>Lade...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>{group.name}</h1>
      </div>
      <h1>{group.name}</h1>

      <div style={styles.calendarWrap}>
      <div style={styles.calendar}>
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

          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          buttonText={{
            today: "Heute",
            month: "Monat",
            week: "Woche",
            day: "Tag"
          }}

          dateClick={handleDateClick}

          eventClick={handleEventClick}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
        <div style={styles.modalBg}>
          <div style={styles.modal}>
            <h2>
            <h3>
              {editingEvent
                ? "Termin bearbeiten"
                : "Neuer Termin"}
            </h2>
            </h3>

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
            <div style={styles.row}>
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
                <button onClick={deleteEvent}>
                  Löschen
                </button>
              )}

              <button
                style={styles.saveBtn}
                onClick={saveEvent}
              >
              <button onClick={saveEvent}>
                Speichern
              </button>
            </div>

            {editingHoliday && (
              <p style={styles.holidayInfo}>
                Feiertag (nur Admin editierbar)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
   ========================= */

const styles = {
  page: {
    padding: 40,
    fontFamily: "Arial",
    background: "#f5f6fa",
    minHeight: "100vh"
    padding: 30,
    fontFamily: "Arial"
  },

  header: {
    marginBottom: 20
  },

  calendarWrap: {
    background: "white",
  calendar: {
    background: "#fff",
    padding: 20,
    borderRadius: 12
  },

  loading: {
    padding: 40
    borderRadius: 10
  },

  overlay: {
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
    justifyContent: "center"
  },

  modal: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    width: 320
    width: 300
  },

  input: {
    width: "100%",
    padding: 10,
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    boxSizing: "border-box"
    marginBottom: 10
  },

  modalButtons: {
  row: {
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
  },

  deleteBtn: {
    padding: "8px 12px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  holidayInfo: {
    marginTop: 10,
    color: "#dc2626",
    fontSize: 12
    justifyContent: "space-between"
  }
};
