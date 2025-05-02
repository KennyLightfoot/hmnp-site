import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        const html = `<p>Click <a href="${url}">here</a> to sign in to HMNP Portal.</p>`
        await resend.emails.send({
          to: identifier,
          from: process.env.FROM_EMAIL || "notifications@houstonmobilenotarypros.com",
          subject: "Your HMNP login link",
          html,
        })
      },
    }),
  ],
  // Use JWT strategy so middleware can read token without DB call
  session: {
    // @ts-ignore
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
