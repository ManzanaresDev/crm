import { db } from "@/lib/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createContact } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { contactStatusStyle } from "./status-styles";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const contacts = await db.contact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-6 md:p-10">
      <PageHeader title="Contacts" />

      <form
        action={createContact}
        className="glass-panel mb-8 flex flex-wrap gap-3 p-5"
      >
        <input
          name="firstName"
          placeholder="Prénom"
          required
          className="glass-input min-w-[140px] flex-1"
        />
        <input
          name="lastName"
          placeholder="Nom"
          required
          className="glass-input min-w-[140px] flex-1"
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="glass-input min-w-[160px] flex-1"
        />
        <input
          name="phone"
          placeholder="Téléphone"
          className="glass-input min-w-[140px]"
        />
        <input
          name="company"
          placeholder="Entreprise"
          className="glass-input min-w-[160px] flex-1"
        />
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="grid gap-3">
        {contacts.map((c) => {
          const status = contactStatusStyle(c.status);
          return (
            <Link
              key={c.id}
              href={`/dashboard/contacts/${c.id}`}
              className="flex items-center justify-between gap-4 rounded-xl p-4 transition-transform hover:-translate-y-0.5"
              style={{
                background: "rgba(226,232,240,0.06)",
                border: "1px solid rgba(226,232,240,0.14)",
                borderLeft: `3px solid ${status.color}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(34,211,238,0.14)",
                    color: "#22d3ee",
                  }}
                >
                  {c.firstName?.[0]}
                  {c.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-sm text-slate-400">
                    {[c.email, c.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              <span
                className="chip shrink-0"
                style={
                  {
                    "--chip-bg": status.bg,
                    "--chip-color": status.color,
                    "--chip-border": status.border,
                  } as React.CSSProperties
                }
              >
                {status.label}
              </span>
            </Link>
          );
        })}

        {contacts.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Aucun contact pour l&apos;instant.
          </p>
        )}
      </div>
    </div>
  );
}
