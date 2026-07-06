// app/dashboard/appointments/status-styles.ts
export const STATUS_STYLES: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  PLANIFIE: {
    label: "Planifié",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.14)",
    border: "rgba(34,211,238,0.3)",
  },
  CONFIRME: {
    label: "Confirmé",
    color: "#34d399",
    bg: "rgba(52,211,153,0.14)",
    border: "rgba(52,211,153,0.3)",
  },
  ANNULE: {
    label: "Annulé",
    color: "#fb7185",
    bg: "rgba(251,113,133,0.14)",
    border: "rgba(251,113,133,0.3)",
  },
  TERMINE: {
    label: "Terminé",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.14)",
    border: "rgba(148,163,184,0.3)",
  },
};

export function statusStyle(status: string) {
  return (
    STATUS_STYLES[status] ?? {
      label: status,
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.14)",
      border: "rgba(148,163,184,0.3)",
    }
  );
}
