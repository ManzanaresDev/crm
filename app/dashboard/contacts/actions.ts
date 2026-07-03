// app/dashboard/contacts/actions.ts
"use server";

import { db } from "@/lib/database";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createContact(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  await db.contact.create({
    data: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/contacts");
}

export async function updateContactStatus(
  contactId: string,
  status: "LEAD" | "CLIENT" | "INACTIF",
) {
  await db.contact.update({
    where: { id: contactId },
    data: { status },
  });
  revalidatePath("/contacts");
}

export async function deleteContact(contactId: string) {
  await db.contact.delete({ where: { id: contactId } });
  revalidatePath("/contacts");
}
