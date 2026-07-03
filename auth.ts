// src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/database";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Restreint l'accès à un seul email si ALLOWED_EMAIL est défini
      if (ALLOWED_EMAIL && user.email !== ALLOWED_EMAIL) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id; // au moment du login
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
