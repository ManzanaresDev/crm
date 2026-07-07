// app/dashboard/deals/page.tsx
import { db } from "@/lib/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";

const STAGES = [
  { key: "NOUVEAU", label: "Nouveau", accent: "#22d3ee" },
  { key: "EN_COURS", label: "En cours", accent: "#a78bfa" },
  { key: "GAGNE", label: "Gagné", accent: "#34d399" },
  { key: "PERDU", label: "Perdu", accent: "#fb7185" },
] as const;

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const deals = await db.deal.findMany({
    where: { ownerId: session.user.id },
    include: { contact: true },
  });

  return (
    <div className="min-h-screen p-6 md:p-10">
      <PageHeader title="Opportunités" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          return (
            <div key={stage.key} className="glass-panel p-4">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: stage.accent,
                    boxShadow: `0 0 8px ${stage.accent}`,
                  }}
                />
                <h2 className="text-sm font-semibold text-slate-300">
                  {stage.label}
                </h2>
                <span className="ml-auto text-xs text-slate-500">
                  {stageDeals.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageDeals.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg border p-3 transition-transform hover:-translate-y-0.5"
                    style={{
                      background: "rgba(226,232,240,0.06)",
                      borderColor: "rgba(226,232,240,0.14)",
                      borderLeft: `3px solid ${stage.accent}`,
                    }}
                  >
                    <p className="font-medium text-slate-100">{d.title}</p>
                    <p className="text-sm text-slate-400">
                      {d.contact.firstName} {d.contact.lastName}
                    </p>
                    <p className="stat-value mt-1 text-sm font-semibold text-slate-50">
                      {Number(d.amount).toLocaleString("fr-FR")} €
                    </p>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <p className="text-xs text-slate-500">Aucun deal</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
