import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  plugins: [
    tsconfigPaths(), // Must be before react()
    react(),
  ],
  test: {
    environment: 'jsdom', // Use jsdom for DOM simulation
    globals: true, // Optional: Use Vitest globals (describe, it, expect) without importing
    setupFiles: ['./tests/setupEnv.ts'], // Add the setup file here
    // Run all unit tests; we rely on directory naming to scope
    include: ['tests/unit/**/*.test.ts', '__tests__/**/*.test.ts'],
    // Exclude quarantined legacy tests until they are refactored
    exclude: ['**/*.legacy.test.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['bullmq'],
        },
      },
    },
    coverage: {
      provider: 'v8', // Use V8 for coverage
      reporter: ['text', 'json', 'html', 'lcov'], // Add lcov for CI
      // Focus coverage measurement only on files with dedicated unit tests
      include: [
        'lib/pricing-engine.ts',
        'lib/slot-reservation.ts',
        'lib/booking-validation.ts',
      ],
      all: false,
      exclude: [ 
        'app/api/auth/**/*',
        '**/*.config.ts',
        '**/*.config.js',
        '.next/**/*',
        'node_modules/**/*',
        'prisma/**/*',
        'coverage/**/*',
        'tests/**/*',
        '*.d.ts',
        'app/**/layout.tsx',
        'app/**/page.tsx',
        'app/**/not-found.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
      ],
      // Global reasonable thresholds – we'll raise these as coverage improves
      thresholds: {
        global: {
          branches: 20,
          functions: 20,
          lines: 20,
          statements: 20,
        },
      },
    },
  },
}); 