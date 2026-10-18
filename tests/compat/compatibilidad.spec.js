// compatibilidad.spec.js
// NFR-06: el sitio debe funcionar sin errores en Chrome, Firefox y Edge,
// en escritorio y en celular. Cada prueba corre en las 6 combinaciones
// de playwright.compat.config.js.
//
// Lo que se revisa en cada pagina:
// - que cargue sin errores de JavaScript,
// - que no haya scroll horizontal (la pagina cabe en el ancho),
// - que se vean los elementos principales.
// Lo que no se revisa: si se ve bonito. Eso sigue siendo inspeccion visual.
//
// Solo lee de Supabase (consejeras en el login y el catalogo).
// Se corre con: npm run test:compat

/* global localStorage, document, window, sessionStorage */

const { test, expect } = require('@playwright/test');

const SESION = { codigo: 'PRUEBA-E2E', nombre: 'Consejera de Prueba' };

// Junta los errores de JavaScript que pasen en la pagina
function vigilarErrores(page) {
  const errores = [];
  page.on('pageerror', (error) => errores.push(error.message));
  return errores;
}

async function revisarSinScrollHorizontal(page) {
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra, 'la pagina es mas ancha que la pantalla').toBeLessThanOrEqual(1);
}

async function ponerSesion(page) {
  await page.addInitScript((sesion) => {
    // Firefox tambien corre este script en la pagina en blanco inicial,
    // donde no se puede usar sessionStorage; solo lo hacemos en el sitio.
    if (window.location.protocol !== 'http:') {
      return;
    }
    if (!sessionStorage.getItem('preparado')) {
      sessionStorage.setItem('preparado', '1');
      localStorage.setItem('sesion', JSON.stringify(sesion));
    }
  }, SESION);
}

test('index.html carga y se ve completa', async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.goto('/index.html');

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ingresar al portal' })).toBeVisible();
  await revisarSinScrollHorizontal(page);
  expect(errores).toEqual([]);
});

test('login.html carga y avisa con credenciales incorrectas', async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.goto('/login.html');

  await page.fill('#codigo', '3311');
  await page.fill('#clave', 'clave-incorrecta-compat');
  await page.click('#btn-entrar');

  await expect(page.locator('#mensaje')).toHaveText('Codigo o contrasena incorrectos.');
  await revisarSinScrollHorizontal(page);
  expect(errores).toEqual([]);
});

test('catalogo.html carga los 16 productos y filtra', async ({ page }) => {
  const errores = vigilarErrores(page);
  await ponerSesion(page);
  await page.goto('/catalogo.html');

  await expect(page.locator('.tarjeta-producto')).toHaveCount(16);

  await page.selectOption('#filtro-categoria', 'Maquillaje');
  await page.click('#btn-aplicar-filtros');
  await expect(page.locator('.tarjeta-producto')).toHaveCount(3);

  await revisarSinScrollHorizontal(page);
  expect(errores).toEqual([]);
});

test('dashboard.html carga con la sesion', async ({ page }) => {
  const errores = vigilarErrores(page);
  // El historial se simula vacio para no depender de pedidos reales
  await page.route('**/rest/v1/pedidos**', (ruta) =>
    ruta.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await ponerSesion(page);
  await page.goto('/dashboard.html');

  await expect(page.locator('#saludo')).toHaveText(SESION.nombre);
  await expect(page.locator('#sin-pedidos-enviados')).toBeVisible();
  await revisarSinScrollHorizontal(page);
  expect(errores).toEqual([]);
});
