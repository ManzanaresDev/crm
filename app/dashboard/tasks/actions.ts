// app/dashboard/tasks/actions.tsx
"use server";

import { db } from "@/lib/database";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  await db.task.create({
    data: {
      title: formData.get("title") as string,
      dueDate: new Date(formData.get("dueDate") as string),
      type: formData.get("type") as string as
        | "RELANCE"
        | "APPEL"
        | "EMAIL"
        | "AUTRE",
      contactId: (formData.get("contactId") as string) || null,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/tasks");
}

export async function toggleTaskDone(taskId: string, done: boolean) {
  await db.task.update({
    where: { id: taskId },
    data: { done, doneAt: done ? new Date() : null },
  });
  revalidatePath("/tasks");
}
