// casos-rtm.spec.js
// Casos de la RTM que antes eran solo manuales: CP-01, CP-05, CP-06,
// CP-15, CP-16 (en pantalla) y CP-19.
// Solo leen de Supabase (el catalogo). No escriben en la base: en CP-16 la
// llamada a registrar_pedido se bloquea y se revisa que nunca se haga.
// Se corren con: npm run test:e2e

/* global localStorage, sessionStorage */

const { test, expect } = require('@playwright/test');

const SESION = { codigo: 'PRUEBA-E2E', nombre: 'Consejera de Prueba' };

async function entrarCon(page, carrito) {
  await page.addInitScript(([sesion, lineas]) => {
    // Solo la primera vez: si no, al recargar se volveria a poner la sesion
    if (!sessionStorage.getItem('preparado')) {
      sessionStorage.setItem('preparado', '1');
      localStorage.setItem('sesion', JSON.stringify(sesion));
      localStorage.setItem('pedido', JSON.stringify(lineas));
    }
  }, [SESION, carrito || []]);
}

test('CP-01 | la landing page muestra la informacion del programa', async ({ page }) => {
  await page.goto('/index.html');

  await expect(page.locator('h1')).toHaveText('Haz crecer tu negocio');
  await expect(page.locator('.card-title')).toHaveText(['1. Registrate', '2. Arma tu pedido', '3. Envialo']);
  await expect(page.getByText('El pedido minimo es de Q400.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ingresar al portal' })).toHaveAttribute('href', 'login.html');
});

test('CP-05 | sin sesion, el dashboard manda al login', async ({ page }) => {
  await page.goto('/dashboard.html');
  await expect(page).toHaveURL(/login\.html$/);
});

test('CP-05 | sin sesion, el catalogo manda al login', async ({ page }) => {
  await page.goto('/catalogo.html');
  await expect(page).toHaveURL(/login\.html$/);
});

test('CP-06 | los productos agotados aparecen marcados y sin boton de agregar', async ({ page }) => {
  await entrarCon(page);
  await page.goto('/catalogo.html');

  const tarjetas = page.locator('.tarjeta-producto');
  await expect(tarjetas).toHaveCount(16);

  // RN-03: en el catalogo real hay 3 agotados (0003, 0006 y 0012)
  const agotadas = page.locator('.tarjeta-producto.producto-agotado');
  await expect(agotadas).toHaveCount(3);
  await expect(agotadas.locator('.badge')).toHaveText(['Agotado', 'Agotado', 'Agotado']);
  await expect(agotadas.locator('button')).toHaveCount(0);
  await expect(agotadas.locator('p.text-muted')).toHaveText(['0003', '0006', '0012']);
});

test('CP-15 | al eliminar una linea se recalcula el total', async ({ page }) => {
  await entrarCon(page);
  await page.goto('/catalogo.html');

  // RN-02: cantidades validas
  await page.fill('#cant-0002', '2');
  await page.locator('#cant-0002 + button').click();
  await page.fill('#cant-0005', '1');
  await page.locator('#cant-0005 + button').click();

  // 2 x Q100.00 + 1 x Q85.00
  await expect(page.locator('#total-pedido')).toHaveText('Q285.00');

  await page.locator('#lineas-pedido tr').first().getByRole('button', { name: 'Quitar' }).click();

  await expect(page.locator('#lineas-pedido tr')).toHaveCount(1);
  await expect(page.locator('#total-pedido')).toHaveText('Q85.00');
});

test('CP-16 | con Q399.99 no deja enviar y dice cuanto falta', async ({ page }) => {
  let llamadas = 0;
  await page.route('**/rest/v1/rpc/registrar_pedido', (ruta) => {
    llamadas++;
    return ruta.abort('failed');
  });

  // RN-01: 3 x Q133.33 = Q399.99
  await entrarCon(page, [{ sku: '0001', nombre: 'Crema Hidratante', precio: 133.33, cantidad: 3 }]);
  await page.goto('/catalogo.html');
  await expect(page.locator('#total-pedido')).toHaveText('Q399.99');

  await page.click('#btn-enviar');

  await expect(page.locator('#mensaje-pedido')).toHaveText('Le faltan Q0.01 para el minimo.');
  await expect(page.locator('#lineas-pedido tr')).toHaveCount(1);
  expect(llamadas).toBe(0);
});

test('CP-19 | despues de salir, el boton atras no vuelve a entrar', async ({ page }) => {
  await entrarCon(page);
  await page.goto('/catalogo.html');
  await page.goto('/dashboard.html');
  await expect(page.locator('#saludo')).toHaveText(SESION.nombre);

  await page.click('#btn-salir');
  await expect(page).toHaveURL(/index\.html$/);

  await page.goBack();
  await expect(page).toHaveURL(/login\.html$/);
  expect(await page.evaluate(() => localStorage.getItem('sesion'))).toBeNull();
});
