// lib/activity.ts
// import { db } from "@/lib/database";

// export async function getContactTimeline(contactId: string) {
//   const [activities, tasks, appointments, emails] = await Promise.all([
//     db.activity.findMany({ where: { contactId } }),
//     db.task.findMany({ where: { contactId } }),
//     db.appointment.findMany({ where: { contactId } }),
//     db.emailLog.findMany({ where: { contactId } }),
//   ]);

//   const timeline = [
//     ...activities.map((a) => ({
//       kind: "activity" as const,
//       date: a.createdAt,
//       data: a,
//     })),
//     ...tasks.map((t) => ({
//       kind: "task" as const,
//       date: t.createdAt,
//       data: t,
//     })),
//     ...appointments.map((ap) => ({
//       kind: "appointment" as const,
//       date: ap.createdAt,
//       data: ap,
//     })),
//     ...emails.map((e) => ({
//       kind: "email" as const,
//       date: e.createdAt,
//       data: e,
//     })),
//   ];

//   return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
// }

import { db } from "@/lib/database";

export async function getContactTimeline(contactId: string) {
  const [activities, tasks, appointments, emails] = await Promise.all([
    db.activity.findMany({ where: { contactId } }),
    db.task.findMany({ where: { contactId } }),
    db.activity.findMany({ where: { contactId } }),
    db.appointment.findMany({ where: { contactId } }),
    db.emailLog.findMany({ where: { contactId } }),
  ]);

  const timeline = [
    ...activities.map((a) => ({
      kind: "activity" as const,
      date: a.createdAt,
      data: a,
    })),
    ...tasks.map((t) => ({
      kind: "task" as const,
      date: t.createdAt,
      data: t,
    })),
    ...appointments.map((ap) => ({
      kind: "appointment" as const,
      date: ap.createdAt,
      data: ap,
    })),
    ...emails.map((e) => ({
      kind: "email" as const,
      date: e.createdAt,
      data: e,
    })),
  ];
  return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
}
