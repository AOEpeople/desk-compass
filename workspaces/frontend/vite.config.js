import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Load version number from parent project
const file = fileURLToPath(new URL('../../package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

// https://vitejs.dev/config/
export default async ({ mode }) => {
  const loaded = loadEnv(mode, '../../environments', ['API', 'APP']);
  process.env = { ...process.env, ...loaded };

  return defineConfig({
    plugins: [svelte()],
    mode: 'development',
    envDir: '../../environments',
    clearScreen: false,
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
    },
    server: {
      port: process.env.APP_PORT,
      headers: {
        'Content-Security-Policy': `default-src 'self' http://localhost:${process.env.APP_PORT} https://api.iconify.design; img-src http://localhost:${process.env.APP_PORT} data: *.placeholder.com; child-src 'none'; style-src 'unsafe-inline'`,
      },
      proxy: {
        '/api': `http://localhost:${process.env.API_PORT}`,
      },
    },
    test: {
      globals: true,
      mockReset: true,
      environment: 'jsdom',
      // in-source testing
      includeSource: ['src/**/*.{js,ts,svelte}'],
      // Add @testing-library/jest-dom matchers & setup MSW
      setupFiles: ['./setupTest.js', './src/mocks/mockViewportSingleton.ts', './src/mocks/setup.ts', './src/mocks/mockI18n.ts'],
      coverage: {
        provider: 'v8',
        reporter: [['text', { skipFull: true }], 'json', 'html', 'cobertura', 'text-summary'],
        exclude: ['setupTest.js', 'src/mocks', 'src/environments', 'src/assets', 'src/i18n', 'src/**/*.spec.ts', 'src/**/*.spec.svelte'],
      },
      deps: {
        // Put Svelte component here, e.g., inline: [/svelte-multiselect/, /msw/]
        inline: [/msw/],
      },
    },
  });
};
