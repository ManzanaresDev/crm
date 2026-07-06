// components/ui/nNavGrid.tsx
"use client";
import Link from "next/link";

const nav_items = [
  { href: "/dashboard/contacts", label: "Contacts", emoji: "👤" },
  { href: "/dashboard/deals", label: "Deals", emoji: "💼" },
  { href: "/dashboard/appointments", label: "Agenda", emoji: "📅" },
  { href: "/dashboard/tasks", label: "Tâches", emoji: "✅" },
];

export function NavGrid() {
  return (
    <nav className="grid grid-cols-2 md:grid-cols3 md:grid-cols-5 gap-3">
      {nav_items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text sm font-medium text-gray-700 dark:text-gray-200"
        >
          <span>{item.emoji}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
