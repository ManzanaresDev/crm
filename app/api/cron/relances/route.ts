// app/api/cron/relances/route.ts
import { db } from "@/lib/database";
import { NextResponse } from "next/server";
// import { requireApiSession } from "@/lib/api-auth";

export async function GET(req: Request) {
  // vérification de session
  // const authResult = await requireApiSession();
  // if ("error" in authResult) {
  //   return authResult.error;
  // }
  // const { session } = authResult;

  // Sécurise l'endpoint avec un secret partagé
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const seuil = new Date();
  seuil.setDate(seuil.getDate() - 30);

  const contactsInactifs = await db.contact.findMany({
    where: {
      status: "CLIENT",
      activities: { none: { createdAt: { gte: seuil } } },
    },
  });

  for (const contact of contactsInactifs) {
    await db.task.create({
      data: {
        title: `Relancer ${contact.firstName} ${contact.lastName}`,
        dueDate: new Date(),
        type: "RELANCE",
        contactId: contact.id,
        ownerId: contact.ownerId,
      },
    });
  }

  return NextResponse.json({ created: contactsInactifs.length });
}
