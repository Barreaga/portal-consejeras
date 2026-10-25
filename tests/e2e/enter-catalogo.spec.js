// enter-catalogo.spec.js
// La tecla Enter en la busqueda por SKU y en los filtros de precio debe
// hacer lo mismo que el boton. Es el mismo problema que tuvo el login
// (issue #2), ahora en el catalogo.
// Usan el catalogo real de Supabase (solo lectura).
// Se corren con: npm run test:e2e

/* global localStorage */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sesion', JSON.stringify({ codigo: 'PRUEBA-E2E', nombre: 'Consejera de Prueba' }));
  });
  await page.goto('/catalogo.html');
  await expect(page.locator('.tarjeta-producto')).toHaveCount(16);
});

test('Enter en la busqueda por SKU busca igual que el boton', async ({ page }) => {
  await page.fill('#buscar-sku', '0004');
  await page.press('#buscar-sku', 'Enter');

  const tarjetas = page.locator('.tarjeta-producto');
  await expect(tarjetas).toHaveCount(1);
  await expect(tarjetas.first()).toContainText('0004');
});

test('Enter en la busqueda por SKU avisa cuando no hay resultados', async ({ page }) => {
  await page.fill('#buscar-sku', 'XYZ999');
  await page.press('#buscar-sku', 'Enter');

  await expect(page.locator('.tarjeta-producto')).toHaveCount(0);
  await expect(page.locator('#mensaje-busqueda')).toHaveText('No se encontro ningun producto con ese SKU.');
});

test('Enter en el precio maximo aplica los filtros', async ({ page }) => {
  await page.fill('#filtro-precio-max', '100');
  await page.press('#filtro-precio-max', 'Enter');

  // Quedan menos de 16 productos y todos cuestan Q100.00 o menos
  await expect(page.locator('.tarjeta-producto')).not.toHaveCount(16);
  const precios = await page.locator('.tarjeta-producto p.fw-semibold').allTextContents();
  expect(precios.length).toBeGreaterThan(0);
  for (const texto of precios) {
    expect(Number(texto.replace('Q', ''))).toBeLessThanOrEqual(100);
  }
});

test('Enter en el precio minimo aplica los filtros', async ({ page }) => {
  // El producto mas caro es 0008 (Q320.00): con minimo 300 queda solo ese
  await page.fill('#filtro-precio-min', '300');
  await page.press('#filtro-precio-min', 'Enter');

  await expect(page.locator('.tarjeta-producto')).toHaveCount(1);
  await expect(page.locator('.tarjeta-producto').first()).toContainText('0008');
});
