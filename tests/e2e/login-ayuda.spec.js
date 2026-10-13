// login-ayuda.spec.js
// Leyenda de ayuda y boton para mostrar u ocultar la contrasena.
// Se corren con: npm run test:e2e

const { test, expect } = require('@playwright/test');

test('el login muestra la leyenda de ayuda de los campos', async ({ page }) => {
  await page.goto('/login.html');

  await expect(page.locator('#ayuda-codigo')).toHaveText('Es el codigo de 4 numeros que le dio el programa.');
  await expect(page.locator('#ayuda-clave')).toHaveText('Distingue entre mayusculas y minusculas.');
  await expect(page.locator('#codigo')).toHaveAttribute('aria-describedby', 'ayuda-codigo');
});

test('el boton muestra y oculta la contrasena sin borrarla', async ({ page }) => {
  await page.goto('/login.html');
  await page.fill('#clave', 'secreta123');

  await page.click('#btn-ver-clave');
  await expect(page.locator('#clave')).toHaveAttribute('type', 'text');
  await expect(page.locator('#btn-ver-clave')).toHaveText('Ocultar');
  await expect(page.locator('#btn-ver-clave')).toHaveAttribute('aria-pressed', 'true');

  await page.click('#btn-ver-clave');
  await expect(page.locator('#clave')).toHaveAttribute('type', 'password');
  await expect(page.locator('#btn-ver-clave')).toHaveText('Mostrar');
  await expect(page.locator('#clave')).toHaveValue('secreta123');
});
