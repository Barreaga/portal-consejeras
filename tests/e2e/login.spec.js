// login.spec.js
// Casos CP-02, CP-03 y CP-04 de la RTM (HU-02), antes manuales.
// Se corren con: npm run test:e2e

/* global process */

const { test, expect } = require('@playwright/test');

// Consejera inventada solo para CP-02 (variante simulada). No existe en
// la base de datos: la respuesta de Supabase se reemplaza en la prueba.
const CONSEJERA_FICTICIA = {
  codigo: 'PRUEBA-E2E',
  clave: 'clave-de-prueba-e2e',
  nombre: 'Consejera de Prueba',
  estado: 'activa'
};

async function llenarLogin(page, codigo, clave) {
  await page.goto('/login.html');
  await page.fill('#codigo', codigo);
  await page.fill('#clave', clave);
  await page.click('#btn-entrar');
}

test('CP-02 | login correcto entra al dashboard (respuesta de Supabase simulada)', async ({ page }) => {
  // Reemplazamos la respuesta de la tabla consejeras para no depender
  // de una contrasena real.
  await page.route('**/rest/v1/consejeras**', async (ruta) => {
    const aceptaObjeto = (ruta.request().headers().accept || '').indexOf('vnd.pgrst.object') !== -1;
    await ruta.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(aceptaObjeto ? CONSEJERA_FICTICIA : [CONSEJERA_FICTICIA])
    });
  });

  await llenarLogin(page, CONSEJERA_FICTICIA.codigo, CONSEJERA_FICTICIA.clave);

  await expect(page).toHaveURL(/dashboard\.html$/);
  await expect(page.locator('#nombre-consejera')).toHaveText(CONSEJERA_FICTICIA.nombre);
});

// Variante contra la base real. Solo corre si se ponen las credenciales
// en variables de entorno, para no escribir contrasenas en el codigo:
//   E2E_CODIGO=... E2E_CLAVE=... npm run test:e2e
test('CP-02 | login correcto entra al dashboard (base de datos real)', async ({ page }) => {
  const codigo = process.env.E2E_CODIGO;
  const clave = process.env.E2E_CLAVE;
  test.skip(!codigo || !clave, 'Faltan E2E_CODIGO y E2E_CLAVE');

  await llenarLogin(page, codigo, clave);
  await expect(page).toHaveURL(/dashboard\.html$/);
});

test('CP-03 | contrasena incorrecta no entra y avisa', async ({ page }) => {
  // 3311 es una consejera activa de la base real; la clave es inventada.
  await llenarLogin(page, '3311', 'clave-incorrecta-e2e');

  await expect(page.locator('#mensaje')).toHaveText('Codigo o contrasena incorrectos.');
  await expect(page).toHaveURL(/login\.html$/);
});

test('CP-03 | codigo que no existe da el mismo aviso', async ({ page }) => {
  await llenarLogin(page, '0000', 'clave-incorrecta-e2e');

  await expect(page.locator('#mensaje')).toHaveText('Codigo o contrasena incorrectos.');
  await expect(page).toHaveURL(/login\.html$/);
});

test('CP-04 | campos vacios piden llenarlos', async ({ page }) => {
  await llenarLogin(page, '', '');

  await expect(page.locator('#mensaje')).toHaveText('Complete ambos campos.');
  await expect(page).toHaveURL(/login\.html$/);
});

test('CP-04 | solo el codigo lleno tambien pide llenarlos', async ({ page }) => {
  await llenarLogin(page, '3311', '');

  await expect(page.locator('#mensaje')).toHaveText('Complete ambos campos.');
});
