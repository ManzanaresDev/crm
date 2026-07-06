// app/dashboard/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/SideBar";
import { MobileNav } from "@/components/ui/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between md:hidden">
          <MobileNav />
        </div>

        {children}
      </div>
    </div>
  );
}
