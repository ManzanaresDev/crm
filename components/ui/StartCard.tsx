// component/ui/StatCards.tsx

import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: string;
};

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{ "--accent-color": accent } as React.CSSProperties}
    >
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="stat-value mt-1 text-2xl font-semibold text-slate-50">
        {value}
      </p>
    </div>
  );
}
