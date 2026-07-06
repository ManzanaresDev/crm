// app/appointments/page.tsx
import { db } from "@/lib/database";
import { requireSession } from "@/lib/require-session";
import { AppointmentsView } from "./appointments-view";

export default async function AppointmentsPage() {
  const session = await requireSession();

  const appointments = await db.appointment.findMany({
    where: { ownerId: session.user.id },
    orderBy: { startsAt: "asc" },
    include: { contact: true, deal: true },
  });

  const events = appointments.map((a) => ({
    id: a.id,
    title: a.title,
    start: a.startsAt.toISOString(),
    end: a.endsAt.toISOString(),
    status: a.status,
    location: a.location,
    contactName: a.contact
      ? `${a.contact.firstName} ${a.contact.lastName}`
      : null,
    dealTitle: a.deal?.title ?? null,
  }));

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="glass-panel p-4">
        <AppointmentsView events={events} />
      </div>
    </div>
  );
}
