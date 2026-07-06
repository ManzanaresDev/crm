"use client";

import type { AppointmentEvent } from "./appointments-view";
import { statusStyle } from "./status-styles";

export function AppointmentsList({ events }: { events: AppointmentEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Aucun rendez-vous pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((e) => {
        const status = statusStyle(e.status);
        return (
          <div
            key={e.id}
            className="flex items-center justify-between gap-4 rounded-xl p-4"
            style={{
              background: "rgba(226,232,240,0.06)",
              border: "1px solid rgba(226,232,240,0.14)",
              borderLeft: `3px solid ${status.color}`,
            }}
          >
            <div>
              <p className="font-semibold text-slate-100">{e.title}</p>
              <p className="text-sm text-slate-400">
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
                <p className="text-sm text-slate-400">{e.location}</p>
              )}
              {(e.contactName || e.dealTitle) && (
                <p className="mt-1 text-xs text-slate-500">
                  {[e.contactName, e.dealTitle].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            <span
              className="chip shrink-0"
              style={
                {
                  "--chip-bg": status.bg,
                  "--chip-color": status.color,
                  "--chip-border": status.border,
                } as React.CSSProperties
              }
            >
              {status.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
