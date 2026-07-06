// app/dashboard/contacts/status-styles.ts
export const CONTACT_STATUS_STYLES: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  LEAD: {
    label: "Lead",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.14)",
    border: "rgba(251,191,36,0.3)",
  },
  CLIENT: {
    label: "Client",
    color: "#34d399",
    bg: "rgba(52,211,153,0.14)",
    border: "rgba(52,211,153,0.3)",
  },
  INACTIF: {
    label: "Inactif",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.14)",
    border: "rgba(148,163,184,0.3)",
  },
};

export function contactStatusStyle(status: string) {
  return (
    CONTACT_STATUS_STYLES[status] ?? {
      label: status,
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.14)",
      border: "rgba(148,163,184,0.3)",
    }
  );
}
