// rls.test.js
//
// PRUEBA DE SEGURIDAD (NFR-04b): Row Level Security en Supabase.
// Se conecta a la base de datos real con la misma URL y la misma llave
// publishable que usa el sitio (js/supabaseClient.js), o sea, con lo mismo
// que tiene cualquier persona que abre la pagina.
//
// No corre con "npm test" ni en el QA Gate, porque necesita internet y
// escribe un pedido de prueba en la base. Se corre aparte con:
//   npm run test:seguridad
//
// Cuidado con los datos reales:
// - El unico registro que se crea es un pedido cuyo numero empieza con
//   "PRUEBA-RLS-". Queda en la tabla pedidos y hay que borrarlo a mano
//   desde el panel de Supabase.
// - Los UPDATE y DELETE sobre productos y consejeras se mandan con
//   "handling=strict, max-affected=0". Si RLS no protegiera y la operacion
//   tocara alguna fila, PostgREST deshace todo y devuelve el error
//   PGRST124. Asi la prueba detecta la falla sin cambiar datos reales.

/* global fetch, __dirname */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Leemos la URL y la llave del mismo archivo que usa el sitio,
// para no copiar la llave en otro lado.
const cliente = fs.readFileSync(path.join(__dirname, '../../js/supabaseClient.js'), 'utf8');
const SUPABASE_URL = cliente.match(/SUPABASE_URL = '([^']+)'/)[1];
const SUPABASE_KEY = cliente.match(/SUPABASE_KEY = '([^']+)'/)[1];
const API = SUPABASE_URL + '/rest/v1/';

const SKU_REAL = '0001';
const CODIGO_REAL = '3311';
const NUMERO_PRUEBA = 'PRUEBA-RLS-' + Date.now();

const PROTEGIDO = 'handling=strict, max-affected=0, return=representation';

async function pedir(metodo, ruta, cuerpo, prefer) {
  const cabeceras = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };
  if (prefer) {
    cabeceras.Prefer = prefer;
  }

  const respuesta = await fetch(API + ruta, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });

  const texto = await respuesta.text();
  return { estado: respuesta.status, datos: texto ? JSON.parse(texto) : null };
}

// Revisa que una escritura no haya tocado ninguna fila.
// Con RLS, Supabase no siempre da error: puede responder bien pero con
// una lista vacia (0 filas afectadas). Si respondiera con PGRST124, quiere
// decir que si iba a afectar filas y RLS no protegio.
function noAfectoFilas(r) {
  assert.notStrictEqual(r.datos && r.datos.code, 'PGRST124', 'RLS NO protegio: la operacion iba a afectar filas');
  assert.ok(r.estado < 300 || r.estado === 401 || r.estado === 403, 'respuesta inesperada: ' + JSON.stringify(r));
  if (r.estado < 300) {
    assert.deepStrictEqual(r.datos, []);
  }
}

let productoAntes;
let consejeraAntes;

// ─── (a) Lectura permitida ───

test('SEG-01 | SELECT en productos funciona', async () => {
  const r = await pedir('GET', 'productos?select=sku,nombre,precio,agotado&sku=eq.' + SKU_REAL);
  assert.strictEqual(r.estado, 200);
  assert.strictEqual(r.datos.length, 1);
  productoAntes = r.datos[0];
});

test('SEG-02 | SELECT en consejeras funciona', async () => {
  const r = await pedir('GET', 'consejeras?select=codigo,nombre,estado&codigo=eq.' + CODIGO_REAL);
  assert.strictEqual(r.estado, 200);
  assert.strictEqual(r.datos.length, 1);
  consejeraAntes = r.datos[0];
});

// ─── (b) Crear pedidos si esta permitido ───

test('SEG-03 | INSERT en pedidos funciona (pedido de prueba)', async () => {
  const r = await pedir('POST', 'pedidos', {
    numero: NUMERO_PRUEBA,
    codigo_consejera: CODIGO_REAL,
    total: 0
  }, 'return=representation');

  assert.strictEqual(r.estado, 201, JSON.stringify(r.datos));
  assert.strictEqual(r.datos[0].numero, NUMERO_PRUEBA);
});

// ─── (c) UPDATE no modifica nada ───

test('SEG-04 | UPDATE en productos no modifica el precio', async () => {
  const r = await pedir('PATCH', 'productos?sku=eq.' + SKU_REAL, { precio: 1 }, PROTEGIDO);
  noAfectoFilas(r);

  const despues = await pedir('GET', 'productos?select=sku,nombre,precio,agotado&sku=eq.' + SKU_REAL);
  assert.deepStrictEqual(despues.datos[0], productoAntes);
});

test('SEG-05 | UPDATE en consejeras no modifica el estado', async () => {
  const r = await pedir('PATCH', 'consejeras?codigo=eq.' + CODIGO_REAL, { estado: 'inactiva' }, PROTEGIDO);
  noAfectoFilas(r);

  const despues = await pedir('GET', 'consejeras?select=codigo,nombre,estado&codigo=eq.' + CODIGO_REAL);
  assert.deepStrictEqual(despues.datos[0], consejeraAntes);
});

