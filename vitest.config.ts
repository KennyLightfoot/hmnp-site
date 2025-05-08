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
      reporter: ['text', 'json', 'html'], // Coverage report formats
      include: ['app/**/*', 'components/**/*', 'lib/**/*'], // Adjust paths as needed
      exclude: [ // Exclude files/folders from coverage
        'app/api/auth/**/*',
        '**/*.config.ts',
        '**/*.config.js',
        '.next/**/*',
        'node_modules/**/*',
        'prisma/**/*',
        'coverage/**/*',
        'tests/**/*', // Exclude test files themselves
        '*.d.ts',
      ],
    },
  },
}); 