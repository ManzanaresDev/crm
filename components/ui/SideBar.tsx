// components/ui/SideBar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
  { label: "Deals", href: "/dashboard/deals", icon: Briefcase },
  { label: "Agenda", href: "/dashboard/appointments", icon: Calendar },
  { label: "Tâches", href: "/dashboard/tasks", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 bg-[#0b1220]/85 border-r border-white/5 px-4 py-6">
      <div className="mb-10 px-2">
        <Link href="/dashboard" className="mb-10 px-2">
          <Image
            src="/images/logo_crm.jpg"
            alt="Logo CRM"
            width={110}
            height={72}
            priority
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
