// tema.spec.js
// Modo claro y oscuro (js/tema.js).
// Se corren con: npm run test:e2e

const { test, expect } = require('@playwright/test');

test('el boton cambia a modo oscuro y se recuerda al recargar', async ({ page }) => {
  await page.goto('/index.html');
  const html = page.locator('html');

  await expect(html).toHaveAttribute('data-bs-theme', 'light');
  await expect(page.locator('#btn-tema')).toHaveText('Modo oscuro');

  await page.click('#btn-tema');
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
  await expect(page.locator('#btn-tema')).toHaveText('Modo claro');

  await page.reload();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');

  await page.goto('/login.html');
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
});

test('el boton regresa a modo claro', async ({ page }) => {
  await page.goto('/login.html');
  await page.click('#btn-tema');
  await page.click('#btn-tema');

  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'light');
  await expect(page.locator('#btn-tema')).toHaveText('Modo oscuro');
});
