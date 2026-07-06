// app/dashboard/tasks/page.tsx
import { db } from "@/lib/database";
import { requireSession } from "@/lib/require-session";
import { createTask, toggleTaskDone } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";

const TYPE_STYLES: Record<
  string,
  { label: string; bg: string; color: string; border: string }
> = {
  RELANCE: {
    label: "Relance",
    bg: "rgba(251,191,36,0.14)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
  },
  APPEL: {
    label: "Appel",
    bg: "rgba(34,211,238,0.14)",
    color: "#22d3ee",
    border: "rgba(34,211,238,0.3)",
  },
  EMAIL: {
    label: "Email",
    bg: "rgba(167,139,250,0.14)",
    color: "#a78bfa",
    border: "rgba(167,139,250,0.3)",
  },
  AUTRE: {
    label: "Autre",
    bg: "rgba(148,163,184,0.14)",
    color: "#94a3b8",
    border: "rgba(148,163,184,0.3)",
  },
};

export default async function TasksPage() {
  const session = await requireSession();

  const [tasks, contacts, deals] = await Promise.all([
    db.task.findMany({
      where: { ownerId: session.user.id },
      orderBy: { dueDate: "asc" },
      include: { contact: true, deal: true },
    }),
    db.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, firstName: true, lastName: true },
    }),
    db.deal.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <PageHeader title="Tâches" />

      <form
        action={createTask}
        className="glass-panel mb-8 flex flex-wrap gap-3 p-5"
      >
        <input
          name="title"
          placeholder="Titre"
          required
          className="glass-input min-w-[160px] flex-1"
        />
        <input name="dueDate" type="date" required className="glass-input" />
        <select name="type" className="glass-input" defaultValue="RELANCE">
          <option value="RELANCE">Relance</option>
          <option value="APPEL">Appel</option>
          <option value="EMAIL">Email</option>
          <option value="AUTRE">Autre</option>
        </select>
        <select name="contactId" className="glass-input">
          <option value="">— Contact —</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
        <select name="dealId" className="glass-input">
          <option value="">— Deal —</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="grid gap-3">
        {tasks.map((t) => {
          const isLate = !t.done && t.dueDate < new Date();
          const type = TYPE_STYLES[t.type] ?? TYPE_STYLES.AUTRE;

          return (
            <div
              key={t.id}
              className={`glass-panel flex items-center justify-between gap-4 p-4 ${
                t.done ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <form action={toggleTaskDone.bind(null, t.id, !t.done)}>
                  <button
                    type="submit"
                    aria-label={t.done ? "Marquer non fait" : "Marquer fait"}
                    className={`task-checkbox ${t.done ? "done" : ""}`}
                  >
                    {t.done && (
                      <span className="text-xs text-[#04121f]">✓</span>
                    )}
                  </button>
                </form>
                <div>
                  <p
                    className={`font-semibold text-slate-100 ${t.done ? "text-slate-500 line-through" : ""}`}
                  >
                    {t.title}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                    {t.contact &&
                      ` · ${t.contact.firstName} ${t.contact.lastName}`}
                    {t.deal && ` · ${t.deal.title}`}
                  </p>
                </div>
              </div>

              <span
                className="chip"
                style={
                  {
                    "--chip-bg": isLate ? "rgba(251,113,133,0.16)" : type.bg,
                    "--chip-color": isLate ? "#fb7185" : type.color,
                    "--chip-border": isLate
                      ? "rgba(251,113,133,0.35)"
                      : type.border,
                  } as React.CSSProperties
                }
              >
                {isLate ? "En retard" : type.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
