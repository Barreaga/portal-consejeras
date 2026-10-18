// playwright.compat.config.js
// Matriz de compatibilidad del NFR-06: Chrome, Firefox y Edge, en
// escritorio (1920x1080) y celular (390x844). Son 6 combinaciones.
// Se corre con: npm run test:compat
// Edge y Firefox se usan desde la instalacion de Windows (channel msedge y
// moz-firefox). El Firefox que descarga Playwright no se pudo abrir en
// esta computadora porque Windows bloquea el ejecutable.

const { defineConfig } = require('@playwright/test');

const ESCRITORIO = { width: 1920, height: 1080 };
const CELULAR = { width: 390, height: 844 };

const NAVEGADORES = [
  { nombre: 'chrome', use: { browserName: 'chromium' } },
  { nombre: 'firefox', use: { browserName: 'firefox', channel: 'moz-firefox' } },
  { nombre: 'edge', use: { browserName: 'chromium', channel: 'msedge' } }
];

const proyectos = [];
for (const navegador of NAVEGADORES) {
  proyectos.push({ name: navegador.nombre + '-escritorio', use: { ...navegador.use, viewport: ESCRITORIO } });
  proyectos.push({ name: navegador.nombre + '-celular', use: { ...navegador.use, viewport: CELULAR } });
}

module.exports = defineConfig({
  testDir: './tests/compat',
  timeout: 30000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  projects: proyectos,
  webServer: {
    command: 'node tests/e2e/servidor.js',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: true
  }
});
