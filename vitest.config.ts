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
    globalSetup: process.env.TEST_TYPE === 'integration' ? ['./tests/integration.global.ts'] : [],
    environment: 'jsdom', // Use jsdom for DOM simulation
    globals: true, // Optional: Use Vitest globals (describe, it, expect) without importing
    setupFiles: ['./tests/setupEnv.ts'], // Add the setup file here
    // Run all unit tests by default; add API tests when running integration suite
    include: [
      'tests/unit/**/*.test.ts',
      '__tests__/**/*.test.ts',
      ...(process.env.TEST_TYPE === 'integration' ? ['tests/api/**/*.test.ts'] : [])
    ],
    // Exclude quarantined legacy tests until they are refactored
    exclude: [
      '**/*.legacy.test.ts',
      // By default, skip API tests during unit runs; they'll be run via the integration script
      ...(process.env.TEST_TYPE === 'integration' ? [] : ['tests/api/**'])
    ],
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
      // Global coverage thresholds - targeting 70-80%+ coverage
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // Per-file thresholds for critical files
        // Note: lib/pricing-engine.ts is legacy (only used in tests) - no strict threshold
        'lib/booking-validation.ts': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'lib/slot-reservation.ts': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
  },
}); 