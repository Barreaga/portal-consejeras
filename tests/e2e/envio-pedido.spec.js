// envio-pedido.spec.js
// Envio del pedido (HU-07) y "Mis pedidos enviados" en el dashboard.
//
// Estas pruebas NO escriben en la base real: la llamada a la funcion
// registrar_pedido y la lectura de pedidos se reemplazan con page.route.
// El catalogo si se lee de Supabase (solo lectura).
// Se corren con: npm run test:e2e

/* global localStorage, window, setTimeout */

const { test, expect } = require('@playwright/test');

const SESION = { codigo: 'PRUEBA-E2E', nombre: 'Consejera de Prueba' };

// RN-01: 4 x Q100.00 = Q400.00 exactos
const CARRITO = [{ sku: '0002', nombre: 'Locion Corporal', precio: 100, cantidad: 4 }];

async function abrirCatalogoConCarrito(page) {
  await page.addInitScript(([sesion, carrito]) => {
    localStorage.setItem('sesion', JSON.stringify(sesion));
    localStorage.setItem('pedido', JSON.stringify(carrito));
  }, [SESION, CARRITO]);
  await page.goto('/catalogo.html');
  await expect(page.locator('#lineas-pedido tr')).toHaveCount(1);
}

test('CP-17 | con Q400.00 exactos envia y muestra el numero de confirmacion', async ({ page }) => {
  await page.route('**/rest/v1/rpc/registrar_pedido', (ruta) =>
    ruta.fulfill({ status: 200, contentType: 'application/json', body: '400' }));

  await abrirCatalogoConCarrito(page);
  await page.click('#btn-enviar');

  await expect(page.locator('#mensaje-pedido')).toContainText('Su numero de confirmacion es PED-');
  await expect(page.locator('#lineas-pedido tr')).toHaveCount(0);
  await expect(page.locator('#total-pedido')).toHaveText('Q0.00');
});

test('CP-18 | doble clic en enviar registra un solo pedido', async ({ page }) => {
  let llamadas = 0;
  await page.route('**/rest/v1/rpc/registrar_pedido', async (ruta) => {
    llamadas++;
    // Respuesta lenta, para que el segundo clic llegue mientras se envia
    await new Promise((resolver) => setTimeout(resolver, 1000));
    await ruta.fulfill({ status: 200, contentType: 'application/json', body: '400' });
  });

  await abrirCatalogoConCarrito(page);

  // Dos clics seguidos, sin esperar entre uno y otro
  await page.evaluate(() => {
    const boton = document.getElementById('btn-enviar');
    boton.click();
    boton.click();
  });

  await expect(page.locator('#btn-enviar')).toBeDisabled();
  await expect(page.locator('#mensaje-pedido')).toContainText('Pedido enviado');
  expect(llamadas).toBe(1);
});

test('NFR-03 | si falla la red, avisa y el pedido no se pierde', async ({ page }) => {
  await page.route('**/rest/v1/rpc/registrar_pedido', (ruta) => ruta.abort('failed'));

  await abrirCatalogoConCarrito(page);
  await page.click('#btn-enviar');

  await expect(page.locator('#mensaje-pedido')).toContainText('Revise su conexion');
  await expect(page.locator('#lineas-pedido tr')).toHaveCount(1);
  await expect(page.locator('#btn-enviar')).toBeEnabled();

  const guardado = await page.evaluate(() => JSON.parse(localStorage.getItem('pedido')));
  expect(guardado).toEqual(CARRITO);
});

test('NFR-04a | el historial muestra los pedidos de la consejera sin ejecutar HTML', async ({ page }) => {
  let consulta = '';
  await page.route('**/rest/v1/pedidos**', (ruta) => {
    consulta = ruta.request().url();
    return ruta.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        numero: '<img src=x onerror="window.ataque=1">',
        fecha: '2026-10-12T20:00:00+00:00',
        total: 450,
        lineas_pedido: [{ id: 1 }, { id: 2 }]
      }])
    });
  });

  await page.addInitScript((sesion) => {
    localStorage.setItem('sesion', JSON.stringify(sesion));
  }, SESION);
  await page.goto('/dashboard.html');

  const celdas = page.locator('#lineas-pedidos-enviados tr').first().locator('td');
  await expect(celdas.nth(0)).toHaveText('<img src=x onerror="window.ataque=1">');
  await expect(celdas.nth(2)).toHaveText('2');
  await expect(celdas.nth(3)).toHaveText('Q450.00');

  expect(await page.evaluate(() => window.ataque)).toBeUndefined();
  expect(consulta).toContain('codigo_consejera=eq.PRUEBA-E2E');
});
