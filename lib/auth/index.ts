import { getServerSession, type NextAuthOptions } from "next-auth"
import { prisma } from "../db" // keep prisma handy for potential future use

// Import the shared Next-Auth configuration
import { authOptions } from "@/lib/auth-config"

// Re-export for convenience so existing imports continue to work
export { authOptions }

// Helper: grab the current session on the server
export async function getSession() {
  return getServerSession(authOptions as NextAuthOptions)
}

// Helper: typed current user (null if unauthenticated)
export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}

// Helper: boolean auth check
export async function isAuthenticated() {
  return Boolean(await getSession())
}

// Re-export sign-in/out helpers for the client side
export { signIn, signOut } from "next-auth/react" 