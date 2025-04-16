import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Check if we need to use the Neon adapter (for edge functions)
const useNeonAdapter = process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_URL_NON_POOLING

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    if (useNeonAdapter) {
      // For edge functions, use the Neon adapter
      const adapter = new PrismaNeon({
        connectionString: process.env.POSTGRES_PRISMA_URL!,
      })
      return new PrismaClient({ adapter })
    }
    // For regular environments
    return new PrismaClient()
  })()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
