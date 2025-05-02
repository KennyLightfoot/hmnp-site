import { PrismaClient } from "@prisma/client"

/**
 * Singleton Prisma client for use in both Edge & Node runtimes.
 * Prevents exhausting database connections in Next.js hot-reload.
 */
// @ts-ignore
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
