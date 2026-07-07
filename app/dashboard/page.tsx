// app/dashboard/page.tsx
import { db } from "@/lib/database";
import { requireSession } from "@/lib/require-session";
import { StatCard } from "@/components/ui/StartCard";
import { Users, Target, Trophy, Wallet, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireSession();
  const ownerId = session.user.id;

  const [totalContacts, totalDeals, dealsWon, revenue, tachesEnRetard] =
    await Promise.all([
      db.contact.count({ where: { ownerId } }),
      db.deal.count({ where: { ownerId } }),
      db.deal.count({ where: { ownerId, stage: "GAGNE" } }),
      db.deal.aggregate({
        where: { ownerId, stage: "GAGNE" },
        _sum: { amount: true },
      }),
      db.task.count({
        where: { ownerId, done: false, dueDate: { lt: new Date() } },
      }),
    ]);

  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(revenue._sum.amount ?? 0));

  const cards = [
    { label: "Contacts", value: totalContacts, icon: Users, accent: "#22d3ee" },
    {
      label: "Opportunités",
      value: totalDeals,
      icon: Target,
      accent: "#a78bfa",
    },
    { label: "Deals gagnés", value: dealsWon, icon: Trophy, accent: "#34d399" },
    {
      label: "Revenu généré",
      value: formatted,
      icon: Wallet,
      accent: "#fbbf24",
    },
    {
      label: "Relances en retard",
      value: tachesEnRetard,
      icon: AlertTriangle,
      accent: "#fb7185",
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
