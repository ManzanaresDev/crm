// app/dashboard/deals/actions.ts
"use server";

import { db } from "@/lib/database";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createDeal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  await db.deal.create({
    data: {
      title: formData.get("title") as string,
      amount: parseFloat(formData.get("amount") as string) || 0,
      contactId: formData.get("contactId") as string,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/deals");
}

export async function moveDealStage(
  dealId: string,
  stage: "NOUVEAU" | "EN_COURS" | "GAGNE" | "PERDU",
) {
  const deal = await db.deal.update({
    where: { id: dealId },
    data: { stage },
  });

  // Log automatique dans le fil d'activité
  await db.activity.create({
    data: {
      type: "CHANGEMENT_STAGE",
      content: `Deal "${deal.title}" déplacé vers ${stage}`,
      dealId: deal.id,
      contactId: deal.contactId,
      ownerId: deal.ownerId,
    },
  });

  revalidatePath("/deals");
}
