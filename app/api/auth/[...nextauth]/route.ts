import NextAuth, { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        const html = `<p>Click <a href="${url}">here</a> to sign in to HMNP Portal.</p>`
        try {
          if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set")
          }
          if (!process.env.FROM_EMAIL) {
            console.warn("FROM_EMAIL not provided – using default fallback")
          }
          await resend.emails.send({
            to: identifier,
            from: process.env.FROM_EMAIL || "notifications@houstonmobilenotarypros.com",
            subject: "Your HMNP login link",
            html,
          })
        } catch (err) {
          console.error("[Auth] Failed to send verification email", err)
          throw err
        }
      },
    }),
  ],
  // Use JWT strategy so middleware can read token without DB call
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in stores fields on token
      if (user) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore token is a generic Record
        token.role = (user as any).role
        // @ts-ignore
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore augment session
        session.user.role = token.role
        // @ts-ignore
        session.user.id = token.id
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
