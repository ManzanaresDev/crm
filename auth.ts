// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, profile }) {
      // On vérifie l'email retourné par Google
      if (user.email === ALLOWED_EMAIL && profile?.email_verified === true) {
        return true;
      }
      //  Refuser la connexion
      return false;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
