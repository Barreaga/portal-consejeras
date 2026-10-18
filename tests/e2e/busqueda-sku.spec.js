// busqueda-sku.spec.js
// Casos CP-07 y CP-08 de la RTM (HU-04), antes manuales.
// Usan el catalogo real de Supabase (solo lectura).
// Se corren con: npm run test:e2e

/* global localStorage */

const { test, expect } = require('@playwright/test');

// La sesion se guarda en localStorage (ver sesion.js). Para estas pruebas
// la ponemos directo, porque lo que se prueba es la busqueda, no el login.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sesion', JSON.stringify({ codigo: 'PRUEBA-E2E', nombre: 'Consejera de Prueba' }));
  });
  await page.goto('/catalogo.html');
  await expect(page.locator('.tarjeta-producto').first()).toBeVisible();
});

test('CP-07 | SKU existente muestra ese producto', async ({ page }) => {
  await page.fill('#buscar-sku', '0004');
  await page.click('#btn-buscar');

  const tarjetas = page.locator('.tarjeta-producto');
  await expect(tarjetas).toHaveCount(1);
  await expect(tarjetas.first()).toContainText('0004');
  await expect(page.locator('#mensaje-busqueda')).toBeHidden();
});

test('CP-08 | SKU inexistente avisa sin resultados', async ({ page }) => {
  await page.fill('#buscar-sku', 'XYZ999');
  await page.click('#btn-buscar');

  await expect(page.locator('.tarjeta-producto')).toHaveCount(0);
  await expect(page.locator('#mensaje-busqueda')).toHaveText('No se encontro ningun producto con ese SKU.');
});
