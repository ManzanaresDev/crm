// components/ui/PageHeader.tsx

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="relative mb-8 flex h-12 items-center justify-center">
      <h1 className="text-2xl font-bold text-slate-50 md:text-3xl">{title}</h1>
    </div>
  );
}
