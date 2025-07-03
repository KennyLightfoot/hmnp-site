import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(), // Must be before react()
    react(),
  ],
  test: {
    environment: 'jsdom', // Use jsdom for DOM simulation
    globals: true, // Optional: Use Vitest globals (describe, it, expect) without importing
    setupFiles: ['./tests/setupEnv.ts'], // Add the setup file here
    coverage: {
      provider: 'v8', // Use V8 for coverage
      reporter: ['text', 'json', 'html', 'lcov'], // Add lcov for CI
      include: ['app/**/*', 'components/**/*', 'lib/**/*'], 
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
      // Set coverage thresholds for critical booking modules
      thresholds: {
        'lib/pricing-engine.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'lib/booking-validation.ts': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'lib/slot-reservation.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
  },
}); 