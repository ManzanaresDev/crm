// app/dashboard/contacts/[id]/page.tsx
"use server";
import { getContactTimeline } from "@/lib/activity";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { db } from "@/lib/database";
import { PageHeader } from "@/components/ui/PageHeader";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
  const { id } = await params;
  const contact = await db.contact.findUnique({ where: { id } });
  const timeline = await getContactTimeline(id);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <PageHeader
        title={contact ? `${contact.firstName} ${contact.lastName}` : "Contact"}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-panel p-5 lg:col-span-1">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold"
            style={{ background: "rgba(34,211,238,0.14)", color: "#22d3ee" }}
          >
            {contact?.firstName?.[0]}
            {contact?.lastName?.[0]}
          </div>
          <h2 className="text-lg font-semibold text-slate-100">
            {contact?.firstName} {contact?.lastName}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{contact?.email}</p>
          <p className="text-sm text-slate-400">{contact?.company}</p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            Fil d&apos;activité
          </h3>
          <div className="glass-panel p-5">
            <ActivityTimeline items={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
