/**
 * Type shim to bridge @prisma/client to the actual generated Prisma client
 *
 * In Prisma 6.x, the @prisma/client package should automatically re-export
 * everything from the generated client. However, with pnpm's structure and
 * TypeScript's module resolution, we may need this shim to help resolve types.
 *
 * NOTE: Run `pnpm prisma:generate` to generate the Prisma client before using these types.
 * 
 * The generated client should be at node_modules/.prisma/client/index.d.ts
 * The tsconfig.json has a path mapping: ".prisma/client" -> "./node_modules/.prisma/client/index"
 * This shim uses that mapping to re-export everything.
 */

// Reference the generated Prisma client types
/// <reference path="../node_modules/.prisma/client/index.d.ts" />

declare module '@prisma/client' {
  // Re-export everything from the generated Prisma client
  // The '.prisma/client' path should be resolved via tsconfig.json paths mapping
  // However, module declarations may not respect path mappings, so we also have
  // a triple-slash reference above to help TypeScript find the types
  export * from '.prisma/client';
  
  // Explicitly export PrismaClient and Prisma namespace
  export { PrismaClient, Prisma } from '.prisma/client';
}

