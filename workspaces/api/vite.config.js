import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    clearScreen: false,
    globals: true,
    mockReset: true,
    includeSource: ['src/**/*.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: [['text', { skipFull: true }], 'json', 'html', 'cobertura', 'text-summary'],
      exclude: ['setupTest.js', 'src/**/*.module.ts', 'src/**/*.spec.ts'],
    },
  },
});
