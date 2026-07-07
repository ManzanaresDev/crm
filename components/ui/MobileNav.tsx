"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
  { label: "Opportunités", href: "/dashboard/deals", icon: Briefcase },
  { label: "Agenda", href: "/dashboard/appointments", icon: Calendar },
  { label: "Tâches", href: "/dashboard/tasks", icon: CheckSquare },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full border border-slate-500/60 text-slate-300 hover:border-slate-300 hover:bg-white/5 transition-colors"
        aria-label="Ouvrir le menu"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#0b1220]">
          <div className="flex justify-end p-4">
            <button onClick={() => setOpen(false)} aria-label="Fermer">
              <X className="h-6 w-6 text-slate-300" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-4 text-xl font-medium text-slate-200 hover:bg-white/5"
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
