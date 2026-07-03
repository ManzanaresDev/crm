// src/app/dashboard/page.tsx
import { db } from "@/lib/database";
import { requireSession } from "@/lib/require-session";
import Link from "next/link";

const DEAL_STAGE_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  GAGNE: "Gagné",
  PERDU: "Perdu",
};

const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  PLANIFIE: "bg-blue-100 text-blue-700",
  CONFIRME: "bg-green-100 text-green-700",
  ANNULE: "bg-red-100 text-red-700",
  TERMINE: "bg-gray-100 text-gray-600",
};

const CONTACT_STATUS_STYLES: Record<string, string> = {
  LEAD: "bg-yellow-100 text-yellow-700",
  CLIENT: "bg-green-100 text-green-700",
  INACTIF: "bg-gray-100 text-gray-600",
};

export default async function DashboardPage() {
  const session = await requireSession();
  const ownerId = session.user.id;
  const now = new Date();

  const [
    totalContacts,
    totalDeals,
    dealsWon,
    revenue,
    tasksOverdue,
    recentContacts,
    pipelineDeals,
    upcomingAppointments,
    pendingTasks,
  ] = await Promise.all([
    db.contact.count({ where: { ownerId } }),
    db.deal.count({ where: { ownerId } }),
    db.deal.count({ where: { ownerId, stage: "GAGNE" } }),
    db.deal.aggregate({
      where: { ownerId, stage: "GAGNE" },
      _sum: { amount: true },
    }),
    db.task.count({
      where: { ownerId, done: false, dueDate: { lt: now } },
    }),
    db.contact.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.deal.findMany({
      where: { ownerId, stage: { in: ["NOUVEAU", "EN_COURS"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { contact: true },
    }),
    db.appointment.findMany({
      where: { ownerId, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: { contact: true },
    }),
    db.task.findMany({
      where: { ownerId, done: false },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { contact: true },
    }),
  ]);

  const formattedRevenue = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(revenue._sum.amount ?? 0));

  const cards = [
    { label: "Contacts", value: totalContacts, href: "/contacts" },
    { label: "Opportunités", value: totalDeals, href: "/deals" },
    { label: "Deals gagnés", value: dealsWon, href: "/deals" },
    { label: "Revenu généré", value: formattedRevenue, href: "/deals" },
    {
      label: "Relances en retard",
      value: tasksOverdue,
      href: "/tasks",
      alert: tasksOverdue > 0,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`border rounded p-4 hover:shadow-sm transition-shadow ${
              c.alert ? "border-red-300 bg-red-50" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-500">{c.label}</p>
            <p
              className={`text-2xl font-bold ${c.alert ? "text-red-600" : ""}`}
            >
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts récents */}
        <section className="border rounded p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Contacts récents</h2>
            <Link
              href="/dashboard/contacts"
              className="text-sm text-blue-600 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun contact pour l&apos;instant.
            </p>
          ) : (
            <div className="space-y-2">
              {recentContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-gray-500">{c.company}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      CONTACT_STATUS_STYLES[c.status] ?? "bg-gray-100"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pipeline en cours */}
        <section className="border rounded p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Opportunités en cours</h2>
            <Link
              href="/dashboard/deals"
              className="text-sm text-blue-600 hover:underline"
            >
              Voir le pipeline
            </Link>
          </div>
          {pipelineDeals.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune opportunité active.</p>
          ) : (
            <div className="space-y-2">
              {pipelineDeals.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-gray-500">
                      {d.contact.firstName} {d.contact.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {Number(d.amount).toLocaleString("fr-FR")} €
                    </p>
                    <p className="text-xs text-gray-400">
                      {DEAL_STAGE_LABELS[d.stage] ?? d.stage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Prochains rendez-vous */}
        <section className="border rounded p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Prochains rendez-vous</h2>
            <Link
              href="/dashboard/appointments"
              className="text-sm text-blue-600 hover:underline"
            >
              Voir l&apos;agenda
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun rendez-vous à venir.</p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-gray-500">
                      {new Date(a.startsAt).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {a.contact &&
                        ` · ${a.contact.firstName} ${a.contact.lastName}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      APPOINTMENT_STATUS_STYLES[a.status] ?? "bg-gray-100"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tâches à faire */}
        <section className="border rounded p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Tâches à faire</h2>
            <Link
              href="/dashboard/tasks"
              className="text-sm text-blue-600 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune tâche en attente 🎉</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((t) => {
                const isLate = t.dueDate < now;
                return (
                  <div
                    key={t.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-gray-500">
                        {t.contact &&
                          `${t.contact.firstName} ${t.contact.lastName} · `}
                        {t.type}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isLate
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
