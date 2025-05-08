import NextAuth, { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { Resend } from "resend"
import bcrypt from "bcrypt"

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
