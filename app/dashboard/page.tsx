// app/dashboard/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  // Vérifie la session
  const session = await auth();

  // Vérifie l'authentification
  if (!session) {
    redirect("/login");
  }

  // Vérifie que l'utilisateur est autorisé
  if (session.user?.email !== process.env.ALLOWED_EMAIL) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Connecté en tant que {session.user?.email}
          </p>
        </div>

        <SignOutButton />
      </header>

      <section className="mx-auto max-w-6xl p-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Bienvenue 👋</h2>
          <p className="text-gray-600">
            Vous êtes connecté et autorisé à accéder au tableau de bord.
          </p>
        </div>
      </section>
    </main>
  );
}
