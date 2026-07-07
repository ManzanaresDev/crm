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
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { statusStyle } from "./status-styles";
import type { AppointmentEvent } from "./appointments-view";

const HOUR_HEIGHT = 60; // px par heure (grille desktop)
const MOBILE_HOUR_HEIGHT = 52; // px par heure (grille mobile, plus dense)
const SCROLL_TO_HOUR = 7; // heure affichée en haut du scroll au chargement
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BRAND_GRADIENT = "linear-gradient(135deg, #22d3ee, #0891b2)";
const BUSINESS_START = 8; // début de plage "heures de bureau" (ombrage léger)
const BUSINESS_END = 19; // fin de plage "heures de bureau"

function weekDays(reference: Date) {
  const start = startOfWeek(reference, { locale: fr });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

type EnrichedEvent = AppointmentEvent & { startDate: Date; endDate: Date };

export function AppointmentsCalendar({
  events,
}: {
  events: AppointmentEvent[];
}) {
  const [reference, setReference] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [showFullDay, setShowFullDay] = useState(false);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileGridWrapRef = useRef<HTMLDivElement>(null);
  const [mobileGridHeight, setMobileGridHeight] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const days = useMemo(() => weekDays(reference), [reference]);

  // Jour sélectionné (mobile) : si la semaine affichée ne contient plus le
  // jour choisi (ex. navigation vers une autre semaine), on retombe sur
  // aujourd'hui si présent, sinon le premier jour de la semaine.
  // Calculé pendant le rendu plutôt que via un effet + setState, pour éviter
  // un rendu en cascade évitable.
  const effectiveSelectedDay = useMemo(() => {
    if (days.some((d) => isSameDay(d, selectedDay))) return selectedDay;
    return days.find((d) => isToday(d)) ?? days[0];
  }, [days, selectedDay]);

  // Ligne "maintenant" vivante, mise à jour chaque minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const rangeLabel = useMemo(() => {
    const start = days[0];
    const end = days[6];
    const sameMonth = start.getMonth() === end.getMonth();
    return sameMonth
      ? `${format(start, "d", { locale: fr })} – ${format(end, "d MMMM yyyy", { locale: fr })}`
      : `${format(start, "d MMM", { locale: fr })} – ${format(end, "d MMM yyyy", { locale: fr })}`;
  }, [days]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EnrichedEvent[]>();
    for (const day of days) map.set(day.toDateString(), []);
    for (const e of events) {
      const startDate = new Date(e.start);
      const endDate = new Date(e.end);
      const key = days.find((d) => isSameDay(d, startDate))?.toDateString();
      if (key) map.get(key)!.push({ ...e, startDate, endDate });
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }
    return map;
  }, [events, days]);

  const weekStatuses = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of events)
      if (!seen.has(e.status)) seen.set(e.status, e.status);
    return Array.from(seen.keys());
  }, [events]);

  // Rendez-vous du jour sélectionné (mobile)
  const mobileDayEvents = useMemo(
    () => eventsByDay.get(effectiveSelectedDay.toDateString()) ?? [],
    [eventsByDay, effectiveSelectedDay],
  );

  // Plage horaire condensée : on ne montre que les heures utiles
  // (1h de marge avant le premier RDV et après le dernier), pour éviter
  // de faire défiler des heures vides sur mobile. Repliable par l'utilisateur.
  const mobileHourRange = useMemo(() => {
    if (mobileDayEvents.length === 0) return { start: 0, end: 23 };
    let minHour = 23;
    let maxHour = 0;
    for (const e of mobileDayEvents) {
      const startH =
        differenceInMinutes(e.startDate, startOfDay(e.startDate)) / 60;
      const endH = differenceInMinutes(e.endDate, startOfDay(e.endDate)) / 60;
      minHour = Math.min(minHour, Math.floor(startH));
      maxHour = Math.max(maxHour, Math.ceil(endH));
    }
    return {
      start: Math.max(0, minHour - 1),
      end: Math.min(23, maxHour + 1),
    };
  }, [mobileDayEvents]);

  const isMobileCondensed =
    !showFullDay &&
    mobileDayEvents.length > 0 &&
    (mobileHourRange.start > 0 || mobileHourRange.end < 23);

  const mobileVisibleHours = isMobileCondensed
    ? HOURS.filter(
        (h) => h >= mobileHourRange.start && h <= mobileHourRange.end,
      )
    : HOURS;

  const hiddenHoursCount = 24 - mobileVisibleHours.length;

  // Réinitialise le mode "journée complète" à chaque changement de jour.
  // Ajusté pendant le rendu (comme effectiveSelectedDay plus haut) plutôt
  // que via useEffect + setState, qui déclenche un warning React
  // ("setState synchronously within an effect") et un rendu en cascade évitable.
  const [lastTrackedDay, setLastTrackedDay] = useState(effectiveSelectedDay);
  if (!isSameDay(lastTrackedDay, effectiveSelectedDay)) {
    setLastTrackedDay(effectiveSelectedDay);
    if (showFullDay) setShowFullDay(false);
  }

  useEffect(() => {
    desktopScrollRef.current?.scrollTo({ top: SCROLL_TO_HOUR * HOUR_HEIGHT });
  }, []);

  // Mesure la hauteur réellement disponible pour la grille mobile, afin de
  // répartir les heures visibles sur exactement cette hauteur : l'agenda
  // du jour tient toujours dans l'écran, sans scroll interne.
  useEffect(() => {
    const el = mobileGridWrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setMobileGridHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mobileHourHeight =
    mobileGridHeight > 0
      ? mobileGridHeight / mobileVisibleHours.length
      : MOBILE_HOUR_HEIGHT;

  const currentMinutes = differenceInMinutes(now, startOfDay(now));
  const currentHour = now.getHours();

  return (
    <div>
      <style jsx>{`
        @keyframes pulse-dot {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(251, 113, 133, 0.55);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(251, 113, 133, 0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .now-dot {
          animation: pulse-dot 2.2s ease-out infinite;
        }
        .week-fade {
          animation: fade-in 0.18s ease-out;
        }
        .event-card {
          transition:
            transform 0.14s ease,
            filter 0.14s ease,
            border-color 0.14s ease;
        }
        .event-card:hover {
          transform: translateY(-1px);
          filter: brightness(1.12);
        }
        .day-pill {
          transition:
            background 0.16s ease,
            color 0.16s ease,
            border-color 0.16s ease;
        }
        .nav-btn {
          transition:
            background 0.14s ease,
            border-color 0.14s ease,
            color 0.14s ease;
        }
        .cal-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .cal-scroll::-webkit-scrollbar-thumb {
          background: rgba(226, 232, 240, 0.16);
          border-radius: 999px;
        }
        .cal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        @media (prefers-reduced-motion: reduce) {
          .now-dot,
          .week-fade,
          .event-card,
          .day-pill,
          .nav-btn {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Barre d'en-tête */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReference(new Date());
              setSelectedDay(new Date());
            }}
            className="nav-btn rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10"
            style={{ border: "1px solid rgba(226,232,240,0.16)" }}
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setReference((d) => subWeeks(d, 1))}
            aria-label="Semaine précédente"
            className="nav-btn flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
            style={{ border: "1px solid rgba(226,232,240,0.16)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setReference((d) => addWeeks(d, 1))}
            aria-label="Semaine suivante"
            className="nav-btn flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
            style={{ border: "1px solid rgba(226,232,240,0.16)" }}
          >
            <ChevronRight size={16} />
          </button>
          <p className="ml-1 hidden text-sm font-semibold capitalize text-slate-100 sm:block">
            {rangeLabel}
          </p>
        </div>

        {/* Légende des statuts, desktop uniquement */}
        {weekStatuses.length > 0 && (
          <div className="hidden items-center gap-1.5 md:flex">
            {weekStatuses.map((s) => {
              const style = statusStyle(s);
              return (
                <span
                  key={s}
                  className="chip"
                  style={
                    {
                      "--chip-bg": style.bg,
                      "--chip-color": style.color,
                      "--chip-border": style.border,
                    } as React.CSSProperties
                  }
                >
                  {style.label}
                </span>
              );
            })}
          </div>
        )}

        <p className="text-sm font-semibold capitalize text-slate-100 sm:hidden">
          {rangeLabel}
        </p>
      </div>

      {/* ---------- DESKTOP : grille semaine ---------- */}
      <div
        key={rangeLabel}
        className="week-fade hidden overflow-hidden rounded-xl md:block"
        style={{
          border: "1px solid rgba(226,232,240,0.14)",
          background:
            "linear-gradient(180deg, rgba(226,232,240,0.045), rgba(226,232,240,0.02))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* En-têtes des jours */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "68px repeat(7, 1fr)" }}
        >
          <div style={{ borderBottom: "1px solid rgba(226,232,240,0.1)" }} />
          {days.map((day) => {
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className="border-l px-2 py-3 text-center"
                style={{
                  borderColor: "rgba(226,232,240,0.1)",
                  borderBottom: today
                    ? "2px solid #22d3ee"
                    : "1px solid rgba(226,232,240,0.1)",
                  background: today
                    ? "linear-gradient(180deg, rgba(34,211,238,0.12), rgba(34,211,238,0.02))"
                    : "transparent",
                }}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {format(day, "EEE", { locale: fr })}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: today ? "#67e8f9" : "#e2e8f0" }}
                >
                  {format(day, "d MMM", { locale: fr })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grille horaire scrollable */}
        <div
          ref={desktopScrollRef}
          className="cal-scroll overflow-y-auto"
          style={{ height: "65vh" }}
        >
          <div
            className="relative grid"
            style={{ gridTemplateColumns: "68px repeat(7, 1fr)" }}
          >
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="relative pr-2 text-right"
                  style={{
                    height: HOUR_HEIGHT,
                    borderTop: "1px solid rgba(226,232,240,0.08)",
                  }}
                >
                  <span
                    className="font-mono text-[11px]"
                    style={{
                      color: h === currentHour ? "#67e8f9" : "#64748b",
                      fontWeight: h === currentHour ? 700 : 400,
                    }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
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
                      ? "rgba(34,211,238,0.035)"
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
                      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                      style={{ top: (currentMinutes / 60) * HOUR_HEIGHT - 4 }}
                    >
                      <span
                        className="now-dot -ml-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: "#fb7185" }}
                      />
                      <span
                        className="h-[2px] flex-1"
                        style={{
                          background:
                            "linear-gradient(90deg, #fb7185, rgba(251,113,133,0.15))",
                        }}
                      />
                    </div>
                  )}

                  {dayEvents.map((event) => (
                    <EventBlock key={event.id} event={event} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------- MOBILE : sélecteur de jour + agenda ---------- */}
      <div className="md:hidden">
        <div
          className="cal-scroll mb-3 flex gap-1.5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {days.map((day) => {
            const active = isSameDay(day, effectiveSelectedDay);
            const today = isToday(day);
            const hasEvents =
              (eventsByDay.get(day.toDateString())?.length ?? 0) > 0;
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className="day-pill flex min-w-[52px] flex-col items-center gap-0.5 rounded-xl px-2 py-2"
                style={{
                  background: active
                    ? BRAND_GRADIENT
                    : "rgba(226,232,240,0.05)",
                  border: active
                    ? "1px solid transparent"
                    : today
                      ? "1px solid rgba(34,211,238,0.5)"
                      : "1px solid rgba(226,232,240,0.12)",
                }}
              >
                <span
                  className="text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: active ? "#04121f" : "#64748b" }}
                >
                  {format(day, "EEE", { locale: fr })}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: active ? "#04121f" : "#e2e8f0" }}
                >
                  {format(day, "d")}
                </span>
                <span
                  className="h-1 w-1 rounded-full"
                  style={{
                    background: hasEvents
                      ? active
                        ? "#04121f"
                        : "#22d3ee"
                      : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>

        <div
          key={effectiveSelectedDay.toDateString()}
          className="week-fade overflow-hidden rounded-xl"
          style={{
            border: "1px solid rgba(226,232,240,0.14)",
            background:
              "linear-gradient(180deg, rgba(226,232,240,0.045), rgba(226,232,240,0.02))",
          }}
        >
          <div
            className="flex items-center justify-between gap-2 px-3 py-2.5"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.1)" }}
          >
            <p className="text-sm font-semibold capitalize text-slate-100">
              {format(effectiveSelectedDay, "EEEE d MMMM", { locale: fr })}
            </p>
            <div className="flex items-center gap-1.5">
              {isToday(effectiveSelectedDay) && (
                <span
                  className="chip"
                  style={
                    {
                      "--chip-bg": "rgba(34,211,238,0.12)",
                      "--chip-color": "#67e8f9",
                      "--chip-border": "rgba(34,211,238,0.35)",
                    } as React.CSSProperties
                  }
                >
                  Aujourd&apos;hui
                </span>
              )}
              {mobileDayEvents.length > 0 &&
                (mobileHourRange.start > 0 || mobileHourRange.end < 23) && (
                  <button
                    onClick={() => setShowFullDay((v) => !v)}
                    className="nav-btn rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400"
                    style={{ border: "1px solid rgba(226,232,240,0.16)" }}
                  >
                    {isMobileCondensed ? `+${hiddenHoursCount}h` : "Réduire"}
                  </button>
                )}
            </div>
          </div>

          {mobileDayEvents.length === 0 ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <Clock size={14} />
              Aucun rendez-vous ce jour-là
            </p>
          ) : (
            <div
              ref={mobileGridWrapRef}
              style={{ height: "60vh", overflow: "hidden" }}
            >
              <div
                className="relative grid"
                style={{ gridTemplateColumns: "48px 1fr" }}
              >
                <div>
                  {mobileVisibleHours.map((h) => (
                    <div
                      key={h}
                      className="pr-2 text-right"
                      style={{
                        height: mobileHourHeight,
                        borderTop: "1px solid rgba(226,232,240,0.08)",
                      }}
                    >
                      <span
                        className="font-mono text-[10px]"
                        style={{
                          color: h === currentHour ? "#67e8f9" : "#64748b",
                          fontWeight: h === currentHour ? 700 : 400,
                        }}
                      >
                        {String(h).padStart(2, "0")}:00
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="relative border-l"
                  style={{ borderColor: "rgba(226,232,240,0.1)" }}
                >
                  {mobileVisibleHours.map((h) => {
                    const isBusinessHour =
                      h >= BUSINESS_START && h < BUSINESS_END;
                    return (
                      <div
                        key={h}
                        style={{
                          height: mobileHourHeight,
                          borderTop: "1px solid rgba(226,232,240,0.08)",
                          background: isBusinessHour
                            ? "rgba(226,232,240,0.018)"
                            : "transparent",
                        }}
                      />
                    );
                  })}

                  {isToday(effectiveSelectedDay) &&
                    mobileVisibleHours.includes(currentHour) && (
                      <div
                        className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                        style={{
                          top:
                            ((currentMinutes - mobileVisibleHours[0] * 60) /
                              60) *
                              mobileHourHeight -
                            4,
                        }}
                      >
                        <span
                          className="now-dot -ml-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: "#fb7185" }}
                        />
                        <span
                          className="h-[2px] flex-1"
                          style={{
                            background:
                              "linear-gradient(90deg, #fb7185, rgba(251,113,133,0.15))",
                          }}
                        />
                      </div>
                    )}

                  {mobileDayEvents.map((event) => (
                    <EventBlock
                      key={event.id}
                      event={event}
                      hourHeight={mobileHourHeight}
                      baseMinutes={mobileVisibleHours[0] * 60}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventBlock({
  event,
  hourHeight = HOUR_HEIGHT,
  baseMinutes = 0,
}: {
  event: EnrichedEvent;
  hourHeight?: number;
  baseMinutes?: number;
}) {
  const dayStart = startOfDay(event.startDate);
  const startMinutes = differenceInMinutes(event.startDate, dayStart);
  const durationMinutes = Math.max(
    differenceInMinutes(event.endDate, event.startDate),
    20,
  );
  const height = Math.max((durationMinutes / 60) * hourHeight, 26);
  const top = ((startMinutes - baseMinutes) / 60) * hourHeight;
  const style = statusStyle(event.status);
  const roomy = height >= 44;

  return (
    <div
      className="event-card absolute left-1 right-1 overflow-hidden rounded-lg px-2 py-1"
      style={{
        top,
        height,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderLeft: `3px solid ${style.color}`,
      }}
      title={
        event.location ? `${event.title} · ${event.location}` : event.title
      }
    >
      <p className="truncate text-xs font-semibold text-slate-100">
        {event.title}
      </p>
      <p
        className="truncate font-mono text-[10px]"
        style={{ color: style.color }}
      >
        {format(event.startDate, "HH:mm")} – {format(event.endDate, "HH:mm")}
      </p>
      {roomy && event.location && (
        <p className="truncate text-[10px] text-slate-400">{event.location}</p>
      )}
    </div>
  );
}
