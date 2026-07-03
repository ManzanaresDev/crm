// app/dashboard/deals/page.tsx
import { db } from "@/lib/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const STAGES = ["NOUVEAU", "EN_COURS", "GAGNE", "PERDU"] as const;

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const deals = await db.deal.findMany({
    where: { ownerId: session.user.id },
    include: { contact: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pipeline</h1>
      <div className="grid grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-gray-50 rounded p-3">
            <h2 className="font-semibold mb-3 text-sm text-gray-600">
              {stage}
            </h2>
            <div className="space-y-2">
              {deals
                .filter((d) => d.stage === stage)
                .map((d) => (
                  <div
                    key={d.id}
                    className="bg-white border rounded p-3 shadow-sm"
                  >
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-gray-500">
                      {d.contact.firstName} {d.contact.lastName}
                    </p>
                    <p className="text-sm font-semibold">
                      {Number(d.amount).toLocaleString("fr-FR")} €
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
