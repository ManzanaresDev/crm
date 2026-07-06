// component/ui/MobileNav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, Briefcase, Calendar, CheckSquare } from "lucide-react";

const navItems = [
  { label: "Contacts", href: "/dashboard/contacts", icon: User },
  { label: "Deals", href: "/dashboard/deals", icon: Briefcase },
  { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { label: "Tâches", href: "/dashboard/taches", icon: CheckSquare },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500/25 text-slate-100"
      >
        <Menu size={22} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 p-6"
            style={{
              background: "rgba(10, 22, 40, 0.78)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="mb-8 flex h-9 w-9 items-center justify-center rounded-lg text-slate-300"
            >
              <X size={20} />
            </button>

            <ul className="flex flex-col gap-1">
              {navItems.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-100 transition-colors hover:bg-white/10"
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
