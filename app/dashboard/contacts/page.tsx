// app/dashboard/contacts/page.tsx
import { db } from "@/lib/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createContact } from "./actions";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const contacts = await db.contact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>

      <form action={createContact} className="flex gap-2 mb-6">
        <input
          name="firstName"
          placeholder="Prénom"
          required
          className="border p-2 rounded"
        />
        <input
          name="lastName"
          placeholder="Nom"
          required
          className="border p-2 rounded"
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="border p-2 rounded"
        />
        <input
          name="phone"
          placeholder="Téléphone"
          className="border p-2 rounded"
        />
        <input
          name="company"
          placeholder="Entreprise"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>

      <div className="grid gap-3">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {c.firstName} {c.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {c.email} · {c.company}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-gray-100">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