test('SEG-06 | UPDATE del pedido de prueba no cambia el total', async () => {
  const r = await pedir('PATCH', 'pedidos?numero=eq.' + NUMERO_PRUEBA, { total: 999 }, 'return=representation');
  noAfectoFilas(r);

  const despues = await pedir('GET', 'pedidos?select=numero,total&numero=eq.' + NUMERO_PRUEBA);
  assert.strictEqual(despues.datos.length, 1);
  assert.strictEqual(Number(despues.datos[0].total), 0);
});

// ─── (d) DELETE no borra nada ───

test('SEG-07 | DELETE en productos no borra el producto', async () => {
  const r = await pedir('DELETE', 'productos?sku=eq.' + SKU_REAL, null, PROTEGIDO);
  noAfectoFilas(r);

  const despues = await pedir('GET', 'productos?select=sku&sku=eq.' + SKU_REAL);
  assert.strictEqual(despues.datos.length, 1);
});

test('SEG-08 | DELETE en consejeras no borra la consejera', async () => {
  const r = await pedir('DELETE', 'consejeras?codigo=eq.' + CODIGO_REAL, null, PROTEGIDO);
  noAfectoFilas(r);

  const despues = await pedir('GET', 'consejeras?select=codigo&codigo=eq.' + CODIGO_REAL);
  assert.strictEqual(despues.datos.length, 1);
});

test('SEG-09 | DELETE del pedido de prueba no lo borra', async () => {
  const r = await pedir('DELETE', 'pedidos?numero=eq.' + NUMERO_PRUEBA, null, 'return=representation');
  noAfectoFilas(r);

  const despues = await pedir('GET', 'pedidos?select=numero&numero=eq.' + NUMERO_PRUEBA);
  assert.strictEqual(despues.datos.length, 1);
});

// ─── (e) INSERT no autorizado se rechaza ───

const SKU_PRUEBA = 'PRUEBA-RLS-' + Date.now();

// Revisa que RLS rechace un INSERT: Postgres responde 401 o 403 con el
// codigo 42501 (violacion de politica de seguridad).
function insertRechazado(r) {
  assert.ok(r.estado === 401 || r.estado === 403, 'RLS NO protegio: el INSERT respondio ' + r.estado);
  assert.strictEqual(r.datos.code, '42501');
}

test('SEG-10 | INSERT en productos se rechaza', async () => {
  const r = await pedir('POST', 'productos', {
    sku: SKU_PRUEBA,
    nombre: 'Producto de prueba RLS',
    precio: 1,
    categoria: 'Prueba',
    agotado: false
  }, 'return=representation');
  insertRechazado(r);

  const despues = await pedir('GET', 'productos?select=sku&sku=eq.' + SKU_PRUEBA);
  assert.strictEqual(despues.datos.length, 0);
});

test('SEG-11 | INSERT en consejeras se rechaza', async () => {
  const codigo = 'PRUEBA-' + Date.now();
  const r = await pedir('POST', 'consejeras', {
    codigo: codigo,
    clave: 'prueba-rls',
    nombre: 'Consejera de prueba RLS',
    estado: 'activa'
  }, 'return=representation');
  insertRechazado(r);

  const despues = await pedir('GET', 'consejeras?select=codigo&codigo=eq.' + codigo);
  assert.strictEqual(despues.datos.length, 0);
});

// ─── (f) lineas_pedido: UPDATE y DELETE no tocan nada ───
// Se usa max-affected=0: si RLS no protegiera, PostgREST deshace todo.
// Si la tabla esta vacia la prueba no demostraria nada, por eso se omite.

async function hayLineas() {
  const r = await pedir('GET', 'lineas_pedido?select=numero_pedido&limit=1');
  return r.estado === 200 && r.datos.length === 1;
}

test('SEG-12 | UPDATE en lineas_pedido no modifica nada', async (t) => {
  if (!(await hayLineas())) {
    t.skip('lineas_pedido esta vacia, no hay nada que probar');
    return;
  }
  const r = await pedir('PATCH', 'lineas_pedido?cantidad=gte.0', { cantidad: 99 }, PROTEGIDO);
  noAfectoFilas(r);
});

test('SEG-13 | DELETE en lineas_pedido no borra nada', async (t) => {
  if (!(await hayLineas())) {
    t.skip('lineas_pedido esta vacia, no hay nada que probar');
    return;
  }
  const r = await pedir('DELETE', 'lineas_pedido?cantidad=gte.0', null, PROTEGIDO);
  noAfectoFilas(r);

  assert.ok(await hayLineas());
});

// ─── (g) Limitacion conocida (docs/arquitectura-actualizacion.md, 1.8) ───

test('SEG-14 | LIMITACION: la clave de las consejeras se puede leer con la llave publica', async () => {
  // Esta prueba pasa porque la limitacion existe. No imprime la clave.
  // Si algun dia se usa Supabase Auth y deja de ser legible, va a fallar,
  // y ese fallo es la buena noticia: hay que actualizar la documentacion.
  const r = await pedir('GET', 'consejeras?select=clave&codigo=eq.' + CODIGO_REAL);
  assert.strictEqual(r.estado, 200);
  assert.strictEqual(r.datos.length, 1);
  assert.strictEqual(typeof r.datos[0].clave, 'string');
  assert.ok(r.datos[0].clave.length > 0);
});
