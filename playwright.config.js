// playwright.config.js
// Configuracion de las pruebas de extremo a extremo (e2e) con Playwright.
// Se corren con: npm run test:e2e
// No forman parte de "npm test" ni del QA Gate, porque necesitan un
// navegador y conexion a internet (Supabase y el CDN de supabase-js).

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.spec.js',
  timeout: 30000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    browserName: 'chromium'
  },
  webServer: {
    command: 'node tests/e2e/servidor.js',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: true
  }
});
