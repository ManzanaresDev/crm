// src/app/appointments/appointments-list.tsx
"use client";

import type { AppointmentEvent } from "./appointments-view";

const statusLabels: Record<string, string> = {
  PLANIFIE: "Planifié",
  CONFIRME: "Confirmé",
  ANNULE: "Annulé",
  TERMINE: "Terminé",
};

const statusStyles: Record<string, string> = {
  PLANIFIE: "bg-blue-100 text-blue-700",
  CONFIRME: "bg-green-100 text-green-700",
  ANNULE: "bg-red-100 text-red-700",
  TERMINE: "bg-gray-100 text-gray-600",
};

export function AppointmentsList({ events }: { events: AppointmentEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        Aucun rendez-vous pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((e) => (
        <div
          key={e.id}
          className="border rounded p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{e.title}</p>
            <p className="text-sm text-gray-500">
              {new Date(e.start).toLocaleString("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {" → "}
              {new Date(e.end).toLocaleTimeString("fr-FR", {
                timeStyle: "short",
              })}
            </p>
            {e.location && (
              <p className="text-sm text-gray-500">{e.location}</p>
            )}
            {(e.contactName || e.dealTitle) && (
              <p className="text-xs text-gray-400 mt-1">
                {[e.contactName, e.dealTitle].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${
              statusStyles[e.status] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {statusLabels[e.status] ?? e.status}
          </span>
        </div>
      ))}
    </div>
  );
}
