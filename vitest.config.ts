import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.{test,spec}.{js,ts}', '__tests__/integration/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '__tests__/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
      // Note: Thresholds will be enforced after all packages are implemented
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 80,
      //   statements: 80,
      // },
    },
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@natural-js/shared': resolve(__dirname, './packages/shared/src'),
      '@natural-js/core': resolve(__dirname, './packages/core/src'),
      '@natural-js/architecture': resolve(__dirname, './packages/architecture/src'),
      '@natural-js/data': resolve(__dirname, './packages/data/src'),
      '@natural-js/ui': resolve(__dirname, './packages/ui/src'),
      '@natural-js/ui-shell': resolve(__dirname, './packages/ui-shell/src'),
      '@natural-js/template': resolve(__dirname, './packages/template/src'),
      '@natural-js/code': resolve(__dirname, './packages/code/src'),
      '@natural-js/natural': resolve(__dirname, './packages/natural/src'),
    },
  },
});

