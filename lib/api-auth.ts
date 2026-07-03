// lib/api-auth.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type ApiAuthResult =
  | { session: Session & { user: { id: string } } }
  | { error: NextResponse };

/**
 * À utiliser dans les routes API (pas les pages).
 * Retourne soit la session valide, soit une NextResponse 401 prête à renvoyer.
 */
export async function requireApiSession(): Promise<ApiAuthResult> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }
  return { session: session as Session & { user: { id: string } } };
}
