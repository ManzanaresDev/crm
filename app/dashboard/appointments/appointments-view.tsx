// src/app/appointments/appointments-view.tsx
"use client";

import { useState } from "react";
import { List, CalendarDays } from "lucide-react";
import { AppointmentsCalendar } from "./appointments-calendar";
import { AppointmentsList } from "./appointments-list";

export type AppointmentEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  location: string | null;
  contactName: string | null;
  dealTitle: string | null;
};

export function AppointmentsView({ events }: { events: AppointmentEvent[] }) {
  const [mode, setMode] = useState<"calendar" | "list">("calendar");

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${
              mode === "calendar"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CalendarDays size={16} />
            Calendrier
          </button>
          <button
            onClick={() => setMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-l ${
              mode === "list"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List size={16} />
            Liste
          </button>
        </div>
      </div>

      {mode === "calendar" ? (
        <AppointmentsCalendar events={events} />
      ) : (
        <AppointmentsList events={events} />
      )}
    </div>
  );
}
