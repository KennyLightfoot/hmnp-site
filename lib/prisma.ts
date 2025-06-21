/**
 * @deprecated Use lib/prisma-singleton.ts instead
 * This file is kept for backwards compatibility during migration
 */

// Re-export from the new singleton
export { prisma, disconnectPrisma, prismaHealthCheck } from './prisma-singleton';
