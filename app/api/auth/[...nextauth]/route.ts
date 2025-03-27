import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GoHighLevelProvider from "../providers/gohighlevel";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GoHighLevelProvider({
      clientId: process.env.GHL_CLIENT_ID || "",
      clientSecret: process.env.GHL_CLIENT_SECRET || "",
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.profile = profile;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.provider = token.provider;
        session.profile = token.profile;
        session.expiresAt = token.expiresAt;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("Sign in event:", { user, account, profile });
    },
    async signOut({ session, token }) {
      console.log("Sign out event:", { session, token });
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// This is required for handling the callback
export const runtime = "nodejs"; 