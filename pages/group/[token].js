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
        f(29 / (H + 1)) *
          f((21 - G) / 11));

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
    id: `holiday-${year}-${i}`,
    title: h.title,
    date: h.date,
    extendedProps: {
      is_holiday: true
    },
    backgroundColor: "#dc2626",
    borderColor: "#dc2626"
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

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [title, setTitle] = useState("");

  const [editingEvent, setEditingEvent] =
    useState(null);

  const [isMobile, setIsMobile] =
    useState(false);

  /* =========================
     MOBILE DETECTION
     ========================= */

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 700);
    }

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  /* =========================
     LOAD GROUP + EVENTS
     ========================= */

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

    setIsAdmin(
      data?.admin_token === admin
    );
  }

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("group_token", token);

    const year = new Date().getFullYear();

    const holidays = [
      ...getSwissHolidays(
        year - 1,
        token
      ),

      ...getSwissHolidays(
        year,
        token
      ),

      ...getSwissHolidays(
        year + 1,
        token
      )
    ];

    const dbEvents = (data || []).map(
      (e) => ({
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
      })
    );

    setEvents([
      ...dbEvents,
      ...holidays
    ]);
  }

  /* =========================
     CREATE EVENT
     ========================= */

  function handleDateClick(info) {
    setSelectedDate(info.dateStr);

    setTitle("");

    setEditingEvent(null);

    setShowModal(true);
  }

  /* =========================
     EDIT EVENT
     ========================= */

  function handleEventClick(info) {
    if (
      info.event.extendedProps
        .is_holiday &&
      !isAdmin
    ) {
      alert(
        "Nur Admins können Feiertage bearbeiten."
      );

      return;
    }

    setEditingEvent(info.event);

    setTitle(info.event.title);

    setSelectedDate(
      info.event.startStr.slice(0, 10)
    );

    setShowModal(true);
  }

  /* =========================
     SAVE EVENT
     ========================= */

  async function saveEvent() {
    if (!title.trim()) return;

    if (
      editingEvent &&
      !String(editingEvent.id).startsWith(
        "holiday-"
      )
    ) {
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

  /* =========================
     DELETE EVENT
     ========================= */

  async function deleteEvent() {
    if (!editingEvent) return;

    // generated holidays cannot be deleted
    if (
      String(editingEvent.id).startsWith(
        "holiday-"
      )
    ) {
      alert(
        "Dynamische Feiertage können nicht gelöscht werden."
      );

      return;
    }

    await supabase
      .from("events")
      .delete()
      .eq("id", editingEvent.id);

    setShowModal(false);

    setEditingEvent(null);

    loadEvents();
  }

  /* =========================
     LOADING
     ========================= */

  if (!group) {
    return (
      <div style={{ padding: 40 }}>
        Lade...
      </div>
    );
  }

  /* =========================
     RENDER
     ========================= */

  return (
    <div
      style={{
        ...styles.page,
        padding: isMobile ? 10 : 30
      }}
    >
      <h1>{group.name}</h1>

      <div style={styles.calendar}>
        <FullCalendar
          plugins={[
            dayGridPlugin,
            interactionPlugin
          ]}
          initialView="dayGridMonth"
          locale="de"
          firstDay={1}
          events={events}
          height="auto"

          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: ""
          }}

          buttonText={{
            today: "Heute",
            month: "Monat",
            week: "Woche",
            day: "Tag"
          }}

          dayMaxEventRows={2}

          dateClick={handleDateClick}

          eventClick={handleEventClick}
        />
      </div>

      {/* MODAL */}

      {showModal && (
        <div style={styles.modalBg}>
          <div style={styles.modal}>
            <h3>
              {editingEvent
                ? "Termin bearbeiten"
                : "Neuer Termin"}
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

            <div style={styles.row}>
              <button
                style={styles.button}
                onClick={() =>
                  setShowModal(false)
                }
              >
                Abbrechen
              </button>

              {editingEvent && (
                <button
                  style={styles.deleteButton}
                  onClick={deleteEvent}
                >
                  Löschen
                </button>
              )}

              <button
                style={styles.button}
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

/* =========================
   STYLES
   ========================= */

const styles = {
  page: {
    fontFamily: "Arial",
    background: "#f5f6fa",
    minHeight: "100vh"
  },

  calendar: {
    background: "white",
    padding: 15,
    borderRadius: 12,
    overflowX: "auto"
  },

  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  },

  modal: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    width: "90vw",
    maxWidth: 320
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
    justifyContent: "space-between",
    gap: 10
  },

  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  deleteButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    background: "#dc2626",
    color: "white"
  }
};
