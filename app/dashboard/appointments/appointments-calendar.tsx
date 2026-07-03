// src/app/appointments/appointments-calendar.tsx
"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useMemo } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

const statusColors: Record<string, string> = {
  PLANIFIE: "#3b82f6",
  CONFIRME: "#22c55e",
  ANNULE: "#ef4444",
  TERMINE: "#6b7280",
};

export function AppointmentsCalendar({
  events,
}: {
  events: AppointmentEvent[];
}) {
  const [view, setView] = useState<View>("week");

  // react-big-calendar attend des objets Date natifs, pas des strings
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
    <div style={{ height: "75vh" }}>
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
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: statusColors[event.status] ?? "#3b82f6",
            borderRadius: "4px",
            border: "none",
          },
        })}
        tooltipAccessor={(event) =>
          event.location ? `${event.title} · ${event.location}` : event.title
        }
      />
    </div>
  );
}
