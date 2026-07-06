"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useMemo } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { STATUS_STYLES } from "./status-styles";

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

type AppointmentEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  location: string | null;
};

export function AppointmentsCalendar({
  events,
}: {
  events: AppointmentEvent[];
}) {
  const [view, setView] = useState<View>("week");

  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      })),
    [events],
  );

  return (
    <div className="rbc-dark-theme" style={{ height: "75vh" }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={["month", "week", "day", "agenda"]}
        culture="fr"
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          noEventsInRange: "Aucun rendez-vous sur cette période",
        }}
        eventPropGetter={(event) => {
          const color = STATUS_STYLES[event.status]?.color ?? "#22d3ee";
          return {
            style: {
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}80`,
              borderRadius: "6px",
              border: "none",
              color: "#04121f",
              fontWeight: 600,
            },
          };
        }}
        tooltipAccessor={(event) =>
          event.location ? `${event.title} · ${event.location}` : event.title
        }
      />
    </div>
  );
}
