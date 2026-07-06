// components/ActivityTimeline.tsx
"use client";

type TimelineItem = {
  kind: "activity" | "task" | "appointment" | "email";
  date: Date;
  data: any;
};

const ICONS: Record<string, string> = {
  activity: "📝",
  task: "✅",
  appointment: "📅",
  email: "✉️",
};

const LABELS: Record<string, string> = {
  activity: "Activité",
  task: "Tâche",
  appointment: "Rendez-vous",
  email: "Email",
};

export function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 bg-white shadow-sm flex gap-3"
        >
          <div className="text-2xl">{ICONS[item.kind]}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-gray-400 uppercase">
                {LABELS[item.kind]}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(item.date).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className="text-sm mt-1">
              {item.data.content ?? item.data.title ?? item.data.subject}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
