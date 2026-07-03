// app/dashboard/tasks/page.tsx
import { db } from "@/lib/database";
import { requireSession } from "@/lib/require-session";
import { createTask, toggleTaskDone } from "./actions";

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

  const typeLabels: Record<string, string> = {
    RELANCE: "Relance",
    APPEL: "Appel",
    EMAIL: "Email",
    AUTRE: "Autre",
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tâches</h1>

      <form action={createTask} className="flex flex-wrap gap-2 mb-6">
        <input
          name="title"
          placeholder="Titre"
          required
          className="border p-2 rounded"
        />
        <input
          name="dueDate"
          type="date"
          required
          className="border p-2 rounded"
        />
        <select
          name="type"
          className="border p-2 rounded"
          defaultValue="RELANCE"
        >
          <option value="RELANCE">Relance</option>
          <option value="APPEL">Appel</option>
          <option value="EMAIL">Email</option>
          <option value="AUTRE">Autre</option>
        </select>
        <select name="contactId" className="border p-2 rounded">
          <option value="">— Contact —</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
        <select name="dealId" className="border p-2 rounded">
          <option value="">— Deal —</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>

      <div className="grid gap-3">
        {tasks.map((t) => {
          const isLate = !t.done && t.dueDate < new Date();
          return (
            <div
              key={t.id}
              className={`border rounded p-4 flex justify-between items-center ${
                t.done ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <form action={toggleTaskDone.bind(null, t.id, !t.done)}>
                  <button
                    type="submit"
                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center text-xs ${
                      t.done
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {t.done ? "✓" : ""}
                  </button>
                </form>
                <div>
                  <p
                    className={`font-semibold ${t.done ? "line-through" : ""}`}
                  >
                    {t.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                    {t.contact &&
                      ` · ${t.contact.firstName} ${t.contact.lastName}`}
                    {t.deal && ` · ${t.deal.title}`}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isLate
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {typeLabels[t.type] ?? t.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
