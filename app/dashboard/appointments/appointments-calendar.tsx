// app/appointments/appointments-calendar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  format,
  isSameDay,
  isToday,
  differenceInMinutes,
  startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { statusStyle } from "./status-styles";

type AppointmentEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  location: string | null;
};

const HOUR_HEIGHT = 56; // px par heure
const SCROLL_TO_HOUR = 7; // heure affichée en haut du scroll au chargement
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function weekDays(reference: Date) {
  const start = startOfWeek(reference, { locale: fr });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function AppointmentsCalendar({
  events,
}: {
  events: AppointmentEvent[];
}) {
  const [reference, setReference] = useState(() => new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = useState(() => new Date())[0];

  const days = useMemo(() => weekDays(reference), [reference]);

  const rangeLabel = useMemo(() => {
    const start = days[0];
    const end = days[6];
    const sameMonth = start.getMonth() === end.getMonth();
    return sameMonth
      ? `${format(start, "d", { locale: fr })} – ${format(end, "d MMMM yyyy", { locale: fr })}`
      : `${format(start, "d MMM", { locale: fr })} – ${format(end, "d MMM yyyy", { locale: fr })}`;
  }, [days]);

  const eventsByDay = useMemo(() => {
    const map = new Map<
      string,
      (AppointmentEvent & { startDate: Date; endDate: Date })[]
    >();
    for (const day of days) map.set(day.toDateString(), []);
    for (const e of events) {
      const startDate = new Date(e.start);
      const endDate = new Date(e.end);
      const key = days.find((d) => isSameDay(d, startDate))?.toDateString();
      if (key) map.get(key)!.push({ ...e, startDate, endDate });
    }
    return map;
  }, [events, days]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: SCROLL_TO_HOUR * HOUR_HEIGHT });
  }, []);

  const currentMinutes = differenceInMinutes(now, startOfDay(now));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReference(new Date())}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(226,232,240,0.16)" }}
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setReference((d) => subWeeks(d, 1))}
            aria-label="Semaine précédente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(226,232,240,0.16)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setReference((d) => addWeeks(d, 1))}
            aria-label="Semaine suivante"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(226,232,240,0.16)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <p className="text-sm font-semibold capitalize text-slate-100">
          {rangeLabel}
        </p>
      </div>

      <div
        className="overflow-x-auto rounded-xl"
        style={{
          border: "1px solid rgba(226,232,240,0.14)",
          background: "rgba(226,232,240,0.03)",
        }}
      >
        <div style={{ minWidth: 760 }}>
          {/* En-têtes des jours */}
          <div
            className="grid"
            style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
          >
            <div />
            {days.map((day) => {
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className="border-l px-2 py-3 text-center"
                  style={{
                    borderColor: "rgba(226,232,240,0.1)",
                    background: today ? "rgba(34,211,238,0.08)" : "transparent",
                  }}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {format(day, "EEE", { locale: fr })}
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: today ? "#22d3ee" : "#e2e8f0" }}
                  >
                    {format(day, "d MMM", { locale: fr })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Grille horaire scrollable */}
          <div
            ref={scrollRef}
            className="overflow-y-auto"
            style={{ height: "65vh" }}
          >
            <div
              className="relative grid"
              style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
            >
              <div>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="pr-2 text-right text-xs text-slate-500"
                    style={{
                      height: HOUR_HEIGHT,
                      borderTop: "1px solid rgba(226,232,240,0.08)",
                    }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {days.map((day) => {
                const dayEvents = eventsByDay.get(day.toDateString()) ?? [];
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className="relative border-l"
                    style={{
                      borderColor: "rgba(226,232,240,0.1)",
                      background: today
                        ? "rgba(34,211,238,0.03)"
                        : "transparent",
                    }}
                  >
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        style={{
                          height: HOUR_HEIGHT,
                          borderTop: "1px solid rgba(226,232,240,0.08)",
                        }}
                      />
                    ))}

                    {today && (
                      <div
                        className="absolute left-0 right-0 z-10"
                        style={{
                          top: (currentMinutes / 60) * HOUR_HEIGHT,
                          height: 2,
                          background: "#fb7185",
                          boxShadow: "0 0 6px #fb7185",
                        }}
                      />
                    )}

                    {dayEvents.map((event) => {
                      const dayStart = startOfDay(event.startDate);
                      const startMinutes = differenceInMinutes(
                        event.startDate,
                        dayStart,
                      );
                      const durationMinutes = Math.max(
                        differenceInMinutes(event.endDate, event.startDate),
                        20,
                      );
                      const top = (startMinutes / 60) * HOUR_HEIGHT;
                      const height = Math.max(
                        (durationMinutes / 60) * HOUR_HEIGHT,
                        22,
                      );
                      const style = statusStyle(event.status);

                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 overflow-hidden rounded-md px-2 py-1 text-xs"
                          style={{
                            top,
                            height,
                            background: style.bg,
                            borderLeft: `3px solid ${style.color}`,
                          }}
                          title={
                            event.location
                              ? `${event.title} · ${event.location}`
                              : event.title
                          }
                        >
                          <p className="truncate font-semibold text-slate-100">
                            {event.title}
                          </p>
                          <p
                            className="truncate"
                            style={{ color: style.color }}
                          >
                            {format(event.startDate, "HH:mm")} –{" "}
                            {format(event.endDate, "HH:mm")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
