// app/appointments/appointments-view.tsx
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
      <div className="mb-4 flex justify-end">
        <div
          className="inline-flex overflow-hidden rounded-lg p-1"
          style={{
            background: "rgba(226, 232, 240, 0.06)",
            border: "1px solid rgba(226, 232, 240, 0.14)",
          }}
        >
          <button
            onClick={() => setMode("calendar")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all"
            style={
              mode === "calendar"
                ? {
                    background: "linear-gradient(135deg, #22d3ee, #0891b2)",
                    color: "#04121f",
                  }
                : { color: "#94a3b8" }
            }
          >
            <CalendarDays size={16} />
            Calendrier
          </button>
          <button
            onClick={() => setMode("list")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all"
            style={
              mode === "list"
                ? {
                    background: "linear-gradient(135deg, #22d3ee, #0891b2)",
                    color: "#04121f",
                  }
                : { color: "#94a3b8" }
            }
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
