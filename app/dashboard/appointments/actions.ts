// app/api/appointments/actions.ts
"use server";

import { db } from "@/lib/database";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createAppointment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const appointment = await db.appointment.create({
    data: {
      title: formData.get("title") as string,
      startsAt: new Date(formData.get("startsAt") as string),
      endsAt: new Date(formData.get("endsAt") as string),
      location: formData.get("location") as string,
      contactId: (formData.get("contactId") as string) || null,
      ownerId: session.user.id,
    },
  });

  await db.activity.create({
    data: {
      type: "RENDEZ_VOUS",
      content: `Rendez-vous planifié : ${appointment.title}`,
      contactId: appointment.contactId,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/appointments");
}
