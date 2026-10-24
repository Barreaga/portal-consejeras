// xss.spec.js
// NFR-04a: los campos de texto no deben dejar que se ejecute codigo.
// En cada campo escribimos un texto con etiquetas (img con onerror y script)
// y revisamos tres cosas: que no se ejecute (window.xss se queda sin
// definir), que no salga ninguna alerta y que la etiqueta no se cree en
// la pagina como elemento.
// Solo leen de Supabase: no escriben nada en la base.
// Se corren con: npm run test:e2e

/* global localStorage, sessionStorage, window */

const { test, expect } = require('@playwright/test');

const SESION = { codigo: 'PRUEBA-E2E', nombre: 'Consejera de Prueba' };

const ATAQUES = [
  '<img src=x onerror="window.xss=1">',
  '<script>window.xss=1</script>'
];

async function entrarCon(page) {
  await page.addInitScript((sesion) => {
    if (!sessionStorage.getItem('preparado')) {
      sessionStorage.setItem('preparado', '1');
      localStorage.setItem('sesion', JSON.stringify(sesion));
      localStorage.setItem('pedido', JSON.stringify([]));
    }
  }, SESION);
}

// Anota si salio alguna alerta (alert, confirm o prompt)
function vigilarAlertas(page) {
  const alertas = [];
  page.on('dialog', async (dialogo) => {
    alertas.push(dialogo.message());
    await dialogo.dismiss();
  });
  return alertas;
}

async function revisarQueNoSeEjecuto(page, alertas) {
  // Damos un momento por si algun onerror tarda en dispararse
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.xss)).toBeUndefined();
  expect(alertas).toEqual([]);
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await expect(page.locator('main script, #lista-productos script, #mensaje-pedido script')).toHaveCount(0);
}

for (const ataque of ATAQUES) {
  test('NFR-04a | busqueda por SKU con ' + ataque, async ({ page }) => {
    const alertas = vigilarAlertas(page);
    await entrarCon(page);
    await page.goto('/catalogo.html');
    await expect(page.locator('.tarjeta-producto')).toHaveCount(16);

    await page.fill('#buscar-sku', ataque);
    await page.click('#btn-buscar');

    // No coincide con ningun SKU: avisa y no muestra el texto como HTML
    await expect(page.locator('#mensaje-busqueda')).toHaveText('No se encontro ningun producto con ese SKU.');
    await revisarQueNoSeEjecuto(page, alertas);
  });

  test('NFR-04a | cantidad con ' + ataque, async ({ page }) => {
    const alertas = vigilarAlertas(page);
    await entrarCon(page);
    await page.goto('/catalogo.html');
    await expect(page.locator('.tarjeta-producto')).toHaveCount(16);

    await page.fill('#cant-0001', ataque);
    await page.locator('.tarjeta-producto', { hasText: '0001' }).getByRole('button', { name: 'Agregar' }).click();

    // RN-02: se rechaza y no se agrega nada al pedido
    await expect(page.locator('#mensaje-pedido')).toHaveText('La cantidad debe ser un numero.');
    await expect(page.locator('#lineas-pedido tr')).toHaveCount(0);
    await revisarQueNoSeEjecuto(page, alertas);
  });

  test('NFR-04a | filtro de precio con ' + ataque, async ({ page }) => {
    const alertas = vigilarAlertas(page);
    await entrarCon(page);
    await page.goto('/catalogo.html');
    await expect(page.locator('.tarjeta-producto')).toHaveCount(16);

    await page.fill('#filtro-precio-min', ataque);
    await page.fill('#filtro-precio-max', ataque);
    await page.click('#btn-aplicar-filtros');

    // Un limite que no es numero se ignora: siguen los 16 productos
    await expect(page.locator('.tarjeta-producto')).toHaveCount(16);
    await revisarQueNoSeEjecuto(page, alertas);
  });

  test('NFR-04a | login con ' + ataque + ' en el codigo y la clave', async ({ page }) => {
    const alertas = vigilarAlertas(page);
    await page.goto('/login.html');

    await page.fill('#codigo', ataque);
    await page.fill('#clave', ataque);
    await page.click('#btn-entrar');

    await expect(page.locator('#mensaje')).toHaveText('Codigo o contrasena incorrectos.');
    await expect(page).toHaveURL(/login\.html$/);
    await revisarQueNoSeEjecuto(page, alertas);
  });
}
