import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

function getSwissHolidays(year) {
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
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
    extendedProps: {
      is_holiday: true
    }
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
     LOCK BACKGROUND SCROLL
     ========================= */

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "auto";
    }

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [showModal]);

  /* =========================
     LOAD DATA
     ========================= */

  useEffect(() => {
    if (token) {
      loadGroup();
      loadEvents();
    }
  }, [token, admin]);

  async function loadGroup() {
    try {
      const res = await fetch(
        `/api/calendar/${token}?admin=${admin || ""}`
      );

      if (!res.ok) {
        throw new Error("Fehler");
      }

      const data = await res.json();

      setGroup({
        name: data.groupName
      });

      setIsAdmin(data.isAdmin);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadEvents() {
    try {
      const res = await fetch(
        `/api/calendar/${token}?admin=${admin || ""}`
      );

      if (!res.ok) {
        throw new Error("Fehler");
      }

      const result = await res.json();

      const data = result.events || [];

      const year = new Date().getFullYear();

      const holidays = [
        ...getSwissHolidays(year - 1),
        ...getSwissHolidays(year),
        ...getSwissHolidays(year + 1)
      ];

      const dbEvents = data.map((e) => ({
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

      setEvents([
        ...dbEvents,
        ...holidays
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  /* =========================
     EVENT HANDLERS
     ========================= */

  function handleDateClick(info) {
    if (!isAdmin) return;

    setSelectedDate(info.dateStr);

    setTitle("");

    setEditingEvent(null);

    setShowModal(true);
  }

  function handleEventClick(info) {
    if (!isAdmin) return;

    if (
      info.event.extendedProps
        .is_holiday
    ) {
      alert(
        "Feiertage können nicht bearbeitet werden."
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

  async function saveEvent() {
    alert(
      "Speichern wird später serverseitig aktiviert."
    );
  }

  async function deleteEvent() {
    alert(
      "Löschen wird später serverseitig aktiviert."
    );
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
        padding: isMobile ? 12 : 30
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
            left: "prev,next",
            center: "title",
            right: "today"
          }}
          buttonText={{
            today: "Heute"
          }}
          dayMaxEventRows={2}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

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
    padding: 12,
    borderRadius: 12
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999
  },

  modal: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    width: "90vw",
    maxWidth: 340,
    boxSizing: "border-box"
  },

  input: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 8,
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: 16
  },

  modalButtons: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end"
  },

  saveBtn: {
    padding: "10px 14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },

  cancelBtn: {
    padding: "10px 14px",
    background: "#ddd",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },

  deleteBtn: {
    padding: "10px 14px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  }
};
