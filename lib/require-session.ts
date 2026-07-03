// lib/require-session.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

/**
 * À utiliser dans les Server Components (pages, layouts).
 * Redirige vers /login si pas de session, sinon retourne la session typée.
 */
export async function requireSession(): Promise<
  Session & { user: { id: string } }
> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session as Session & { user: { id: string } };
}
