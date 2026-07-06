// components/ui/PageHeader.tsx
import { MobileNav } from "./MobileNav";
import { NavGrid } from "./NavGrid";

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="text-2xl font-bold text-slate-50 md:text-3xl">
          {title}
        </h1>
      </div>
      <div className="hidden md:block">
        <NavGrid />
      </div>
    </div>
  );
}
